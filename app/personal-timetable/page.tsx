"use client";

import { useEffect, useMemo, useState } from "react";

type Subject = "phy" | "chem" | "math";
type Status = "done" | "progress" | "todo";
type RoutineItem = { id: string; time: string; title: string; desc: string; subject: Subject | "life"; duration: number; study: boolean; editable: boolean };
type Log = { q: Record<Subject, number>; routine: Record<string, boolean>; savedAt?: string };
type Payload = { rows: RoutineItem[]; logs: Record<string, Log>; syllabus: Record<string, Status> };
type PlanItem = { t: string; q: number; sub: Subject | "rev"; note?: string };
type DayPlan = { date: string; items?: PlanItem[]; revision?: boolean; note?: string };

const EXAM_DATE = "2026-09-12T00:00:00+05:30";
const DAILY_Q_TARGET = 50;
const DAILY_HOUR_TARGET = 6.5;
const SUBJECT_META: Record<Subject, { label: string; color: string; book: string }> = {
  phy: { label: "Physics", color: "#3DDCFF", book: "H.C. Verma Level 1" },
  chem: { label: "Chemistry", color: "#A78BFA", book: "N. Avasthi Level 1" },
  math: { label: "Maths", color: "#FFB454", book: "Target Level 1" },
};
const SYLLABUS: Record<Subject, { topics: { name: string; status: Status; note: string }[] }> = {
  phy: { topics: [
    { name: "Scalar & Vector", status: "done", note: "Completed — revision + JEE application" },
    { name: "Kinematics", status: "done", note: "Completed — mixed application practice" },
    { name: "Laws of Motion", status: "progress", note: "Strengthen friction, pulleys and connected-body application" },
    { name: "Work, Energy & Power", status: "progress", note: "Priority — fundamentals → Level 1 → JEE Main" },
  ] },
  chem: { topics: [
    { name: "Mole Concept", status: "done", note: "Completed — maintenance + mixed numericals" },
    { name: "Atomic Structure", status: "progress", note: "Priority — tuition + self-study + N. Avasthi Level 1" },
  ] },
  math: { topics: [
    { name: "Trigonometry", status: "done", note: "Completed — revision + problem recognition" },
    { name: "Sets", status: "done", note: "Completed — revision + application" },
    { name: "Relations & Functions", status: "done", note: "Completed — revision + application" },
    { name: "Straight Line", status: "progress", note: "New — Target Level 1" },
    { name: "Circle", status: "progress", note: "New — Target Level 1" },
  ] },
};
const DAILY_PLAN: DayPlan[] = [
  { date: "2026-08-21", items: [{ t: "Kinematics", q: 10, sub: "phy", note: "revision" }, { t: "Mole Concept + % Composition", q: 10, sub: "chem", note: "revision" }, { t: "WEP", q: 8, sub: "phy", note: "new topic" }, { t: "Trigonometry", q: 12, sub: "math", note: "revision" }] },
  { date: "2026-08-22", items: [{ t: "Kinematics", q: 10, sub: "phy", note: "revision" }, { t: "Mole Concept + % Composition", q: 10, sub: "chem", note: "revision" }, { t: "WEP", q: 7, sub: "phy", note: "new topic" }, { t: "Trigonometry", q: 13, sub: "math", note: "revision" }] },
  { date: "2026-08-23", items: [{ t: "Kinematics", q: 10, sub: "phy", note: "revision" }, { t: "Atomic Structure", q: 10, sub: "chem", note: "new topic" }, { t: "Sets + Relation & Function", q: 13, sub: "math", note: "revision" }, { t: "Trigonometry", q: 12, sub: "math", note: "revision" }] },
  { date: "2026-08-24", items: [{ t: "NLM", q: 12, sub: "phy", note: "revision" }, { t: "Atomic Structure", q: 10, sub: "chem", note: "new topic" }, { t: "Sets + Relation & Function", q: 13, sub: "math", note: "revision" }, { t: "Straight Line", q: 5, sub: "math", note: "new — Target Level 1" }] },
  { date: "2026-08-25", items: [{ t: "NLM", q: 12, sub: "phy", note: "revision" }, { t: "Atomic Structure", q: 10, sub: "chem", note: "new topic" }, { t: "Sets + Relation & Function", q: 12, sub: "math", note: "revision" }, { t: "Straight Line", q: 5, sub: "math", note: "new — Target Level 1" }] },
  { date: "2026-08-26", items: [{ t: "NLM", q: 6, sub: "phy", note: "revision" }, { t: "Friction", q: 8, sub: "phy", note: "application" }, { t: "Atomic Structure", q: 10, sub: "chem", note: "new topic" }, { t: "Sets + Relation & Function", q: 12, sub: "math", note: "revision" }, { t: "Circle", q: 5, sub: "math", note: "new — Target Level 1" }] },
  { date: "2026-08-27", items: [{ t: "Friction", q: 7, sub: "phy", note: "application" }, { t: "Atomic Structure", q: 10, sub: "chem", note: "new topic" }, { t: "Circle", q: 5, sub: "math", note: "new — Target Level 1" }, { t: "Mixed revision", q: 18, sub: "rev", note: "concept recognition" }] },
  { date: "2026-08-28", items: [{ t: "Mole Concept + % Composition", q: 10, sub: "chem", note: "revision" }, { t: "Trigonometry", q: 13, sub: "math", note: "revision" }, { t: "Mixed revision", q: 20, sub: "rev", note: "unfamiliar questions" }] },
  { date: "2026-08-29", items: [{ t: "Mole Concept + % Composition", q: 10, sub: "chem", note: "revision" }, { t: "Mixed revision", q: 35, sub: "rev", note: "application" }] },
  { date: "2026-08-30", items: [{ t: "Mixed revision — Chemistry priority", q: 20, sub: "rev" }, { t: "Mixed revision — Physics", q: 15, sub: "rev" }, { t: "Mixed revision — Maths", q: 10, sub: "rev" }] },
  { date: "2026-08-31", items: [{ t: "Mixed revision — Chemistry priority", q: 20, sub: "rev" }, { t: "Mixed revision — Physics", q: 15, sub: "rev" }, { t: "Mixed revision — Maths", q: 10, sub: "rev" }] },
  { date: "2026-09-01", items: [{ t: "Mixed revision — Chemistry priority", q: 18, sub: "chem" }, { t: "Mixed revision — Physics", q: 14, sub: "phy" }, { t: "Mixed revision — Maths", q: 12, sub: "math" }] },
  { date: "2026-09-02", items: [{ t: "Mixed revision — Chemistry priority", q: 18, sub: "chem" }, { t: "Mixed revision — Physics", q: 14, sub: "phy" }, { t: "Mixed revision — Maths", q: 12, sub: "math" }] },
  { date: "2026-09-03", items: [{ t: "Full-syllabus mock practice", q: 50, sub: "rev", note: "timed mixed Level 1" }] },
  { date: "2026-09-04", revision: true, note: "Light revision only — redo flagged/wrong questions and clear final doubts." },
  { date: "2026-09-05", revision: true, note: "Doubt-clearing deadline — no new heavy topics." },
  { date: "2026-09-06", items: [{ t: "GT-02 mock / selected mixed set", q: 45, sub: "rev", note: "timed + analyse immediately" }] },
  { date: "2026-09-07", items: [{ t: "Chemistry weak areas", q: 20, sub: "chem" }, { t: "Physics weak areas", q: 15, sub: "phy" }, { t: "Maths weak areas", q: 15, sub: "math" }] },
  { date: "2026-09-08", items: [{ t: "Chemistry application", q: 20, sub: "chem" }, { t: "NLM/WEP application", q: 15, sub: "phy" }, { t: "Straight Line/Circle", q: 15, sub: "math" }] },
  { date: "2026-09-09", items: [{ t: "Mixed JEE Main-level set", q: 50, sub: "rev", note: "unfamiliar questions" }] },
  { date: "2026-09-10", items: [{ t: "GT-02 style mini mock", q: 45, sub: "rev", note: "135-minute discipline practice" }] },
  { date: "2026-09-11", revision: true, note: "Light revision, formulas, marked doubts, confidence and sleep. No new grinding." },
];
const ROUTINE: RoutineItem[] = [
  { id: "wake", time: "11:00–11:45", title: "Wake up + breakfast + get ready", desc: "Start without rushing into study.", subject: "life", duration: 45, study: false, editable: false },
  { id: "chem", time: "11:45–13:45", title: "Self-study block 1", desc: "Chemistry priority — Atomic Structure / Mole maintenance / N. Avasthi Level 1.", subject: "chem", duration: 120, study: true, editable: true },
  { id: "lunch", time: "13:45–14:15", title: "Lunch break", desc: "Eat and reset.", subject: "life", duration: 30, study: false, editable: false },
  { id: "phy", time: "14:15–16:00", title: "Self-study block 2", desc: "Physics — WEP / NLM / Kinematics / H.C. Verma Level 1.", subject: "phy", duration: 105, study: true, editable: true },
  { id: "buffer", time: "16:00–16:30", title: "Travel / coaching buffer", desc: "Pack, travel, transition.", subject: "life", duration: 30, study: false, editable: false },
  { id: "coaching", time: "16:30–21:15", title: "Coaching", desc: "Class + travel buffer.", subject: "life", duration: 285, study: false, editable: false },
  { id: "dinner", time: "21:15–21:45", title: "Dinner + break", desc: "Reset before the night session.", subject: "life", duration: 30, study: false, editable: false },
  { id: "math", time: "21:45–23:15", title: "Self-study block 3", desc: "Maths — Straight Line / Circle / revision + Target Level 1.", subject: "math", duration: 90, study: true, editable: true },
  { id: "break", time: "23:15–23:30", title: "Short break", desc: "Reset.", subject: "life", duration: 15, study: false, editable: false },
  { id: "revision", time: "23:30–01:00", title: "Self-study block 4", desc: "Coaching homework + same-day revision.", subject: "life", duration: 90, study: true, editable: true },
  { id: "catchup", time: "01:00–03:00", title: "Buffer / catch-up / question finishing", desc: "Finish the target if needed; otherwise light revision.", subject: "life", duration: 120, study: true, editable: true },
  { id: "winddown", time: "03:00–03:30", title: "Wind down", desc: "Screens down, plan tomorrow.", subject: "life", duration: 30, study: false, editable: false },
  { id: "sleep", time: "03:30", title: "Sleep", desc: "Protect the sleep window.", subject: "life", duration: 0, study: false, editable: false },
];

