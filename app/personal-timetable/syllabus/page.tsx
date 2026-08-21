"use client";

import { useEffect, useState } from "react";

type Subject = "Physics" | "Chemistry" | "Maths";
type Status = "done" | "progress" | "todo";
type Topic = { name: string; status: Status; note: string };
const data: Record<Subject, Topic[]> = {
  Physics: [
    { name: "Scalar & Vector", status: "done", note: "Completed — maintain with mixed application." },
    { name: "Kinematics", status: "done", note: "Completed — focus on unfamiliar JEE-style application." },
    { name: "Laws of Motion", status: "progress", note: "Strengthen friction, pulleys and connected bodies." },
    { name: "Work, Energy & Power", status: "progress", note: "Priority new topic — fundamentals → Level 1 → JEE Main." },
  ],
  Chemistry: [
    { name: "Mole Concept", status: "done", note: "Completed — maintenance and mixed numericals." },
    { name: "Atomic Structure", status: "progress", note: "Priority new topic — theory + N. Avasthi Level 1." },
  ],
  Maths: [
    { name: "Trigonometry", status: "done", note: "Completed — revision + problem recognition." },
    { name: "Sets", status: "done", note: "Completed — revision + application." },
    { name: "Relations & Functions", status: "done", note: "Completed — revision + application." },
    { name: "Straight Line", status: "progress", note: "New topic — Target Level 1 first." },
    { name: "Circle", status: "progress", note: "New topic — Target Level 1 first." },
  ],
};
const exam = new Date("2026-09-12T00:00:00+05:30");
const deadline = new Date("2026-09-05T00:00:00+05:30");
const days = (d: Date) => Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86400000));
const style = { done: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20", progress: "bg-sky-400/10 text-sky-300 border-sky-400/20", todo: "bg-slate-400/10 text-slate-400 border-slate-400/20" };

export default function SyllabusPage() {
  const [items, setItems] = useState(data);
  const [saved, setSaved] = useState(false);
  useEffect(() => { fetch("/api/personal-timetable").then((r) => r.ok ? r.json() : Promise.reject()).then((d) => { const savedMap = d.payload?.syllabus; if (!savedMap) return; setItems((cur) => { const next = structuredClone(cur); Object.entries(savedMap as Record<string, Status>).forEach(([key, status]) => { const [sub, index] = key.split(":"); const list = next[sub as Subject]; if (list && list[Number(index)]) list[Number(index)].status = status; }); return next; }); }).catch(() => undefined); }, []);
  const done = Object.values(items).flat().filter((x) => x.status === "done").length;
  const total = Object.values(items).flat().length;
  async function save() { const map: Record<string, Status> = {}; (Object.keys(items) as Subject[]).forEach((sub) => items[sub].forEach((x, i) => { map[`${sub}:${i}`] = x.status; })); await fetch("/api/personal-timetable", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ syllabus: map, rows: [], logs: {}, gtDiary: [], doubts: [], bookProgress: {}, weeklyReviews: [] }) }).catch(() => undefined); setSaved(true); }
  return <main className="min-h-screen bg-[#0B0D12] text-[#E7E9EE] px-4 pb-16 pt-6 sm:px-6"><div className="mx-auto max-w-[1100px]">
    <nav className="mb-6 flex flex-wrap gap-2">{[["Today","/personal-timetable"],["Progress","/personal-timetable/progress"],["Schedule","/personal-timetable/schedule"],["Syllabus","/personal-timetable/syllabus"],["Repair Hub","/personal-timetable/tools"]].map(([x,u]) => <a key={u} href={u} className={`rounded-lg border px-3 py-2 text-sm ${x === "Syllabus" ? "border-[#3DDCFF]/50 bg-[#12151C]" : "border-[#232838] bg-[#12151C]"}`}>{x}</a>)}</nav>
    <header className="mb-6"><div className="text-[11px] uppercase tracking-[0.2em] text-[#3DDCFF]">GT-02 syllabus</div><h1 className="mt-1 text-3xl font-bold">Coverage and mastery</h1><p className="mt-1 text-sm text-[#8B92A5]">Completed chapters stay in rotation for revision; new chapters move through Level 1 before harder questions.</p></header>
    <section className="mb-6 grid gap-3 sm:grid-cols-4"><Metric label="Coverage" value={`${done}/${total}`} hint="topics completed"/><Metric label="GT-02" value={`${days(exam)}d`} hint="to exam"/><Metric label="Doubt deadline" value={`${days(deadline)}d`} hint="Sep 5"/><Metric label="Books" value="Level 1" hint="teacher-marked first"/></section>
    <div className="space-y-4">{(Object.keys(items) as Subject[]).map((sub) => { const list = items[sub]; return <section key={sub} className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">{sub}</h2><span className="font-mono text-xs text-[#565D70]">{list.filter((x) => x.status === "done").length}/{list.length} done</span></div><div className="mt-4 space-y-2">{list.map((topic, i) => <div key={topic.name} className="grid gap-3 rounded-xl border border-[#232838] bg-[#171B24] p-4 md:grid-cols-[1fr_170px]"><div><div className="font-semibold">{topic.name}</div><div className="mt-1 text-xs leading-5 text-[#8B92A5]">{topic.note}</div></div><select value={topic.status} onChange={(e) => { const next = structuredClone(items); next[sub][i].status = e.target.value as Status; setItems(next); setSaved(false); }} className={`rounded-lg border px-3 py-2 text-xs ${style[topic.status]} bg-[#0B0D12]`}><option value="done">Done</option><option value="progress">In progress</option><option value="todo">Todo</option></select></div>)}</div></section>; })}</div>
    <div className="mt-6 flex justify-end"><button onClick={save} className="rounded-lg bg-[#3DDCFF] px-4 py-2.5 font-semibold text-[#031014]">{saved ? "Saved ✓" : "Save syllabus"}</button></div>
  </div></main>;
}
function Metric({ label, value, hint }: { label: string; value: string; hint: string }) { return <div className="rounded-xl border border-[#232838] bg-[#12151C] p-4"><div className="text-[10px] uppercase tracking-wider text-[#565D70]">{label}</div><div className="mt-1 font-mono text-2xl font-bold">{value}</div><div className="mt-1 text-[10px] text-[#565D70]">{hint}</div></div>; }
