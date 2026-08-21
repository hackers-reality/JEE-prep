"use client";

import { useEffect, useMemo, useState } from "react";

type Subject = "phy" | "chem" | "math";
type Log = { q: Record<Subject, number>; routine: Record<string, boolean>; notes: string; gtWrong: number; gtUnattempted: number; doubtsCleared: number };
type Payload = { logs?: Record<string, Log> };
const COLORS: Record<Subject, string> = { phy: "#3DDCFF", chem: "#A78BFA", math: "#FFB454" };
const LABELS: Record<Subject, string> = { phy: "Physics", chem: "Chemistry", math: "Maths" };
const ROUTINE_STUDY = ["chem", "phy", "math", "revision", "catchup"];
const DAILY_HOURS = { chem: 2, phy: 1.75, math: 1.5, revision: 1.5, catchup: 1.5 };
const today = () => new Date().toISOString().slice(0, 10);
const shift = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
function hours(log: Log) { return ROUTINE_STUDY.reduce((s, id) => s + (log.routine[id] ? DAILY_HOURS[id as keyof typeof DAILY_HOURS] : 0), 0); }
function questions(log: Log) { return (log.q?.phy || 0) + (log.q?.chem || 0) + (log.q?.math || 0); }
function adherence(log: Log) { return ROUTINE_STUDY.length ? ROUTINE_STUDY.filter((id) => log.routine[id]).length / ROUTINE_STUDY.length : 0; }
function intensity(log?: Log) { if (!log) return 0; const h = Math.min(1, hours(log) / 6.5); const q = Math.min(1, questions(log) / 50); const a = adherence(log); return Math.round((h * 0.4 + q * 0.35 + a * 0.25) * 100); }

export default function ProgressPage() {
  const [payload, setPayload] = useState<Payload>({ logs: {} });
  useEffect(() => { fetch("/api/personal-timetable").then((r) => r.ok ? r.json() : Promise.reject()).then((d) => setPayload(d.payload ?? {})).catch(() => undefined); }, []);
  const logs = payload.logs ?? {};
  const end = today();
  const days = useMemo(() => Array.from({ length: 28 }, (_, i) => shift(end, i - 27)), [end]);
  const totalQ = Object.values(logs).reduce((s, l) => s + questions(l), 0);
  const totalH = Object.values(logs).reduce((s, l) => s + hours(l), 0);
  const avgQ = days.length ? totalQ / Math.max(1, Object.keys(logs).length) : 0;
  const subjectTotals = (Object.keys(LABELS) as Subject[]).map((s) => ({ s, q: Object.values(logs).reduce((sum, l) => sum + (l.q?.[s] || 0), 0) }));
  const streak = (() => { let n = 0; for (let i = 0; ; i++) { const d = shift(end, -i); const l = logs[d]; if (l && (questions(l) >= 40 || hours(l) >= 5)) n++; else break; } return n; })();
  return <main className="min-h-screen bg-[#0B0D12] text-[#E7E9EE] px-4 pb-16 pt-6 sm:px-6">
    <div className="mx-auto max-w-[1200px]">
      <nav className="mb-6 flex flex-wrap gap-2"><a className="rounded-lg border border-[#232838] bg-[#12151C] px-3 py-2 text-sm" href="/personal-timetable">Today</a><a className="rounded-lg border border-[#3DDCFF]/50 bg-[#12151C] px-3 py-2 text-sm" href="/personal-timetable/progress">Progress</a><a className="rounded-lg border border-[#232838] bg-[#12151C] px-3 py-2 text-sm" href="/personal-timetable/schedule">Schedule</a><a className="rounded-lg border border-[#232838] bg-[#12151C] px-3 py-2 text-sm" href="/personal-timetable/syllabus">Syllabus</a><a className="rounded-lg border border-[#232838] bg-[#12151C] px-3 py-2 text-sm" href="/personal-timetable/tools">Repair Hub</a></nav>
      <header className="mb-6"><div className="text-[11px] uppercase tracking-[0.2em] text-[#3DDCFF]">Progress analytics</div><h1 className="mt-1 text-3xl font-bold">Is the work actually improving?</h1><p className="mt-1 text-sm text-[#8B92A5]">Intensity is based on completed study hours, questions solved and routine adherence — not a simple subject tick.</p></header>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 mb-6"><Stat label="Questions" value={String(totalQ)} hint="All logged days"/><Stat label="Study hours" value={totalH.toFixed(1)} hint="Routine-calculated"/><Stat label="Avg Q/day" value={avgQ.toFixed(1)} hint="Across logged days"/><Stat label="40+ streak" value={`${streak}d`} hint="Questions or ≥5h"/><Stat label="Best heat" value={`${Math.max(...days.map((d) => intensity(logs[d])), 0)}%`} hint="Combined performance"/></section>
      <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5 mb-6"><div className="flex items-center justify-between"><div><h2 className="font-bold">28-day performance heatmap</h2><p className="text-xs text-[#565D70] mt-1">Brightness = 40% hours + 35% questions + 25% routine adherence.</p></div><div className="text-xs text-[#565D70]">0 → 100</div></div><div className="mt-4 grid grid-cols-7 gap-2">{days.map((d) => { const v = intensity(logs[d]); const opacity = 0.08 + v / 100 * 0.92; return <div key={d} title={`${d}: ${v}%`} className="h-10 rounded-md border border-[#232838]" style={{ backgroundColor: `rgba(61,220,255,${opacity})` }} />; })}</div></section>
      <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="font-bold">Subject question volume</h2><div className="mt-4 space-y-4">{subjectTotals.map(({ s, q }) => <div key={s}><div className="flex justify-between text-sm"><span>{LABELS[s]}</span><span className="font-mono">{q}</span></div><div className="mt-2 h-2 rounded-full bg-[#171B24]"><div className="h-2 rounded-full" style={{ width: `${Math.min(100, q / Math.max(1, totalQ) * 100)}%`, background: COLORS[s] }} /></div></div>)}</div></div><div className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="font-bold">Day-by-day execution</h2><div className="mt-3 space-y-2">{days.slice(-10).reverse().map((d) => { const l = logs[d]; return <div key={d} className="flex items-center gap-3 rounded-lg bg-[#171B24] px-3 py-2"><span className="w-24 text-xs text-[#8B92A5]">{d}</span><div className="h-2 flex-1 rounded-full bg-[#0B0D12]"><div className="h-2 rounded-full bg-[#3DDCFF]" style={{ width: `${intensity(l)}%` }} /></div><span className="w-12 text-right font-mono text-xs">{intensity(l)}%</span></div>; })}</div></div></section>
      <section className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5"><h2 className="font-bold text-amber-300">Interpretation</h2><p className="mt-2 text-sm leading-6 text-[#8B92A5]">A bright day means the planned routine was actually followed and backed by enough questions and study time. A bright cell without question volume is impossible; a question-heavy day with poor routine adherence also cannot reach full intensity. The purpose is to expose consistency, not reward checkbox spam.</p></section>
    </div>
  </main>;
}
function Stat({ label, value, hint }: { label: string; value: string; hint: string }) { return <div className="rounded-xl border border-[#232838] bg-[#12151C] p-4"><div className="text-[10px] uppercase tracking-wider text-[#565D70]">{label}</div><div className="mt-1 text-2xl font-bold font-mono">{value}</div><div className="mt-1 text-[10px] text-[#565D70]">{hint}</div></div>; }
