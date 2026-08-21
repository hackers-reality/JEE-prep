"use client";

import { useEffect, useMemo, useState } from "react";

type Subject = "phy" | "chem" | "math";
type Log = { q?: Record<Subject, number>; routine?: Record<string, boolean>; notes?: string; gtWrong?: number; gtUnattempted?: number; doubtsCleared?: number; savedAt?: string };
type Payload = { logs?: Record<string, Log>; syllabus?: Record<string, string>; gtDiary?: Array<{ outcome?: string; reattempted?: boolean; similarSolved?: boolean; teacherDoubt?: boolean }>; doubts?: Array<{ status?: string }>; bookProgress?: Record<string, { attempted: number; solved: number; marked: number }> };

const SUBJECTS: Subject[] = ["phy", "chem", "math"];
const LABEL: Record<Subject, string> = { phy: "Physics", chem: "Chemistry", math: "Maths" };
const COLORS: Record<Subject, string> = { phy: "#3DDCFF", chem: "#A78BFA", math: "#FFB454" };
const ROUTINE_MINUTES: Record<string, number> = { chem: 120, phy: 105, math: 90, revision: 90, catchup: 90 };
const TARGET_HOURS = 6.5;
const TARGET_Q = 50;

function days() { const out: string[] = []; const now = new Date(); for (let i = 27; i >= 0; i--) { const d = new Date(now); d.setDate(d.getDate() - i); out.push(d.toISOString().slice(0, 10)); } return out; }
function totalQ(log: Log) { return SUBJECTS.reduce((s, k) => s + (log.q?.[k] || 0), 0); }
function hours(log: Log) { return Object.entries(ROUTINE_MINUTES).reduce((s, [id, m]) => s + (log.routine?.[id] ? m : 0), 0) / 60; }
function adherence(log: Log) { const ids = Object.keys(ROUTINE_MINUTES); const done = ids.filter((id) => log.routine?.[id]).length; return ids.length ? done / ids.length : 0; }
function score(log: Log) { return Math.min(1, Math.max(0, Math.min(1, hours(log) / TARGET_HOURS) * .4 + Math.min(1, totalQ(log) / TARGET_Q) * .3 + adherence(log) * .3)); }