function isoToday() { return new Date().toISOString().slice(0, 10); }
function fmtDate(iso: string) { return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function fmtWeekday(iso: string) { return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" }); }
function daysLeft(target: string) { return Math.max(0, Math.ceil((new Date(target).getTime() - Date.now()) / 86400000)); }
function shiftIso(iso: string, amount: number) { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + amount); return d.toISOString().slice(0, 10); }
function parseClock(s: string) { const m = s.trim().match(/^(\d{1,2})(?::(\d{2}))?$/); if (!m) return null; return { h: Number(m[1]), min: Number(m[2] ?? 0) }; }
function fmtClock(s: string) { const t = parseClock(s); if (!t) return s; const suffix = t.h >= 12 ? "PM" : "AM"; const h = t.h % 12 || 12; return `${h}:${String(t.min).padStart(2, "0")} ${suffix}`; }
function fmtTimeRange(s: string) { const parts = s.split(/[–-]/).map(x => x.trim()); if (parts.length === 2) return `${fmtClock(parts[0])} – ${fmtClock(parts[1])}`; return fmtClock(s); }
function defaultLog(): Log { return { q: { phy: 0, chem: 0, math: 0 }, routine: {} }; }
function planForDate(date: string) { return DAILY_PLAN.find(p => p.date === date); }
function planQuestions(date: string) { return planForDate(date)?.items?.reduce((sum, item) => sum + item.q, 0) ?? 0; }
function checkedMinutes(log: Log) { return ROUTINE.filter(r => r.study && log.routine[r.id]).reduce((sum, r) => sum + r.duration, 0); }
function studyHours(log: Log) { return checkedMinutes(log) / 60; }
function totalQuestions(log: Log) { return log.q.phy + log.q.chem + log.q.math; }
function adherence(log: Log) { const total = ROUTINE.filter(r => r.study).length; const done = ROUTINE.filter(r => r.study && log.routine[r.id]).length; return total ? done / total : 0; }
function dayScore(log: Log) { const h = Math.min(1, studyHours(log) / DAILY_HOUR_TARGET); const q = Math.min(1, totalQuestions(log) / DAILY_Q_TARGET); return Math.min(1, h * 0.5 + q * 0.25 + adherence(log) * 0.25); }
function subjectScore(log: Log, s: Subject) { const q = Math.min(1, log.q[s] / 18); const touched = ROUTINE.some(r => r.study && r.subject === s && log.routine[r.id]); return Math.min(1, q * 0.65 + (touched ? 1 : 0) * 0.35); }
function heatStyle(score: number) { return { backgroundColor: `rgba(61,220,255,${0.08 + score * 0.84})` }; }

export default function PersonalTimetablePage() {
  const [activeView, setActiveView] = useState<"today" | "schedule" | "progress" | "syllabus">("today");
  const [currentDate, setCurrentDate] = useState(isoToday());
  const [logs, setLogs] = useState<Record<string, Log>>({});
  const [syllabus, setSyllabus] = useState<Record<string, Status>>({});
  const [viewer, setViewer] = useState(false);
  const [studentName, setStudentName] = useState("JEE 2028 student");
  const [shareUrl, setShareUrl] = useState("");
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "saved" | "error">("idle");
  const log = logs[currentDate] ?? defaultLog();
  const todayQ = totalQuestions(log), todayHrs = studyHours(log), todayAdherence = adherence(log), todayPlanQ = planQuestions(currentDate);

  useEffect(() => {
    const share = new URLSearchParams(window.location.search).get("share");
    if (share) {
      setViewer(true);
      fetch(`/api/personal-timetable?share=${encodeURIComponent(share)}`).then(r => r.ok ? r.json() : Promise.reject(new Error("Share unavailable"))).then(data => { const p = data.payload as Payload; if (p?.logs) setLogs(p.logs); if (p?.syllabus) setSyllabus(p.syllabus); setStudentName(data.studentName ?? "JEE 2028 student"); }).catch(() => setSyncState("error"));
      return;
    }
    try { const local = localStorage.getItem("jee2028-grind-tracker"); if (local) { const p = JSON.parse(local) as Payload; if (p.logs) setLogs(p.logs); if (p.syllabus) setSyllabus(p.syllabus); } } catch {}
    fetch("/api/personal-timetable").then(r => r.ok ? r.json() : Promise.reject(new Error("Not signed in"))).then(data => { const p = data.payload as Payload | null; if (p?.logs) setLogs(p.logs); if (p?.syllabus) setSyllabus(p.syllabus); if (data.shareToken) setShareUrl(`${window.location.origin}/personal-timetable?share=${data.shareToken}`); }).catch(() => undefined);
  }, []);

  async function saveAll(nextLogs = logs, nextSyllabus = syllabus) {
    if (viewer) return;
    setSyncState("syncing");
    const payload: Payload = { rows: ROUTINE, logs: nextLogs, syllabus: nextSyllabus };
    localStorage.setItem("jee2028-grind-tracker", JSON.stringify(payload));
    try { const r = await fetch("/api/personal-timetable", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payload }) }); if (!r.ok) throw new Error("sync failed"); const data = await r.json(); if (data.shareToken) setShareUrl(`${window.location.origin}/personal-timetable?share=${data.shareToken}`); setSyncState("saved"); } catch { setSyncState("error"); }
  }
  function updateLog(patch: Partial<Log>, persist = true) { const next = { ...log, ...patch, savedAt: new Date().toISOString() }; const nextLogs = { ...logs, [currentDate]: next }; setLogs(nextLogs); setSyncState("idle"); if (persist) void saveAll(nextLogs, syllabus); }
  function toggleRoutine(id: string) { if (!viewer) updateLog({ routine: { ...log.routine, [id]: !log.routine[id] } }); }
  function toggleSyllabus(key: string) { if (viewer) return; const cur = syllabus[key] ?? "todo"; const next: Status = cur === "todo" ? "progress" : cur === "progress" ? "done" : "todo"; const ns = { ...syllabus, [key]: next }; setSyllabus(ns); void saveAll(logs, ns); }
  async function share() { await saveAll(); }

  const progressDays = useMemo(() => Array.from({ length: 28 }, (_, i) => { const iso = shiftIso(isoToday(), i - 27); return { iso, data: logs[iso] ?? null }; }), [logs]);
  const logged = progressDays.filter(d => d.data);
  const totalQ = logged.reduce((s, d) => s + (d.data ? totalQuestions(d.data) : 0), 0);
  const totalHrs = logged.reduce((s, d) => s + (d.data ? studyHours(d.data) : 0), 0);
  const avgQ = logged.length ? Math.round(totalQ / logged.length) : 0;
  const avgAdherence = logged.length ? logged.reduce((s, d) => s + (d.data ? adherence(d.data) : 0), 0) / logged.length : 0;
  let streak = 0; for (let i = progressDays.length - 1; i >= 0; i--) { const d = progressDays[i].data; if (d && totalQuestions(d) >= 40) streak++; else break; }

  return <main className="min-h-screen bg-[#0B0D12] text-[#E7E9EE]"><div className="mx-auto max-w-[980px] px-4 pb-20 pt-5 sm:px-6">
    <nav className="mb-5 flex gap-1 overflow-x-auto rounded-[12px] border border-[#232838] bg-[#12151C] p-1">{([['today','Today'],['schedule','Schedule'],['progress','Progress'],['syllabus','Syllabus']] as const).map(([k,l]) => <button key={k} onClick={() => setActiveView(k)} className={`whitespace-nowrap rounded-[8px] px-4 py-2.5 text-[13px] font-semibold ${activeView === k ? 'bg-[#171B24] text-[#E7E9EE] shadow-[inset_0_0_0_1px_#232838]' : 'text-[#8B92A5] hover:text-[#E7E9EE]'}`}>{l}</button>)}</nav>

    {activeView === "today" && <div className="space-y-4">
      <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><div className="text-[26px] font-bold">{fmtDate(currentDate)}</div><div className="text-[13px] text-[#8B92A5]">{fmtWeekday(currentDate)} {viewer ? `· ${studentName} · read-only` : "· personal timetable"}</div></div><div className="flex gap-2"><button disabled={viewer} onClick={() => setCurrentDate(shiftIso(currentDate,-1))} className="h-9 w-9 rounded-[9px] border border-[#232838] bg-[#171B24]">‹</button><button disabled={viewer} onClick={() => setCurrentDate(isoToday())} className="h-9 w-9 rounded-[9px] border border-[#232838] bg-[#171B24]">•</button><button disabled={viewer} onClick={() => setCurrentDate(shiftIso(currentDate,1))} className="h-9 w-9 rounded-[9px] border border-[#232838] bg-[#171B24]">›</button></div></div>
        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5"><Metric value={todayQ} label="Questions"/><Metric value={todayHrs.toFixed(2)} label="Study hours"/><Metric value={`${Math.round(todayAdherence*100)}%`} label="Routine done"/><Metric value={`${['phy','chem','math'].map(s => ROUTINE.some(r => r.study && r.subject === s && log.routine[r.id]) ? 1 : 0).join('/')}`} label="P / C / M touched"/><Metric value={`${daysLeft(EXAM_DATE)}d`} label="To GT-02"/></div>
        <div className="grid gap-3 md:grid-cols-3">{(['phy','chem','math'] as Subject[]).map(s => <div key={s} className="rounded-xl border border-[#232838] bg-[#171B24] p-3"><div className="mb-2 font-bold" style={{color:SUBJECT_META[s].color}}>{SUBJECT_META[s].label}</div><div className="text-[10px] uppercase tracking-wider text-[#565D70]">Questions solved</div><input disabled={viewer} type="number" min={0} value={log.q[s] || ""} onChange={e => updateLog({q:{...log.q,[s]:Number(e.target.value)||0}})} className="mt-1 w-full rounded-lg border border-[#232838] bg-[#0B0D12] px-2.5 py-2 font-mono text-sm outline-none disabled:opacity-60"/><div className="mt-2 text-[11px] text-[#565D70]">Book: {SUBJECT_META[s].book}</div></div>)}</div>
        {!viewer && <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => void saveAll()} className="rounded-lg bg-[#3DDCFF] px-5 py-2.5 font-semibold text-[#031014]">{syncState === 'syncing' ? 'Saving…' : syncState === 'saved' ? 'Saved ✓' : 'Save progress'}</button><button onClick={share} className="rounded-lg border border-[#232838] bg-[#171B24] px-4 py-2.5 text-sm text-[#8B92A5]">Create / refresh parent-teacher link</button>{shareUrl && <span className="max-w-full break-all self-center text-[10px] text-[#565D70]">{shareUrl}</span>}</div>}
      </section>

      <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><div className="mb-3 flex items-center justify-between"><h2 className="text-[15px] font-semibold">Today's syllabus target</h2><span className="text-[11px] text-[#565D70]">{todayPlanQ ? `${todayPlanQ} planned Qs` : "No fixed plan"}</span></div>{planForDate(currentDate)?.revision ? <div className="rounded-xl border border-[#4ADE80]/20 bg-[#4ADE80]/5 p-3 text-sm text-[#4ADE80]">🔁 {planForDate(currentDate)?.note}</div> : <div className="space-y-2">{planForDate(currentDate)?.items?.map(item => <div key={`${item.t}-${item.sub}`} className="flex items-center gap-3 border-b border-[#232838] py-2 last:border-b-0"><div className="w-16 text-[10px] font-bold" style={{color:item.sub==='rev'?'#4ADE80':SUBJECT_META[item.sub].color}}>{item.sub==='rev'?'REV':SUBJECT_META[item.sub].label.slice(0,4).toUpperCase()}</div><div className="flex-1 text-[13px]">{item.t}<div className="text-[10px] text-[#565D70]">{item.note}</div></div><div className="rounded-lg bg-[#171B24] px-2.5 py-1 font-mono text-sm">{item.q}</div></div>)}</div>}</section>

      <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><div className="mb-3 flex items-center justify-between"><div><h2 className="text-[15px] font-semibold">Today's routine</h2><p className="text-[11px] text-[#565D70]">Tick completed study blocks. Study hours calculate automatically.</p></div><div className="text-right"><div className="font-mono text-lg font-bold text-[#4ADE80]">{todayHrs.toFixed(2)} h</div><div className="text-[9px] uppercase tracking-wider text-[#565D70]">of {DAILY_HOUR_TARGET} h target</div></div></div><div className="mb-4 h-2 overflow-hidden rounded-full bg-[#171B24]"><div className="h-full rounded-full bg-[#3DDCFF] transition-all" style={{width:`${Math.min(100,todayAdherence*100)}%`}}/></div><div>{ROUTINE.map(item => { const checked=!!log.routine[item.id]; return <label key={item.id} className="flex gap-3 border-b border-[#232838] py-3 last:border-b-0"><div className="w-[105px] shrink-0 font-mono text-[11px] text-[#565D70]">{fmtTimeRange(item.time)}</div><div><input type="checkbox" disabled={viewer || !item.editable} checked={checked} onChange={() => toggleRoutine(item.id)} className="h-4 w-4 accent-[#3DDCFF] disabled:opacity-50"/></div><div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{background:item.subject==='life'?'#565D70':SUBJECT_META[item.subject].color}}/><div className="flex-1"><div className={`text-[13px] font-semibold ${checked?'text-[#E7E9EE]':'text-[#8B92A5]'}`}>{item.title}{item.study && <span className="ml-2 text-[10px] font-normal text-[#565D70]">{Math.floor(item.duration/60)}h {item.duration%60?`${item.duration%60}m`:''}</span>}</div><div className="text-[12px] text-[#565D70]">{item.desc}</div></div>{checked && <div className="text-xs font-bold text-[#4ADE80]">✓</div>}</label>})}</div></section>
    </div>}

    {activeView === "schedule" && <ScheduleView />}
    {activeView === "progress" && <ProgressView progressDays={progressDays} totalQ={totalQ} avgQ={avgQ} streak={streak} totalHrs={totalHrs} avgAdherence={avgAdherence}/>} 
    {activeView === "syllabus" && <SyllabusView syllabus={syllabus} onToggle={toggleSyllabus} viewer={viewer}/>} 

    <footer className="mt-8 text-center font-mono text-[10px] text-[#565D70]">{viewer ? "Read-only shared progress" : "Private owner dashboard · parent/teacher view is read-only"}</footer>
  </div></main>;
}

