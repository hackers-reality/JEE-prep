"use client";

import { useEffect, useState } from "react";
import { AIConversationSidebar } from "./AIConversationSidebar";
import { loadSavedConversation } from "@/lib/ai-conversations-client";

export function AIWorkspace() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [loading, setLoading] = useState(false);

  async function selectConversation(id: string) {
    setActiveId(id); setLoading(true);
    try { const data = await loadSavedConversation(id); setMessages(data.messages ?? []); }
    finally { setLoading(false); }
  }

  function newConversation() { setActiveId(null); setMessages([]); }

  return <div className="flex flex-col md:flex-row gap-4 min-h-[620px]">
    <AIConversationSidebar activeId={activeId} onSelect={selectConversation} onNew={newConversation} />
    <section className="flex-1 rounded-xl border p-5" style={{ borderColor: "var(--grid-line)", backgroundColor: "var(--paper-bg)" }}>
      {activeId ? <><div className="mb-4"><div className="text-xs uppercase tracking-widest opacity-50">Saved conversation</div><h2 className="font-hand text-2xl font-bold">Continue studying</h2></div>{loading ? <p className="text-sm opacity-60">Loading messages…</p> : <div className="space-y-3">{messages.length ? messages.map((message, index) => <div key={index} className="rounded-lg p-3 text-sm" style={{ backgroundColor: message.role === "user" ? "var(--sticky-blue)" : "var(--sticky-green)" }}>{message.content}</div>) : <p className="text-sm opacity-60">This conversation has no messages yet.</p>}</div>}<p className="mt-6 text-xs opacity-50">Topic-specific tutor chat can be continued here next.</p></> : <div className="h-full min-h-[520px] grid place-items-center text-center"><div><div className="font-hand text-3xl font-bold">Start a new JEE conversation</div><p className="text-sm opacity-60 mt-2">Choose an existing chat or start a fresh one. Your conversations belong to your student account.</p></div></div>}
    </section>
  </div>;
}
