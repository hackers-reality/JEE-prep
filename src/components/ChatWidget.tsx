"use client";

import { useEffect, useRef, useState } from "react";
import MarkdownContent from "./MarkdownContent";
import { getApiKey, getSelectedModel, getChatHistory, saveChatMessage, clearChatHistory, getAIModel, type ChatMessage, type ImagePart } from "@/lib/chat-store";
import { JEE_TUTOR_SYSTEM_PROMPT } from "@/lib/jee-tutor-prompt";

const CHAT_PROXY = "/api/chat";

export function ChatWidget({ topicId, topicTitle, topicContext }: { topicId: string; topicTitle: string; topicContext: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getChatHistory(topicId));
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<ImagePart | null>(null);
  const [thinking, setThinking] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTopicRef = useRef(topicId);

  useEffect(() => { if (lastTopicRef.current !== topicId) { lastTopicRef.current = topicId; setMessages(getChatHistory(topicId)); setConversationId(null); setImage(null); setThinking(""); } }, [topicId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  async function ensureConversation(model: string) {
    if (conversationId) return conversationId;
    const res = await fetch("/api/chat/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: topicTitle, topicId, model }) });
    if (!res.ok) throw new Error("Could not create the saved conversation. Please sign in and try again.");
    const data = await res.json(); setConversationId(data.conversation.id); return data.conversation.id as string;
  }

  async function persistMessage(id: string, message: ChatMessage) {
    const res = await fetch(`/api/chat/conversations/${id}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(message) });
    if (!res.ok) throw new Error("Could not save this message to your account.");
  }

  async function handleImage(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 6 * 1024 * 1024) { setStatus("Image must be 6 MB or smaller."); return; }
    const reader = new FileReader();
    reader.onload = () => setImage({ type: "image_url", image_url: { url: String(reader.result) } });
    reader.readAsDataURL(file);
  }

  function renderMessageContent(content: ChatMessage["content"]) {
    if (typeof content === "string") return <MarkdownContent content={content} />;
    return <div className="space-y-2">{content.map((part, index) => part.type === "text" ? <div key={index}>{part.text}</div> : <img key={index} src={part.image_url.url} alt="Student question" className="max-h-48 rounded border" />)}</div>;
  }

  async function sendMessage() {
    if ((!input.trim() && !image) || loading) return;
    const apiKey = getApiKey();
    if (!apiKey) { setStatus("API key required"); setMessages((prev) => [...prev, { role: "assistant", content: "**NVIDIA API key required.** Add your key in **Settings → NVIDIA NIM API Key**, then try again." }]); return; }

    const model = getSelectedModel();
    const selected = getAIModel(model);
    if (image && !selected?.capabilities.includes("vision")) { setStatus("Choose a multimodal model for image questions."); return; }

    const content = image ? ([...(input.trim() ? [{ type: "text", text: input.trim() }] : []), image] as ChatMessage["content"]) : input.trim();
    const userMsg: ChatMessage = { role: "user", content };
    const updated = [...messages, userMsg]; setMessages(updated); saveChatMessage(topicId, userMsg); setInput(""); setImage(null); setLoading(true); setThinking(""); setStatus("Saving…");
    try {
      const id = await ensureConversation(model); await persistMessage(id, userMsg); setStatus("Analyzing…");
      const contextualPrompt = `${JEE_TUTOR_SYSTEM_PROMPT}\n\nCURRENT TOPIC CONTEXT\nTopic: ${topicTitle}\nPlatform-provided context:\n${topicContext}`;
      const res = await fetch(CHAT_PROXY, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey, model, messages: [{ role: "system", content: contextualPrompt }, ...updated] }) });
      if (!res.ok || !res.body) { const errData = await res.json().catch(() => ({})); throw new Error(errData.error || `AI error: ${res.status}`); }
      setStatus("Thinking…"); const reader = res.body.getReader(); const decoder = new TextDecoder(); let buffer = ""; let reply = ""; let reasoning = "";
      const upsert = (message: ChatMessage) => setMessages((prev) => { const next = [...prev]; if (next.at(-1)?.role === "assistant") next[next.length - 1] = message; else next.push(message); return next; });
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        buffer += decoder.decode(value, { stream: true }); const lines = buffer.split("\n"); buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim(); if (!payload || payload === "[DONE]") continue;
          try {
            const chunk = JSON.parse(payload); const delta = chunk.choices?.[0]?.delta;
            if (typeof delta?.reasoning_content === "string" && delta.reasoning_content) { reasoning += delta.reasoning_content; setThinking(reasoning); }
            if (typeof delta?.content === "string" && delta.content) { reply += delta.content; setThinking(""); setStatus("Writing…"); upsert({ role: "assistant", content: reply }); }
          } catch {}
        }
      }
      reply ||= "The model returned an empty response. Try again or choose another model.";
      const assistantMsg: ChatMessage = { role: "assistant", content: reply }; upsert(assistantMsg); saveChatMessage(topicId, assistantMsg); await persistMessage(id, assistantMsg); setThinking(""); setStatus("Saved");
    } catch (err) { const message = err instanceof Error ? err.message : "Failed to reach AI service."; const errorMsg = { role: "assistant" as const, content: `**AI error:** ${message}` }; setMessages((prev) => [...prev, errorMsg]); setStatus("Error"); }
    finally { setLoading(false); }
  }

  const selectedModel = getAIModel(getSelectedModel());
  return <div className="flex flex-col rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: "var(--paper-bg)", border: "2px solid var(--grid-line)", height: "600px" }}>
    <div className="px-4 py-3 font-hand text-lg font-bold flex items-center justify-between" style={{ backgroundColor: "var(--sticky-yellow)", color: "var(--ink)" }}><div><span>JEE Tutor — {topicTitle}</span><span className="block text-[11px] font-sans font-medium opacity-60">{status}{selectedModel?.capabilities.includes("reasoning") ? " · reasoning enabled" : ""}</span></div><button onClick={() => { clearChatHistory(topicId); setMessages([]); setConversationId(null); }} className="text-xs px-2 py-1 rounded hover:opacity-80" style={{ backgroundColor: "var(--accent-red)", color: "white" }}>Clear local</button></div>
    <div className="px-3 py-2 text-xs text-center font-semibold" style={{ backgroundColor: "var(--accent-red)", color: "white" }}>AI is a JEE study tutor, not an answer key. Verify important numerical results against trusted material.</div>
    <div className="flex-1 overflow-y-auto p-4 space-y-3">{messages.length === 0 && <div className="text-sm opacity-60 text-center mt-8 space-y-2"><p>Ask anything about {topicTitle}.</p><p className="text-xs">Try TEACH, HINT, SOLVE, CHECK, REVISE, or PRACTICE mode.</p></div>}{messages.map((msg, i) => <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}><div className="max-w-[88%] rounded-lg px-4 py-2 text-sm" style={{ backgroundColor: msg.role === "user" ? "var(--sticky-blue)" : "var(--sticky-green)", color: "var(--ink)" }}>{msg.role === "user" ? renderMessageContent(msg.content) : renderMessageContent(msg.content)}</div></div>)}{loading && <div className="flex justify-start"><div className="rounded-lg px-4 py-2 text-sm space-y-2" style={{ backgroundColor: "var(--sticky-green)", color: "var(--ink)" }}>{thinking ? <><div className="text-[11px] font-bold uppercase tracking-wider opacity-60">Thinking</div><div className="text-xs opacity-70 whitespace-pre-wrap max-h-28 overflow-y-auto">{thinking}</div></> : <span className="inline-flex gap-1 items-center"><span className="animate-pulse">●</span><span className="animate-pulse">●</span><span className="animate-pulse">●</span><span className="ml-2">{status}</span></span>}</div></div>}<div ref={messagesEndRef} /></div>
    <div className="p-3 border-t" style={{ borderColor: "var(--grid-line)" }}><div className="flex items-end gap-2"><div className="flex-1 space-y-2">{image && <div className="flex items-center gap-2 text-xs"><img src={image.image_url.url} alt="Attached question" className="h-12 w-12 object-cover rounded border" /><button onClick={() => setImage(null)} className="underline">Remove</button></div>}<textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Ask your JEE doubt…" rows={2} className="w-full px-3 py-2 text-sm rounded border resize-none" style={{ borderColor: "var(--grid-line)", backgroundColor: "white", color: "var(--ink)" }} disabled={loading} /></div><input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleImage(file); e.currentTarget.value = ""; }} /><button onClick={() => fileInputRef.current?.click()} disabled={loading} className="px-3 py-2 text-xs rounded border font-semibold" style={{ borderColor: "var(--grid-line)" }}>Image</button><button onClick={sendMessage} disabled={loading || (!input.trim() && !image)} className="px-4 py-2 text-sm font-bold rounded transition-all" style={{ backgroundColor: loading ? "var(--grid-line)" : "var(--sticky-yellow)", color: "var(--ink)" }}>{loading ? "Working…" : "Send"}</button></div></div>
  </div>;
}
