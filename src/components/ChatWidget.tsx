"use client";

import { useEffect, useRef, useState } from "react";
import MarkdownContent from "./MarkdownContent";
import { getApiKey, getSelectedModel, getChatHistory, saveChatMessage, clearChatHistory, type ChatMessage } from "@/lib/chat-store";

const CHAT_PROXY = "/api/chat";

export function ChatWidget({ topicId, topicTitle, topicContext }: { topicId: string; topicTitle: string; topicContext: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getChatHistory(topicId));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTopicRef = useRef(topicId);

  useEffect(() => { if (lastTopicRef.current !== topicId) { lastTopicRef.current = topicId; setMessages(getChatHistory(topicId)); } }, [topicId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const apiKey = getApiKey();
    if (!apiKey) { setStatus("API key required"); setMessages((prev) => [...prev, { role: "assistant", content: "**NVIDIA API key required.** Add your key in **Settings → NVIDIA NIM API Key**, then try again." }]); return; }

    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg]; setMessages(updated); saveChatMessage(topicId, userMsg); setInput(""); setLoading(true); setStatus("Analyzing…");
    const systemPrompt = `You are the dedicated JEE Main + Advanced tutor inside JEE Prep.\nStudent target: JEE 2028.\nCurrent context: ${topicTitle}\nReference material:\n${topicContext}\n\nRules:\n- Teach for mastery, not merely answer generation.\n- Never invent formulas, reactions, PYQs, book references or answer keys.\n- If source context is insufficient, say what is missing.\n- For numericals: identify givens, target, concept, equations, substitutions, units and final answer; verify when practical.\n- For concepts: intuition first, formal reasoning second, exam takeaway last.\n- Distinguish JEE Main and Advanced level where useful.\n- Correct faulty reasoning directly and explain the mistake.\n- Prefer concise sections, equations and worked steps over walls of prose.\n- Never reveal private chain-of-thought. Provide the useful solution approach and necessary derivation instead.\n- Flag ambiguity or uncertainty explicitly.\n- Do not claim to have accessed a book or source unless it is present in the supplied context.\nAnswer the latest student message using conversation history for continuity.`;

    try {
      const res = await fetch(CHAT_PROXY, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey, model: getSelectedModel(), messages: [{ role: "system", content: systemPrompt }, ...updated] }) });
      if (!res.ok || !res.body) { const errData = await res.json().catch(() => ({})); throw new Error(errData.error || `AI error: ${res.status}`); }
      setStatus("Writing…"); const reader = res.body.getReader(); const decoder = new TextDecoder(); let buffer = ""; let reply = "";
      const upsert = (content: string) => setMessages((prev) => { const next = [...prev]; if (next.at(-1)?.role === "assistant") next[next.length - 1] = { role: "assistant", content }; else next.push({ role: "assistant", content }); return next; });
      while (true) { const { value, done } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const lines = buffer.split("\n"); buffer = lines.pop() ?? ""; for (const line of lines) { if (!line.startsWith("data:")) continue; const payload = line.slice(5).trim(); if (!payload || payload === "[DONE]") continue; try { const chunk = JSON.parse(payload); const delta = chunk.choices?.[0]?.delta?.content; if (typeof delta === "string" && delta) { reply += delta; upsert(reply); } } catch {} } }
      reply ||= "The model returned an empty response. Try again or choose another model."; setMessages((prev) => { const next = [...prev]; if (next.at(-1)?.role === "assistant") next[next.length - 1] = { role: "assistant", content: reply }; else next.push({ role: "assistant", content: reply }); return next; }); saveChatMessage(topicId, { role: "assistant", content: reply }); setStatus("Ready");
    } catch (err) { const message = err instanceof Error ? err.message : "Failed to reach AI service."; const errorMsg = { role: "assistant" as const, content: `**AI error:** ${message}` }; setMessages((prev) => [...prev, errorMsg]); saveChatMessage(topicId, errorMsg); setStatus("Error"); }
    finally { setLoading(false); }
  }

  return <div className="flex flex-col rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: "var(--paper-bg)", border: "2px solid var(--grid-line)", height: "600px" }}>
    <div className="px-4 py-3 font-hand text-lg font-bold flex items-center justify-between" style={{ backgroundColor: "var(--sticky-yellow)", color: "var(--ink)" }}><div><span>JEE Tutor — {topicTitle}</span><span className="block text-[11px] font-sans font-medium opacity-60">{status}</span></div><button onClick={() => { clearChatHistory(topicId); setMessages([]); }} className="text-xs px-2 py-1 rounded hover:opacity-80" style={{ backgroundColor: "var(--accent-red)", color: "white" }}>Clear</button></div>
    <div className="px-3 py-2 text-xs text-center font-semibold" style={{ backgroundColor: "var(--accent-red)", color: "white" }}>AI is a tutor, not an answer key. Verify important numerical results against trusted material.</div>
    <div className="flex-1 overflow-y-auto p-4 space-y-3">{messages.length === 0 && <div className="text-sm opacity-60 text-center mt-8 space-y-2"><p>Ask anything about {topicTitle}.</p><p className="text-xs">Try a concept doubt, a numerical, a solution check, or an Advanced approach.</p></div>}{messages.map((msg, i) => <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}><div className="max-w-[88%] rounded-lg px-4 py-2 text-sm" style={{ backgroundColor: msg.role === "user" ? "var(--sticky-blue)" : "var(--sticky-green)", color: "var(--ink)" }}>{msg.role === "user" ? msg.content : <MarkdownContent content={msg.content} />}</div></div>)}{loading && <div className="flex justify-start"><div className="rounded-lg px-4 py-2 text-sm" style={{ backgroundColor: "var(--sticky-green)", color: "var(--ink)" }}><span className="inline-flex gap-1 items-center"><span className="animate-pulse">●</span><span className="animate-pulse">●</span><span className="animate-pulse">●</span><span className="ml-2">{status}</span></span></div></div>}<div ref={messagesEndRef} /></div>
    <div className="p-3 border-t" style={{ borderColor: "var(--grid-line)" }}><div className="flex gap-2"><textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Ask your doubt…" rows={2} className="flex-1 px-3 py-2 text-sm rounded border resize-none" style={{ borderColor: "var(--grid-line)", backgroundColor: "white", color: "var(--ink)" }} disabled={loading} /><button onClick={sendMessage} disabled={loading || !input.trim()} className="px-4 py-2 text-sm font-bold rounded transition-all self-end" style={{ backgroundColor: loading ? "var(--grid-line)" : "var(--sticky-yellow)", color: "var(--ink)" }}>{loading ? "Working…" : "Send"}</button></div></div>
  </div>;
}
