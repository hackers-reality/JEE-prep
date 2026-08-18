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
  const [apiKey, setApiKeyState] = useState(() => getApiKey());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTopicRef = useRef(topicId);

  useEffect(() => {
    if (lastTopicRef.current === topicId) return;
    lastTopicRef.current = topicId;
    setApiKeyState(getApiKey());
    setMessages(getChatHistory(topicId));
  }, [topicId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    saveChatMessage(topicId, userMsg);
    setInput("");
    setLoading(true);
    setStatus("Analyzing the problem…");

    const systemPrompt = `You are the dedicated JEE Main + Advanced tutor inside JEE Prep.

Student context:
- Current target: JEE 2028.
- Topic: ${topicTitle}

Reference material:
${topicContext}

Rules:
1. Teach for mastery, not just answer generation.
2. Be rigorous with Physics, Chemistry and Mathematics; never invent formulas, reactions, facts, PYQs, book references or answer keys.
3. If the provided material is insufficient, say what is missing instead of hallucinating.
4. For numerical problems: identify givens, target, governing concept, equations, substitutions, units and final answer. Check the result when practical.
5. For conceptual doubts: explain intuition first, then formal reasoning, then a compact exam takeaway.
6. Distinguish JEE Main vs JEE Advanced level when useful.
7. Challenge incorrect reasoning directly and explain the mistake.
8. Prefer concise sections, equations, tables and examples over walls of prose.
9. Do not reveal private chain-of-thought. Give a concise solution approach and the necessary derivation instead.
10. When confidence is low or the question is ambiguous, explicitly flag it.

Answer the student's latest message while using the conversation history for continuity.`;

    try {
      const res = await fetch(CHAT_PROXY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey || getApiKey(),
          model: getSelectedModel(),
          messages: [
            { role: "system", content: systemPrompt },
            ...updated.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `AI error: ${res.status}`);
      }

      setStatus("Writing the solution…");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let reply = "";

      const upsertAssistant = (content: string) => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant") next[next.length - 1] = { role: "assistant", content };
          else next.push({ role: "assistant", content });
          return next;
        });
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const chunk = JSON.parse(payload);
            const delta = chunk.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta) {
              reply += delta;
              upsertAssistant(reply);
            }
          } catch {
            // Ignore incomplete/non-JSON SSE frames; the next frame will complete them.
          }
        }
      }

      if (!reply) reply = "The model returned an empty response. Try again or switch models.";
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant") next[next.length - 1] = { role: "assistant", content: reply };
        else next.push({ role: "assistant", content: reply });
        return next;
      });
      saveChatMessage(topicId, { role: "assistant", content: reply });
      setStatus("Ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reach AI service.";
      const errorMsg: ChatMessage = { role: "assistant", content: `**AI error:** ${message}` };
      setMessages((prev) => [...prev, errorMsg]);
      saveChatMessage(topicId, errorMsg);
      setStatus("Error");
    } finally {
      setLoading(false);
    }
  }

  const configured = Boolean(apiKey || getApiKey());

  return (
    <div className="flex flex-col rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: "var(--paper-bg)", border: "2px solid var(--grid-line)", height: "600px" }}>
      <div className="px-4 py-3 font-hand text-lg font-bold flex items-center justify-between" style={{ backgroundColor: "var(--sticky-yellow)", color: "var(--ink)" }}>
        <div><span>JEE Tutor — {topicTitle}</span><span className="block text-[11px] font-sans font-medium opacity-60">{status}</span></div>
        <button onClick={() => { clearChatHistory(topicId); setMessages([]); }} className="text-xs px-2 py-1 rounded hover:opacity-80" style={{ backgroundColor: "var(--accent-red)", color: "white" }}>Clear</button>
      </div>

      <div className="px-3 py-2 text-xs text-center font-semibold" style={{ backgroundColor: "var(--accent-red)", color: "white" }}>
        AI is a tutor, not an answer key. Verify important numerical results against trusted material.
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && <div className="text-sm opacity-60 text-center mt-8 space-y-2"><p>Ask anything about {topicTitle}.</p><p className="text-xs">Try: “Explain this from first principles”, “Give me a JEE Advanced approach”, or paste your solution and ask me to check it.</p></div>}
        {messages.map((msg, i) => <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}><div className="max-w-[88%] rounded-lg px-4 py-2 text-sm" style={{ backgroundColor: msg.role === "user" ? "var(--sticky-blue)" : "var(--sticky-green)", borderRadius: "6px 10px 8px 12px", color: "var(--ink)" }}>{msg.role === "user" ? msg.content : <MarkdownContent content={msg.content} />}</div></div>)}
        {loading && <div className="flex justify-start"><div className="rounded-lg px-4 py-2 text-sm" style={{ backgroundColor: "var(--sticky-green)", color: "var(--ink)" }}><span className="inline-flex gap-1 items-center"><span className="animate-pulse">●</span><span className="animate-pulse">●</span><span className="animate-pulse">●</span><span className="ml-2">{status}</span></span></div></div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t" style={{ borderColor: "var(--grid-line)" }}>
        {!configured ? <p className="text-sm text-center" style={{ color: "var(--accent-red)" }}>AI provider not configured. Add your NVIDIA NIM key in <a href="/settings" className="underline">Settings</a>.</p> : <div className="flex gap-2"><textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Ask your doubt…" rows={2} className="flex-1 px-3 py-2 text-sm rounded border resize-none" style={{ borderColor: "var(--grid-line)", backgroundColor: "white", color: "var(--ink)" }} disabled={loading} /><button onClick={sendMessage} disabled={loading || !input.trim()} className="px-4 py-2 text-sm font-bold rounded transition-all self-end" style={{ backgroundColor: loading ? "var(--grid-line)" : "var(--sticky-yellow)", color: "var(--ink)" }}>{loading ? "Working…" : "Send"}</button></div>}
      </div>
    </div>
  );
}
