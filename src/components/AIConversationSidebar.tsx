"use client";

import { useEffect, useState } from "react";

type Conversation = { id: string; title: string; topicId?: string | null; model: string; updatedAt?: string };

export function AIConversationSidebar({ activeId, onSelect, onNew }: { activeId?: string | null; onSelect: (id: string) => void; onNew: () => void }) {
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { const res = await fetch("/api/chat/conversations", { cache: "no-store" }); if (res.ok) setItems((await res.json()).conversations ?? []); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function rename(item: Conversation) {
    const title = window.prompt("Conversation name", item.title)?.trim();
    if (!title || title === item.title) return;
    const res = await fetch(`/api/chat/conversations/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
    if (res.ok) setItems((prev) => prev.map((x) => x.id === item.id ? { ...x, title } : x));
  }

  async function remove(item: Conversation) {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    const res = await fetch(`/api/chat/conversations/${item.id}`, { method: "DELETE" });
    if (res.ok) { setItems((prev) => prev.filter((x) => x.id !== item.id)); if (activeId === item.id) onNew(); }
  }

  return <aside className="w-full md:w-72 shrink-0 rounded-xl border p-3 flex flex-col gap-3" style={{ borderColor: "var(--grid-line)", backgroundColor: "var(--paper-bg)" }}>
    <div className="flex items-center justify-between"><div><div className="font-bold">AI Tutor</div><div className="text-xs opacity-60">Your saved conversations</div></div><button onClick={onNew} className="rounded px-3 py-1.5 text-xs font-bold" style={{ backgroundColor: "var(--sticky-yellow)", color: "var(--ink)" }}>+ New</button></div>
    <div className="flex-1 overflow-y-auto space-y-1 min-h-[120px]">{loading ? <div className="text-xs opacity-60 p-3">Loading conversations…</div> : items.length === 0 ? <div className="text-xs opacity-60 p-3">No saved chats yet.</div> : items.map((item) => <div key={item.id} className="group flex items-center gap-1 rounded-lg" style={{ backgroundColor: activeId === item.id ? "var(--sticky-blue)" : "transparent" }}><button onClick={() => onSelect(item.id)} className="flex-1 text-left px-3 py-2 text-sm truncate">{item.title}</button><button aria-label="Rename conversation" onClick={() => rename(item)} className="hidden group-hover:block px-1 text-xs opacity-60">✎</button><button aria-label="Delete conversation" onClick={() => remove(item)} className="hidden group-hover:block px-1 text-xs opacity-60">×</button></div>)}</div>
  </aside>;
}