function Metric({value,label}:{value:string|number;label:string}) { return <div className="rounded-xl border border-[#232838] bg-[#171B24] p-3"><div className="font-mono text-lg font-bold">{value}</div><div className="text-[10px] uppercase tracking-wider text-[#565D70]">{label}</div></div>; }

function ScheduleView() { return <div className="space-y-4">
  <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-1 text-[15px] font-semibold">Day-by-day plan → GT-02</h2><p className="mb-4 text-[12px] text-[#565D70]">New topics move forward while completed topics stay alive through revision and application.</p>{DAILY_PLAN.map(p => { const total=planQuestions(p.date); const current=p.date===isoToday(); return <div key={p.date} className={`border-b border-[#232838] py-3 last:border-b-0 ${current?'rounded-lg bg-[#3DDCFF]/5 px-3':''}`}><div className="mb-1 flex items-center gap-2 text-[12px] font-bold">{fmtDate(p.date)} {current && <span className="rounded-full bg-[#3DDCFF] px-2 py-0.5 text-[9px] text-[#031014]">TODAY</span>}</div>{p.revision ? <div className="text-[12px] text-[#4ADE80]">🔁 {p.note}</div> : <div className="text-[12.5px] leading-6">{p.items?.map((i,idx) => <span key={idx}><span style={{color:i.sub==='rev'?'#4ADE80':SUBJECT_META[i.sub].color}}>{i.sub==='rev'?'REV':SUBJECT_META[i.sub].label}</span>: {i.t} ({i.q}){idx<(p.items?.length??1)-1?' · ':''}</span>)} <strong> · = {total} Qs</strong></div>}</div>})}</section>
  <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-3 text-[15px] font-semibold">Exact daily routine</h2>{ROUTINE.map(item => <div key={item.id} className="flex gap-3 border-b border-[#232838] py-2.5 last:border-b-0"><div className="w-[105px] shrink-0 font-mono text-[11px] text-[#3DDCFF]">{fmtTimeRange(item.time)}</div><div className="flex-1 text-[13px]">{item.title}<div className="text-[11px] text-[#8B92A5]">{item.desc}</div></div>{item.study && <div className="font-mono text-[11px] text-[#4ADE80]">{(item.duration/60).toFixed(2)}h</div>}</div>)}</section>
  <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-3 text-[15px] font-semibold">Non-negotiables</h2>{['40–60 questions is the working daily range; 50 is the aim.','6–7 hours self-study separate from coaching.','Touch Physics, Chemistry and Maths every day.','Clear Level 1 external-book questions before moving up.','Chemistry gets slightly more weight.'].map(x => <div key={x} className="flex gap-2 border-b border-[#232838] py-2.5 text-[12.5px] last:border-b-0"><span className="text-[#3DDCFF]">•</span><span>{x}</span></div>)}</section>
</div>; }

function ProgressView({progressDays,totalQ,avgQ,streak,totalHrs,avgAdherence}:{progressDays:{iso:string;data:Log|null}[];totalQ:number;avgQ:number;streak:number;totalHrs:number;avgAdherence:number}) {
  const last21=progressDays.slice(-21); const maxQ=Math.max(60,...last21.map(d=>d.data?totalQuestions(d.data):0));
  return <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5"><Metric value={totalQ} label="Total Qs / 28d"/><Metric value={totalHrs.toFixed(1)} label="Study hours / 28d"/><Metric value={avgQ} label="Average Q / day"/><Metric value={streak} label="40+ Q streak"/><Metric value={`${Math.round(avgAdherence*100)}%`} label="Routine adherence"/></div>
    <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><div className="mb-3 flex items-end justify-between"><div><h2 className="text-[15px] font-semibold">Questions solved — last 21 days</h2><p className="text-[11px] text-[#565D70]">Bar height = questions. Opacity = combined execution score.</p></div><span className="text-[10px] text-[#565D70]">Target 50 Q/day</span></div><div className="flex h-44 items-end gap-1 overflow-x-auto">{last21.map(d=>{const q=d.data?totalQuestions(d.data):0; const score=d.data?dayScore(d.data):0; const h=q?Math.max(8,Math.round((q/maxQ)*150)):4; return <div key={d.iso} className="flex h-full min-w-[20px] flex-1 flex-col items-center justify-end gap-1"><span className="text-[7px] text-[#565D70]">{q||''}</span><div className="w-full rounded-t-sm bg-[#3DDCFF]" style={{height:`${h}px`,opacity:0.12+score*0.88}} title={`${d.iso}: ${q} Q, ${d.data?studyHours(d.data).toFixed(2):0} h, ${d.data?Math.round(adherence(d.data)*100):0}% routine`}/><div className="h-1 w-full rounded bg-[#4ADE80]/20"/></div>})}</div></section>

    <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><div className="mb-3 flex items-center justify-between"><div><h2 className="text-[15px] font-semibold">Execution heatmap</h2><p className="text-[11px] text-[#565D70]">Questions + self-study hours + timetable adherence. Bright means the day was actually executed.</p></div><div className="flex items-center gap-1 text-[9px] text-[#565D70]"><span>Low</span>{[0.05,0.25,0.45,0.65,0.85].map(v=><span key={v} className="h-3 w-3 rounded" style={heatStyle(v)}/>)}<span>High</span></div></div><div className="grid grid-cols-7 gap-1 sm:grid-cols-14 md:grid-cols-28">{progressDays.map(d=>{const score=d.data?dayScore(d.data):0; return <div key={d.iso} className="aspect-square rounded-[4px] border border-[#232838]" style={heatStyle(score)} title={`${fmtDate(d.iso)} • ${d.data?totalQuestions(d.data):0} Q • ${d.data?studyHours(d.data).toFixed(2):0} h • ${d.data?Math.round(adherence(d.data)*100):0}% routine`}/>})}</div></section>

    <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-1 text-[15px] font-semibold">Subject intensity heatmaps</h2><p className="mb-4 text-[11px] text-[#565D70]">Each subject has independent intensity from its question count plus whether its scheduled block was completed.</p>{(['phy','chem','math'] as Subject[]).map(s=><div key={s} className="mb-4 last:mb-0"><div className="mb-1 flex justify-between text-[11px]"><span style={{color:SUBJECT_META[s].color}}>{SUBJECT_META[s].label}</span><span className="text-[#565D70]">{SUBJECT_META[s].book}</span></div><div className="grid grid-cols-14 gap-1">{progressDays.map(d=>{const score=d.data?subjectScore(d.data,s):0; const c=SUBJECT_META[s].color; return <div key={d.iso} className="aspect-square rounded-[4px]" title={`${fmtDate(d.iso)} • ${d.data?d.data.q[s]:0} Q`} style={{backgroundColor:`${c}${Math.round(20+score*220).toString(16).padStart(2,'0')}`,boxShadow:score>0.3?`inset 0 0 0 1px ${c}55`:undefined}}/>})}</div></div>)}</section>

    <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-1 text-[15px] font-semibold">28-day study-hours graph</h2><p className="mb-4 text-[11px] text-[#565D70]">Bars are derived automatically from checked study blocks — no manual hour entry.</p><div className="flex h-40 items-end gap-1 overflow-x-auto">{progressDays.map(d=>{const h=d.data?studyHours(d.data):0; return <div key={d.iso} className="flex h-full min-w-[18px] flex-1 flex-col justify-end"><div className="rounded-t bg-[#A78BFA]" style={{height:`${Math.min(100,(h/DAILY_HOUR_TARGET)*100)}%`,opacity:h?0.25+Math.min(1,h/DAILY_HOUR_TARGET)*0.75:0.08}} title={`${fmtDate(d.iso)} • ${h.toFixed(2)} h`}/></div>})}</div></section>
  </div>;
}

function SyllabusView({syllabus,onToggle,viewer}:{syllabus:Record<string,Status>;onToggle:(k:string)=>void;viewer:boolean}) {
  const entries=(Object.entries(SYLLABUS) as [Subject,typeof SYLLABUS[Subject]][]); const total=entries.reduce((s,[,v])=>s+v.topics.length,0); const done=entries.reduce((s,[sub,v])=>s+v.topics.filter(t=>(syllabus[`${sub}:${t.name}`]??t.status)==='done').length,0);
  return <div className="space-y-4"><section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-2 text-[15px] font-semibold">GT-02 syllabus completion</h2><div className="h-2 overflow-hidden rounded-full bg-[#171B24]"><div className="h-full rounded-full bg-[#3DDCFF]" style={{width:`${total?(done/total)*100:0}%`}}/></div><div className="mt-2 text-[11px] text-[#565D70]">{done}/{total} topics complete</div></section>{entries.map(([sub,v])=><section key={sub} className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-3 text-[15px] font-semibold" style={{color:SUBJECT_META[sub].color}}>{SUBJECT_META[sub].label}<span className="ml-2 text-[10px] font-normal text-[#565D70]">{SUBJECT_META[sub].book}</span></h2>{v.topics.map(t=>{const key=`${sub}:${t.name}`;const status=syllabus[key]??t.status;return <button key={key} disabled={viewer} onClick={()=>onToggle(key)} className="mb-2 flex w-full items-center justify-between gap-3 rounded-xl border border-[#232838] bg-[#171B24] p-3 text-left disabled:opacity-70"><span className="flex-1"><span className="block text-[13px] font-semibold">{t.name}</span><span className="text-[11px] text-[#565D70]">{t.note}</span></span><span className="rounded-full px-2 py-1 text-[9px] uppercase" style={{backgroundColor:status==='done'?'#4ADE8020':status==='progress'?'#3DDCFF20':'#232838',color:status==='done'?'#4ADE80':status==='progress'?'#3DDCFF':'#8B92A5'}}>{status}</span></button>})}</section>)}</div>;
}