export default function ParentTeacherReport() {
  const [payload, setPayload] = useState<Payload>({});
  const [studentName, setStudentName] = useState("JEE 2028 student");
  const [error, setError] = useState("");

  useEffect(() => {
    const share = new URLSearchParams(window.location.search).get("share");
    const url = share ? `/api/personal-timetable?share=${encodeURIComponent(share)}` : "/api/personal-timetable";
    fetch(url).then((r) => r.ok ? r.json() : Promise.reject(new Error("This report requires a valid share link.")))
      .then((data) => { setPayload(data.payload || {}); setStudentName(data.studentName || "JEE 2028 student"); })
      .catch((e) => setError(e.message));
  }, []);

  const ds = useMemo(() => days(), []);
  const logged = ds.map((d) => ({ date: d, log: payload.logs?.[d] })).filter((x) => x.log);
  const totalQuestions = logged.reduce((s, x) => s + totalQ(x.log as Log), 0);
  const totalHours = logged.reduce((s, x) => s + hours(x.log as Log), 0);
  const avgQ = logged.length ? totalQuestions / logged.length : 0;
  const avgHours = logged.length ? totalHours / logged.length : 0;
  const avgAdherence = logged.length ? logged.reduce((s, x) => s + adherence(x.log as Log), 0) / logged.length : 0;
  const avgScore = logged.length ? logged.reduce((s, x) => s + score(x.log as Log), 0) / logged.length : 0;

  const subjectTotals = SUBJECTS.map((s) => ({ subject: s, q: logged.reduce((sum, x) => sum + (x.log?.q?.[s] || 0), 0) }));
  const pendingDoubts = (payload.doubts || []).filter((d) => d.status !== "Cleared").length;
  const gtNeedsRepair = (payload.gtDiary || []).filter((e) => !e.reattempted || !e.similarSolved).length;

  if (error) return <main className="min-h-screen bg-[#0B0D12] px-4 py-12 text-[#E7E9EE]"><div className="mx-auto max-w-xl rounded-2xl border border-[#232838] bg-[#12151C] p-6 text-center"><h1 className="text-xl font-bold">Report unavailable</h1><p className="mt-2 text-sm text-[#8B92A5]">{error}</p></div></main>;

  return <main className="min-h-screen bg-[#0B0D12] px-4 py-8 text-[#E7E9EE]"><div className="mx-auto max-w-6xl">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3DDCFF]">JEE 2028 • Parent / Teacher report</div><h1 className="mt-1 text-3xl font-black">{studentName}'s progress</h1><p className="mt-1 text-sm text-[#8B92A5]">Read-only view • last 28 days • derived from actual logged work</p></div><a href="/personal-timetable" className="rounded-lg border border-[#232838] bg-[#12151C] px-3 py-2 text-sm text-[#8B92A5]">Open dashboard</a></header>

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Metric label="Questions" value={totalQuestions} /><Metric label="Avg Q/day" value={avgQ.toFixed(1)} /><Metric label="Self-study" value={`${totalHours.toFixed(1)} h`} /><Metric label="Avg routine" value={`${Math.round(avgAdherence * 100)}%`} /><Metric label="Overall execution" value={`${Math.round(avgScore * 100)}%`} /></section>

    <section className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
      <div className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="text-[15px] font-semibold">28-day execution heatmap</h2><p className="mt-1 text-[11px] text-[#565D70]">Intensity combines questions, self-study hours and routine adherence.</p><div className="mt-4 grid grid-cols-14 gap-1 sm:grid-cols-28">{ds.map((d) => { const l = payload.logs?.[d]; const s = l ? score(l) : 0; return <div key={d} className="aspect-square rounded" style={{ background: `rgba(61,220,255,${0.06 + s * .88})` }} title={`${d} • ${l ? totalQ(l) : 0} Q • ${l ? hours(l).toFixed(2) : 0} h • ${l ? Math.round(adherence(l) * 100) : 0}% routine`} />; })}</div></div>
      <div className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="text-[15px] font-semibold">What needs attention</h2><div className="mt-4 space-y-3 text-sm">{pendingDoubts > 0 && <Item text={`${pendingDoubts} doubt(s) remain uncleared`} tone="warn" />}{gtNeedsRepair > 0 && <Item text={`${gtNeedsRepair} GT repair item(s) still need reattempt/similar practice`} tone="warn" />}{avgHours < 6 && <Item text={`Average self-study is ${avgHours.toFixed(1)} h/day — below the 6–7 h target`} tone="warn" />}{avgQ < 40 && <Item text={`Average questions are ${avgQ.toFixed(1)}/day — below the working 40–60 range`} tone="warn" />}{pendingDoubts === 0 && gtNeedsRepair === 0 && avgHours >= 6 && avgQ >= 40 && <Item text="Current logged execution is on target" tone="good" />}</div></div>
    </section>

    <section className="mt-5 rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="text-[15px] font-semibold">Subject question volume</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{subjectTotals.map(({ subject, q }) => <div key={subject} className="rounded-xl border border-[#232838] bg-[#171B24] p-4"><div className="flex justify-between"><span style={{ color: COLORS[subject] }} className="font-bold">{LABEL[subject]}</span><span className="font-mono font-bold">{q}</span></div><div className="mt-3 h-2 rounded bg-[#0B0D12]"><div className="h-2 rounded" style={{ width: `${Math.min(100, q / Math.max(1, totalQuestions) * 100)}%`, background: COLORS[subject] }} /></div></div>)}</div></section>

    <section className="mt-5 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="text-[15px] font-semibold">GT / repair status</h2><div className="mt-4 grid grid-cols-3 gap-2"><Small label="Wrong" value={(payload.logs ? Object.values(payload.logs).reduce((s, l) => s + (l.gtWrong || 0), 0) : 0)} /><Small label="Unattempted" value={(payload.logs ? Object.values(payload.logs).reduce((s, l) => s + (l.gtUnattempted || 0), 0) : 0)} /><Small label="Doubts cleared" value={(payload.logs ? Object.values(payload.logs).reduce((s, l) => s + (l.doubtsCleared || 0), 0) : 0)} /></div></div>
      <div className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="text-[15px] font-semibold">Recent notes</h2><div className="mt-3 space-y-2">{logged.slice(-5).reverse().map(({ date, log }) => log?.notes ? <div key={date} className="rounded-lg bg-[#171B24] p-3 text-xs text-[#AAB0BF]"><span className="mr-2 font-mono text-[#565D70]">{date}</span>{log.notes}</div> : null)}{logged.filter((x) => x.log?.notes).length === 0 && <div className="text-xs text-[#565D70]">No notes logged yet.</div>}</div></div>
    </section>

    <footer className="mt-6 text-center text-[10px] font-mono text-[#565D70]">Read-only report • do not edit • progress is based on logged execution, not declared hours.</footer>
  </div></main>;
}

function Metric({ label, value }: { label: string; value: string | number }) { return <div className="rounded-xl border border-[#232838] bg-[#171B24] p-4 text-center"><div className="font-mono text-2xl font-black">{value}</div><div className="mt-1 text-[9px] uppercase tracking-widest text-[#565D70]">{label}</div></div>; }
function Small({ label, value }: { label: string; value: number }) { return <div className="rounded-lg border border-[#232838] bg-[#171B24] p-3 text-center"><div className="font-mono font-bold">{value}</div><div className="text-[9px] uppercase tracking-wider text-[#565D70]">{label}</div></div>; }
function Item({ text, tone }: { text: string; tone: "warn" | "good" }) { return <div className={`rounded-lg border px-3 py-2 text-xs ${tone === "good" ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-300" : "border-amber-400/20 bg-amber-400/5 text-amber-300"}`}>{text}</div>; }
