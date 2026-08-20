"use client";

import { useState } from "react";
import { AIConversationSidebar } from "./AIConversationSidebar";
import MarkdownContent from "./MarkdownContent";
import { loadSavedConversation } from "@/lib/ai-conversations-client";
import { getApiKey, getSelectedModel, type ChatMessage, type MessageContent } from "@/lib/chat-store";
import { buildJeeSystemPrompt } from "@/lib/jee-chat";

function renderUserContent(content: MessageContent) {
  if (typeof content === "string") return content;
  return content.map((part, index) => {
    if (part.type === "text") return <span key={index}>{part.text}</span>;
    return <img key={index} src={part.image_url.url} alt="Attached image" className="max-h-64 rounded mt-2" />;
  });
}

export function AIWorkspace() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready");

  async function selectConversation(id: string) {
    setActiveId(id); setLoading(true);
    try { const data = await loadSavedConversation(id); setMessages((data.messages ?? []).filter((m: ChatMessage) => m.role === "user" || m.role === "assistant")); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Could not load conversation."); }
    finally { setLoading(false); }
  }

  function newConversation() { setActiveId(null); setMessages([]); setInput(""); setStatus("Ready"); }

  async function send() {
    const content = input.trim(); if (!content || loading) return;
    const apiKey = getApiKey();
    if (!apiKey) { setStatus("Add your NVIDIA key in Settings first."); return; }
    setLoading(true); setStatus("Starting…"); setInput("");
    const user: ChatMessage = { role: "user", content };
    let conversationId = activeId;
    try {
      if (!conversationId) {
        const created = await fetch("/api/chat/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: content.slice(0, 60), model: getSelectedModel() }) });
        if (!created.ok) throw new Error("Sign in to save AI conversations.");
        conversationId = (await created.json()).conversation.id; setActiveId(conversationId);
      }
      const next = [...messages, user];
      setMessages(next);
      const saveUser = await fetch(`/api/chat/conversations/${conversationId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(user) });
      if (!saveUser.ok) throw new Error("Could not save your message.");
      setStatus("Analyzing JEE problem…");
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey, model: getSelectedModel(), messages: [{ role: "system", content: buildJeeSystemPrompt() }, ...next] }) });
      if (!response.ok || !response.body) { const error = await response.json().catch(() => ({})); throw new Error(error.error || `AI error: ${response.status}`); }
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ""; let reply = "";
      setMessages([...next, { role: "assistant", content: "" }]); setStatus("Writing JEE-focused response…");
      while (true) { const { value, done } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const lines = buffer.split("\n"); buffer = lines.pop() ?? ""; for (const line of lines) { if (!line.startsWith("data:")) continue; const payload = line.slice(5).trim(); if (!payload || payload === "[DONE]") continue; try { const chunk = JSON.parse(payload); const delta = chunk.choices?.[0]?.delta?.content; if (typeof delta === "string") { reply += delta; setMessages([...next, { role: "assistant", content: reply }]); } } catch {} } }
      const assistant: ChatMessage = { role: "assistant", content: reply || "The model returned an empty response. Try again." };
      setMessages([...next, assistant]);
      const saveAssistant = await fetch(`/api/chat/conversations/${conversationId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(assistant) });
      if (!saveAssistant.ok) throw new Error("The response was generated but could not be saved.");
      setStatus("Saved");
    } catch (error) { setStatus(error instanceof Error ? error.message : "AI request failed."); setMessages((prev) => [...prev, { role: "assistant", content: `**AI error:** ${error instanceof Error ? error.message : "Request failed."}` }]); }
    finally { setLoading(false); }
  }

  return <div className="flex flex-col md:flex-row gap-4 min-h-[620px]">
    <AIConversationSidebar activeId={activeId} onSelect={selectConversation} onNew={newConversation} />
    <section className="flex-1 rounded-xl border flex flex-col overflow-hidden" style={{ borderColor: "var(--grid-line)", backgroundColor: "var(--paper-bg)" }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--grid-line)" }}><div className="text-xs uppercase tracking-widest opacity-50">JEE AI workspace</div><div className="flex items-center justify-between"><h2 className="font-hand text-2xl font-bold">{activeId ? "Continue studying" : "New JEE conversation"}</h2><span className="text-xs opacity-60">{status}</span></div></div>
      <div className="flex-1 overflow-y-auto p-5 space-y-3">{!messages.length ? <div className="h-full min-h-[420px] grid place-items-center text-center"><div><div className="font-hand text-3xl font-bold">Ask the JEE Tutor</div><p className="text-sm opacity-60 mt-2">Doubts, solution checks, concepts and problem solving.</p></div></div> : messages.map((message, index) => <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className="max-w-[88%] rounded-lg p-3 text-sm" style={{ backgroundColor: message.role === "user" ? "var(--sticky-blue)" : "var(--sticky-green)" }}>{message.role === "assistant" ? <MarkdownContent content={typeof message.content === "string" ? message.content : message.content.map((part) => part.type === "text" ? part.text : "[image]").join("\n")} /> : renderUserContent(message.content)}</div></div>)}{loading && <div className="text-xs opacity-60">{status}</div>}</div>
      <div className="p-3 border-t" style={{ borderColor: "var(--grid-line)" }}><div className="flex gap-2"><textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} disabled={loading} rows={2} placeholder="Ask your JEE doubt…" className="flex-1 rounded border px-3 py-2 text-sm resize-none" /><button onClick={send} disabled={loading || !input.trim()} className="self-end rounded px-4 py-2 text-sm font-bold" style={{ backgroundColor: "var(--sticky-yellow)", color: "var(--ink)" }}>{loading ? "Working…" : "Send"}</button></div></div>
    </section>
  </div>;
}
