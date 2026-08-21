"use client";

import { useState } from "react";

type Subject = "phy" | "chem" | "math" | "rev";
type Item = { date: string; rows: { topic: string; q: number; subject: Subject; note?: string }[]; note?: string };
const plan: Item[] = [
  { date: "2026-08-21", rows: [{ topic: "Kinematics", q: 10, subject: "phy", note: "revision" }, { topic: "Mole Concept + % Composition", q: 10, subject: "chem", note: "revision" }, { topic: "WEP", q: 8, subject: "phy", note: "new topic" }, { topic: "Trigonometry", q: 12, subject: "math", note: "revision" }] },
  { date: "2026-08-22", rows: [{ topic: "Kinematics", q: 10, subject: "phy", note: "revision" }, { topic: "Mole Concept + % Composition", q: 10, subject: "chem", note: "revision" }, { topic: "WEP", q: 7, subject: "phy" }, { topic: "Trigonometry", q: 13, subject: "math" }] },
  { date: "2026-08-23", rows: [{ topic: "Kinematics", q: 10, subject: "phy" }, { topic: "Atomic Structure", q: 10, subject: "chem", note: "new" }, { topic: "Sets + Relations & Functions", q: 13, subject: "math" }, { topic: "Trigonometry", q: 12, subject: "math" }] },
  { date: "2026-08-24", rows: [{ topic: "NLM", q: 12, subject: "phy" }, { topic: "Atomic Structure", q: 10, subject: "chem" }, { topic: "Sets + Relations & Functions", q: 13, subject: "math" }, { topic: "Straight Line", q: 5, subject: "math", note: "Target Level 1" }] },
  { date: "2026-08-25", rows: [{ topic: "NLM", q: 12, subject: "phy" }, { topic: "Atomic Structure", q: 10, subject: "chem" }, { topic: "Sets + Relations & Functions", q: 12, subject: "math" }, { topic: "Straight Line", q: 5, subject: "math", note: "Target Level 1" }] },
  { date: "2026-08-26", rows: [{ topic: "Friction", q: 8, subject: "phy" }, { topic: "NLM", q: 6, subject: "phy" }, { topic: "Atomic Structure", q: 10, subject: "chem" }, { topic: "Sets + Relations & Functions", q: 12, subject: "math" }, { topic: "Circle", q: 5, subject: "math", note: "Target Level 1" }] },
  { date: "2026-08-27", rows: [{ topic: "Friction", q: 7, subject: "phy" }, { topic: "Atomic Structure", q: 10, subject: "chem" }, { topic: "Circle", q: 5, subject: "math" }, { topic: "Mixed revision", q: 18, subject: "rev", note: "concept recognition" }] },
  { date: "2026-08-28", rows: [{ topic: "Mole Concept + % Composition", q: 10, subject: "chem" }, { topic: "Trigonometry", q: 13, subject: "math" }, { topic: "Mixed revision", q: 20, subject: "rev", note: "unfamiliar questions" }] },
  { date: "2026-08-29", rows: [{ topic: "Mole Concept + % Composition", q: 10, subject: "chem" }, { topic: "Mixed revision", q: 35, subject: "rev" }] },
  { date: "2026-08-30", rows: [{ topic: "Chemistry mixed revision", q: 20, subject: "chem" }, { topic: "Physics mixed revision", q: 15, subject: "phy" }, { topic: "Maths mixed revision", q: 10, subject: "math" }] },
  { date: "2026-08-31", rows: [{ topic: "Chemistry mixed revision", q: 20, subject: "chem" }, { topic: "Physics mixed revision", q: 15, subject: "phy" }, { topic: "Maths mixed revision", q: 10, subject: "math" }] },
  { date: "2026-09-01", rows: [{ topic: "Chemistry mixed revision", q: 18, subject: "chem" }, { topic: "Physics mixed revision", q: 14, subject: "phy" }, { topic: "Maths mixed revision", q: 12, subject: "math" }] },
  { date: "2026-09-02", rows: [{ topic: "Chemistry mixed revision", q: 18, subject: "chem" }, { topic: "Physics mixed revision", q: 14, subject: "phy" }, { topic: "Maths mixed revision", q: 12, subject: "math" }] },
  { date: "2026-09-03", rows: [{ topic: "Full-syllabus mock practice", q: 50, subject: "rev", note: "timed mixed Level 1" }] },
  { date: "2026-09-04", rows: [], note: "Light revision only — redo flagged/wrong questions and clear remaining doubts." },
  { date: "2026-09-05", rows: [], note: "Doubt-clearing deadline. No new heavy topics." },
  { date: "2026-09-06", rows: [{ topic: "GT-02 mock / selected mixed set", q: 45, subject: "rev", note: "timed + immediate analysis" }] },
  { date: "2026-09-07", rows: [{ topic: "Chemistry weak areas", q: 20, subject: "chem" }, { topic: "Physics weak areas", q: 15, subject: "phy" }, { topic: "Maths weak areas", q: 15, subject: "math" }] },
  { date: "2026-09-08", rows: [{ topic: "Chemistry application", q: 20, subject: "chem" }, { topic: "NLM/WEP application", q: 15, subject: "phy" }, { topic: "Straight Line/Circle", q: 15, subject: "math" }] },
  { date: "2026-09-09", rows: [{ topic: "Mixed JEE Main-level set", q: 50, subject: "rev", note: "unfamiliar questions" }] },
  { date: "2026-09-10", rows: [{ topic: "GT-02 style mini mock", q: 45, subject: "rev", note: "135-minute discipline" }] },
  { date: "2026-09-11", rows: [], note: "Light revision, formulas, marked doubts, confidence and sleep. No new grinding." },
];
const colors = { phy: "#3DDCFF", chem: "#A78BFA", math: "#FFB454", rev: "#94A3B8" };
const labels = { phy: "Physics", chem: "Chemistry", math: "Maths", rev: "Mixed" };
const fmt = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export default function SchedulePage() {
  const [selected, setSelected] = useState(plan[0].date);
  const current = plan.find((p) => p.date === selected) ?? plan[0];
  const totalQ = current.rows.reduce((s, r) => s + r.q, 0);
  return <main className="min-h-screen bg-[#0B0D12] text-[#E7E9EE] px-4 pb-16 pt-6 sm:px-6"><div className="mx-auto max-w-[1200px]">
    <nav className="mb-6 flex flex-wrap gap-2">{[["Today","/personal-timetable"],["Progress","/personal-timetable/progress"],["Schedule","/personal-timetable/schedule"],["Syllabus","/personal-timetable/syllabus"],["Repair Hub","/personal-timetable/tools"]].map(([x,u]) => <a key={u} href={u} className={`rounded-lg border px-3 py-2 text-sm ${x === "Schedule" ? "border-[#3DDCFF]/50 bg-[#12151C]" : "border-[#232838] bg-[#12151C]"}`}>{x}</a>)}</nav>
    <header className="mb-5"><div className="text-[11px] uppercase tracking-[0.2em] text-[#3DDCFF]">GT-02 runway</div><h1 className="mt-1 text-3xl font-bold">Day-by-day preparation schedule</h1><p className="mt-1 text-sm text-[#8B92A5]">Use the routine on Today to record execution; use this page to see the actual academic plan.</p></header>
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]"><aside className="rounded-2xl border border-[#232838] bg-[#12151C] p-3 max-h-[70vh] overflow-y-auto">{plan.map((p) => <button key={p.date} onClick={() => setSelected(p.date)} className={`w-full rounded-xl px-3 py-3 text-left ${selected === p.date ? "bg-[#171B24] ring-1 ring-[#3DDCFF]/40" : "hover:bg-[#171B24]"}`}><div className="flex items-center justify-between"><span className="font-semibold">{fmt(p.date)}</span><span className="font-mono text-xs text-[#565D70]">{p.rows.reduce((s, r) => s + r.q, 0)}Q</span></div><div className="mt-1 text-xs text-[#565D70]">{p.note || (p.rows.length ? "Planned study day" : "Revision")}</div></button>)}</aside>
      <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><div className="text-xs text-[#565D70]">Selected day</div><h2 className="mt-1 text-2xl font-bold">{fmt(current.date)}</h2></div><div className="text-right"><div className="font-mono text-2xl font-bold text-[#4ADE80]">{totalQ}Q</div><div className="text-[10px] uppercase tracking-wider text-[#565D70]">planned</div></div></div>
      <div className="mt-5 space-y-2">{current.rows.length ? current.rows.map((r, i) => <div key={`${r.topic}-${i}`} className="flex items-center gap-3 rounded-xl border border-[#232838] bg-[#171B24] p-3"><span className="w-20 text-[10px] font-bold uppercase" style={{ color: colors[r.subject] }}>{labels[r.subject]}</span><div className="flex-1"><div className="font-semibold">{r.topic}</div><div className="text-xs text-[#565D70]">{r.note || "application / practice"}</div></div><span className="rounded-lg bg-[#0B0D12] px-3 py-1.5 font-mono text-sm">{r.q}</span></div>) : <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-[#C0C5D0]">{current.note}</div>}</div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3"><Metric title="Chemistry priority" text="Give Chemistry the first major self-study block and maintain Mole Concept."/><Metric title="External books" text="Level 1 only until teacher marks the next difficulty: H.C. Verma / Target / N. Avasthi."/><Metric title="GT discipline" text="Unfamiliar JEE Main-style problems are deliberate. Track approach failures in the Repair Hub."/></div>
      </section></div>
  </div></main>;
}
function Metric({ title, text }: { title: string; text: string }) { return <div className="rounded-xl border border-[#232838] bg-[#0F1218] p-4"><div className="text-xs font-bold text-[#3DDCFF]">{title}</div><p className="mt-2 text-xs leading-5 text-[#8B92A5]">{text}</p></div>; }
