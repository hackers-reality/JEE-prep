"use client";

import { useState } from "react";
import { buildNavigatorTarget } from "@/lib/tutor-navigator";

export function TutorNavigator() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");

  function navigate() {
    const target = buildNavigatorTarget({ text: input });
    if (!target) {
      setMessage("Tell me the topic you are struggling with and I’ll find the right study area.");
      return;
    }
    setMessage(`No worries, I got you 🫡 I found ${target.topicId}. Opening it now.`);
    window.setTimeout(() => { window.location.href = target.route; }, 450);
  }

  return <>
    {open && <div className="fixed bottom-20 right-4 z-50 w-[min(360px,calc(100vw-2rem))] rounded-2xl border shadow-xl overflow-hidden" style={{ backgroundColor: "var(--paper-bg)", borderColor: "var(--grid-line)" }}>
      <div className="px-4 py-3 font-bold border-b flex items-center justify-between" style={{ borderColor: "var(--grid-line)" }}><span>Tutor Navigator</span><button onClick={() => setOpen(false)} aria-label="Close tutor navigator">×</button></div>
      <div className="p-4 text-sm space-y-3"><p className="opacity-70">Tell me what you’re stuck on. I’ll open the closest JEE topic.</p>{message && <div className="rounded-lg px-3 py-2" style={{ backgroundColor: "var(--sticky-green)" }}>{message}</div>}<textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3} placeholder="e.g. I'm struggling with kinematics…" className="w-full rounded-lg border px-3 py-2 resize-none" style={{ borderColor: "var(--grid-line)" }} /><button onClick={navigate} disabled={!input.trim()} className="w-full rounded-lg px-3 py-2 font-bold" style={{ backgroundColor: "var(--sticky-yellow)", color: "var(--ink)" }}>Find my topic</button></div>
    </div>}
    <button onClick={() => setOpen((v) => !v)} aria-label="Open Tutor Navigator" className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg border-2 font-bold text-xl" style={{ backgroundColor: "var(--sticky-yellow)", color: "var(--ink)", borderColor: "var(--ink)" }}>?</button>
  </>;
}
