"use client";

import { useState, useRef, useEffect } from "react";

import MarkdownContent from "./MarkdownContent";
import {
  getApiKey,
  getSelectedModel,
  getChatHistory,
  saveChatMessage,
  clearChatHistory,
  type ChatMessage,
} from "@/lib/chat-store";

const CHAT_PROXY = "/api/chat";

export function ChatWidget({ topicId, topicTitle, topicContext }: { topicId: string; topicTitle: string; topicContext: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getChatHistory(topicId));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKeyState] = useState(() => getApiKey());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTopicRef = useRef(topicId);

  useEffect(() => {
    // Initial render is already handled by the lazy useState initialisers;
    // only re-sync when the user actually navigates to a different topic.
    if (lastTopicRef.current === topicId) return;
    lastTopicRef.current = topicId;
    setApiKeyState(getApiKey());
    setMessages(getChatHistory(topicId));
  }, [topicId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    saveChatMessage(topicId, userMsg);
    setInput("");
    setLoading(true);

    try {
      const systemPrompt = `You are a JEE exam-prep tutor helping a student with ${topicTitle}. Here is the topic content for context:\n\n${topicContext}\n\nAnswer the student's doubt based on this material. If the question goes beyond the provided content, mention that and suggest cross-checking with the textbook. Be clear and step-by-step. For numerical problems, show full worked solutions.`;

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

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API error: ${res.status}`);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content ?? "No response from model.";
      const assistantMsg: ChatMessage = { role: "assistant", content: reply };
      setMessages((prev) => [...prev, assistantMsg]);
      saveChatMessage(topicId, assistantMsg);
    } catch (err) {
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: `Error: ${err instanceof Error ? err.message : "Failed to get response. Check your API key and internet connection."}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex flex-col rounded-lg shadow-md overflow-hidden"
      style={{
        backgroundColor: "var(--paper-bg)",
        border: "2px solid var(--grid-line)",
        height: "600px",
      }}
    >
      <div
        className="px-4 py-3 font-hand text-lg font-bold flex items-center justify-between"
        style={{ backgroundColor: "var(--sticky-yellow)", color: "var(--ink)" }}
      >
        <span>Ask a Doubt — {topicTitle}</span>
        <button
          onClick={() => { clearChatHistory(topicId); setMessages([]); }}
          className="text-xs px-2 py-1 rounded hover:opacity-80"
          style={{ backgroundColor: "var(--accent-red)", color: "white" }}
        >
          Clear history
        </button>
      </div>

      <div
        className="px-3 py-2 text-xs text-center font-semibold"
        style={{ backgroundColor: "var(--accent-red)", color: "white" }}
      >
        AI answers can be wrong, especially for numerical/formula-heavy questions. Always cross-check against your textbook.
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm opacity-50 text-center mt-8">
            Ask your doubt about {topicTitle}. The AI has access to the topic content for context.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[80%] rounded-lg px-4 py-2 text-sm"
              style={{
                backgroundColor: msg.role === "user" ? "var(--sticky-blue)" : "var(--sticky-green)",
                borderRadius: "6px 10px 8px 12px",
                color: "var(--ink)",
              }}
            >
              {msg.role === "user" ? msg.content : <MarkdownContent content={msg.content} />}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div
              className="rounded-lg px-4 py-2 text-sm"
              style={{
                backgroundColor: "var(--sticky-green)",
                borderRadius: "6px 10px 8px 12px",
                color: "var(--ink)",
              }}
            >
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t" style={{ borderColor: "var(--grid-line)" }}>
        {!apiKey && !getApiKey() ? (
          <p className="text-sm text-center" style={{ color: "var(--accent-red)" }}>
            Set your NVIDIA NIM API key in{" "}
            <a href="/settings" className="underline" style={{ color: "var(--accent-red)" }}>
              Settings
            </a>{" "}
            to use the chatbot.
          </p>
        ) : (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type your doubt here..."
              className="flex-1 px-3 py-2 text-sm rounded border"
              style={{
                borderColor: "var(--grid-line)",
                backgroundColor: "white",
                color: "var(--ink)",
              }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2 text-sm font-bold rounded transition-all"
              style={{
                backgroundColor: loading ? "var(--grid-line)" : "var(--sticky-yellow)",
                color: "var(--ink)",
              }}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
