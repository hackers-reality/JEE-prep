"use client";

import { useEffect, useMemo, useState } from "react";

type Subject = "phy" | "chem" | "math";
type Status = "done" | "progress" | "todo";
type RoutineItem = { id: string; time: string; title: string; desc: string; subject: Subject | "life"; duration: number; study: boolean; editable: boolean };
type Log = { q: Record<Subject, number>; routine: Record<string, boolean>; notes: string; savedAt?: string };
type Payload = { rows: RoutineItem[]; logs: Record<string, Log>; syllabus: Record<string, Status> };
type PlanItem = { t: string; q: number; sub: Subject | "rev"; note?: string };
type DayPlan = { date: string; items?: PlanItem[]; revision?: boolean; note?: string };

const EXAM_DATE = "2026-09-12T00:00:00+05:30";
const DOUBT_DEADLINE = "2026-09-05T00:00:00+05:30";
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
    { name: "Work, Energy & Power", status: "progress", note: "New priority — build fundamentals → Level 1 → JEE Main" },
  ] },
  chem: { topics: [
    { name: "Mole Concept", status: "done", note: "Completed — maintenance + mixed numericals" },
    { name: "Atomic Structure", status: "progress", note: "New priority — tuition + self-study + N. Avasthi Level 1" },
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
  { date: "2026-09-01", items: [{ t: "Mixed revision — Chemistry priority", q: 18, sub: "rev" }, { t: "Mixed revision — Physics", q: 14, sub: "phy" }, { t: "Mixed revision — Maths", q: 12, sub: "math" }] },
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
  { id: "chem", time: "11:45–13:45", title: "Self-study block 1", desc: "Chemistry priority — Atomic Structure / maintenance / N. Avasthi Level 1.", subject: "chem", duration: 120, study: true, editable: true },
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
function shiftIso(iso: string, amount: number) { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + amount); return d.toISOString().slice(0, 10); }
function daysLeft(target: string) { return Math.max(0, Math.ceil((new Date(target).getTime() - Date.now()) / 86400000)); }
function defaultLog(): Log { return { q: { phy: 0, chem: 0, math: 0 }, routine: {}, notes: "" }; }
function planForDate(date: string) { return DAILY_PLAN.find((p) => p.date === date); }
function planQuestions(date: string) { return planForDate(date)?.items?.reduce((sum, item) => sum + item.q, 0) ?? 0; }
function checkedMinutes(log: Log) { return ROUTINE.filter((r) => r.study && log.routine[r.id]).reduce((sum, r) => sum + r.duration, 0); }
function studyHours(log: Log) { return checkedMinutes(log) / 60; }
function totalQuestions(log: Log) { return log.q.phy + log.q.chem + log.q.math; }
function adherence(log: Log) { const total = ROUTINE.filter((r) => r.study).length; const done = ROUTINE.filter((r) => r.study && log.routine[r.id]).length; return total ? done / total : 0; }
function dayScore(log: Log) { const h = Math.min(1, studyHours(log) / DAILY_HOUR_TARGET); const q = Math.min(1, totalQuestions(log) / DAILY_Q_TARGET); return Math.min(1, h * 0.5 + q * 0.25 + adherence(log) * 0.25); }
function heatStyle(score: number) { const alpha = 0.08 + score * 0.84; return { backgroundColor: `rgba(61,220,255,${alpha})` }; }

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
      fetch(`/api/personal-timetable?share=${encodeURIComponent(share)}`).then((r) => r.ok ? r.json() : Promise.reject(new Error("Share unavailable"))).then((data) => { const p = data.payload as Payload; if (p?.logs) setLogs(p.logs); if (p?.syllabus) setSyllabus(p.syllabus); setStudentName(data.studentName ?? "JEE 2028 student"); }).catch(() => setSyncState("error"));
      return;
    }
    try { const local = localStorage.getItem("jee2028-grind-tracker"); if (local) { const p = JSON.parse(local) as Payload; if (p.logs) setLogs(p.logs); if (p.syllabus) setSyllabus(p.syllabus); } } catch {}
    fetch("/api/personal-timetable").then((r) => r.ok ? r.json() : Promise.reject(new Error("Not signed in"))).then((data) => { const p = data.payload as Payload | null; if (p?.logs) setLogs(p.logs); if (p?.syllabus) setSyllabus(p.syllabus); if (data.shareToken) setShareUrl(`${window.location.origin}/personal-timetable?share=${data.shareToken}`); }).catch(() => undefined);
  }, []);

  async function saveAll(nextLogs = logs, nextSyllabus = syllabus) {
    if (viewer) return;
    setSyncState("syncing");
    const payload: Payload = { rows: ROUTINE, logs: nextLogs, syllabus: nextSyllabus };
    localStorage.setItem("jee2028-grind-tracker", JSON.stringify(payload));
    try { const r = await fetch("/api/personal-timetable", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payload }) }); if (!r.ok) throw new Error("sync failed"); const data = await r.json(); if (data.shareToken) setShareUrl(`${window.location.origin}/personal-timetable?share=${data.shareToken}`); setSyncState("saved"); } catch { setSyncState("error"); }
  }
  function updateLog(patch: Partial<Log>, persist = true) { const next = { ...log, ...patch } as Log; const nextLogs = { ...logs, [currentDate]: { ...next, savedAt: new Date().toISOString() } }; setLogs(nextLogs); setSyncState("idle"); if (persist) void saveAll(nextLogs, syllabus); }
  function toggleRoutine(id: string) { if (viewer) return; updateLog({ routine: { ...log.routine, [id]: !log.routine[id] } }); }
  async function share() { await saveAll(); }
  function toggleSyllabus(key: string) { if (viewer) return; const current = syllabus[key] ?? "todo"; const next: Status = current === "todo" ? "progress" : current === "progress" ? "done" : "todo"; const ns = { ...syllabus, [key]: next }; setSyllabus(ns); void saveAll(logs, ns); }

  const progressDays = useMemo(() => Array.from({ length: 28 }, (_, i) => { const iso = shiftIso(isoToday(), i - 27); return { iso, data: logs[iso] ?? null }; }), [logs]);
  const logged = progressDays.filter((d) => d.data);
  const totalQ = logged.reduce((s, d) => s + (d.data ? totalQuestions(d.data) : 0), 0);
  const totalHrs = logged.reduce((s, d) => s + (d.data ? studyHours(d.data) : 0), 0);
  const avgQ = logged.length ? Math.round(totalQ / logged.length) : 0;
  let streak = 0; for (let i = progressDays.length - 1; i >= 0; i--) { const d = progressDays[i].data; if (d && totalQuestions(d) >= 40) streak++; else break; }

  return <main className="min-h-screen bg-[#0B0D12] text-[#E7E9EE]"><div className="mx-auto max-w-[980px] px-4 pb-20 pt-5 sm:px-6">
    <nav className="mb-5 flex gap-1 overflow-x-auto rounded-[12px] border border-[#232838] bg-[#12151C] p-1">{([['today','Today'],['schedule','Schedule'],['progress','Progress'],['syllabus','Syllabus']] as const).map(([k,l]) => <button key={k} onClick={() => setActiveView(k)} className={`whitespace-nowrap rounded-[8px] px-4 py-2.5 text-[13px] font-semibold ${activeView===k?'bg-[#171B24] text-[#E7E9EE]':'text-[#8B92A5]'}`}>{l}</button>)}</nav>
    {activeView === "today" && <div className="space-y-4">
      <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><div className="text-[26px] font-bold">{fmtDate(currentDate)}</div><div className="text-[13px] text-[#8B92A5]">{fmtWeekday(currentDate)} {viewer ? `· ${studentName} · read-only` : "· your personal dashboard"}</div></div><div className="flex gap-2"><button disabled={viewer} onClick={()=>setCurrentDate(shiftIso(currentDate,-1))} className="h-9 w-9 rounded-[9px] border border-[#232838] bg-[#171B24]">‹</button><button disabled={viewer} onClick={()=>setCurrentDate(isoToday())} className="h-9 w-9 rounded-[9px] border border-[#232838] bg-[#171B24]">•</button><button disabled={viewer} onClick={()=>setCurrentDate(shiftIso(currentDate,1))} className="h-9 w-9 rounded-[9px] border border-[#232838] bg-[#171B24]">›</button></div></div>
        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5"><Metric value={todayQ} label="Questions" good={todayQ>=DAILY_Q_TARGET}/><Metric value={todayHrs.toFixed(2)} label="Study hours" good={todayHrs>=DAILY_HOUR_TARGET}/><Metric value={`${Math.round(todayAdherence*100)}%`} label="Routine done" good={todayAdherence>=1}/><Metric value={`${subjectTouch('phy')?1:0}/${subjectTouch('chem')?1:0}/${subjectTouch('math')?1:0}`} label="P / C / M touched" good={subjectTouch('phy')&&subjectTouch('chem')&&subjectTouch('math')}/><Metric value={`${daysLeft(DOUBT_DEADLINE)}d`} label="To doubt deadline" good={daysLeft(DOUBT_DEADLINE)<=7}/></div>
        <div className="grid gap-3 md:grid-cols-3">{(['phy','chem','math'] as Subject[]).map(s => <div key={s} className="rounded-xl border border-[#232838] bg-[#171B24] p-3"><div className="mb-2 font-bold" style={{color:SUBJECT_META[s].color}}>{SUBJECT_META[s].label}</div><div className="text-[10px] uppercase tracking-wider text-[#565D70]">Questions solved</div><input disabled={viewer} type="number" min={0} value={log.q[s] || ""} onChange={e=>updateLog({q:{...log.q,[s]:Number(e.target.value)||0}})} className="mt-1 w-full rounded-lg border border-[#232838] bg-[#0B0D12] px-2.5 py-2 font-mono text-sm disabled:opacity-60"/><div className="mt-2 text-[11px] text-[#565D70]">Book: {SUBJECT_META[s].book}</div></div>)}</div>
        <div className="mt-4"><label className="text-[10px] uppercase tracking-wider text-[#565D70]">Daily notes</label><textarea disabled={viewer} value={log.notes} onChange={e=>updateLog({notes:e.target.value},false)} onBlur={()=>void saveAll()} placeholder="Optional note about today's study." className="mt-1 min-h-[60px] w-full rounded-lg border border-[#232838] bg-[#171B24] px-3 py-2 text-sm disabled:opacity-60"/></div>
        {!viewer && <div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>void saveAll()} className="rounded-lg bg-[#3DDCFF] px-5 py-2.5 font-semibold text-[#031014]">{syncState==='syncing'?'Saving…':syncState==='saved'?'Saved ✓':'Save today'}</button><button onClick={share} className="rounded-lg border border-[#232838] bg-[#171B24] px-4 py-2.5 text-sm text-[#8B92A5]">Create / refresh parent-teacher link</button>{shareUrl&&<span className="max-w-full break-all self-center text-[10px] text-[#565D70]">{shareUrl}</span>}</div>}
      </section>
      <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><div className="mb-3 flex items-center justify-between"><h2 className="text-[15px] font-semibold">Today's syllabus target</h2><span className="text-[11px] text-[#565D70]">{todayPlanQ ? `${todayPlanQ} planned Qs` : "No fixed plan"}</span></div>{planForDate(currentDate)?.revision?<div className="rounded-xl border border-[#4ADE80]/20 bg-[#4ADE80]/5 p-3 text-sm text-[#4ADE80]">🔁 {planForDate(currentDate)?.note}</div>:<div className="space-y-2">{planForDate(currentDate)?.items?.map(item=><div key={`${item.t}-${item.sub}`} className="flex items-center gap-3 border-b border-[#232838] py-2 last:border-b-0"><div className="w-16 text-[10px] font-bold" style={{color:item.sub==='rev'?'#4ADE80':SUBJECT_META[item.sub].color}}>{item.sub==='rev'?'REV':SUBJECT_META[item.sub].label.slice(0,4).toUpperCase()}</div><div className="flex-1 text-[13px]">{item.t}<div className="text-[10px] text-[#565D70]">{item.note}</div></div><div className="rounded-lg bg-[#171B24] px-2.5 py-1 font-mono text-sm">{item.q}</div></div>)}</div>}</section>
      <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><div className="mb-3 flex items-center justify-between"><div><h2 className="text-[15px] font-semibold">Today's routine</h2><p className="text-[11px] text-[#565D70]">Tick completed study blocks. Study hours calculate automatically.</p></div><div className="text-right"><div className="font-mono text-lg font-bold text-[#4ADE80]">{todayHrs.toFixed(2)} h</div><div className="text-[9px] uppercase tracking-wider text-[#565D70]">of {DAILY_HOUR_TARGET} h target</div></div></div><div className="mb-4 h-2 overflow-hidden rounded-full bg-[#171B24]"><div className="h-full rounded-full bg-[#3DDCFF]" style={{width:`${Math.min(100,todayAdherence*100)}%`}}/></div><div>{ROUTINE.map(item=>{const checked=!!log.routine[item.id];return <label key={item.id} className="flex gap-3 border-b border-[#232838] py-3 last:border-b-0"><div className="w-[80px] shrink-0 font-mono text-[11px] text-[#565D70]">{item.time}</div><div><input type="checkbox" disabled={viewer || !item.editable} checked={checked} onChange={()=>toggleRoutine(item.id)} className="h-4 w-4 accent-[#3DDCFF]"/></div><div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{background:item.subject==='life'?'#565D70':SUBJECT_META[item.subject].color}}/><div className="flex-1"><div className={`text-[13px] font-semibold ${checked?'text-[#E7E9EE]':'text-[#8B92A5]'}`}>{item.title}{item.study&&<span className="ml-2 text-[10px] font-normal text-[#565D70]">{Math.floor(item.duration/60)}h {item.duration%60?`${item.duration%60}m`:''}</span>}</div><div className="text-[12px] text-[#565D70]">{item.desc}</div></div>{checked&&<div className="text-xs font-bold text-[#4ADE80]">✓</div>}</label>})}</div></section>
    </div>}
    {activeView === "schedule" && <ScheduleView />}
    {activeView === "progress" && <ProgressView logs={logs} progressDays={progressDays} totalQ={totalQ} avgQ={avgQ} streak={streak} totalHrs={totalHrs}/>} 
    {activeView === "syllabus" && <SyllabusView syllabus={syllabus} onToggle={toggleSyllabus} viewer={viewer}/>} 
  </div></main>;

  function subjectTouch(s: Subject) { return ROUTINE.some(r => r.study && r.subject === s && log.routine[r.id]) || log.q[s] > 0; }
}

function Metric({value,label,good}:{value:string|number;label:string;good:boolean}) { return <div className="rounded-xl border border-[#232838] bg-[#171B24] p-3"><div className="font-mono text-lg font-bold">{value}</div><div className="text-[10px] uppercase tracking-wider text-[#565D70]">{label}</div></div>; }
function ScheduleView(){ return <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-4 text-lg font-bold">Weekly schedule</h2><div className="space-y-2">{DAILY_PLAN.map(p=><div key={p.date} className="rounded-xl border border-[#232838] bg-[#171B24] p-3"><div className="font-semibold">{fmtDate(p.date)}</div><div className="text-xs text-[#8B92A5]">{p.revision ? p.note : `${planQuestions(p.date)} planned questions`}</div></div>)}</div></section>; }
function ProgressView({logs,progressDays,totalQ,avgQ,streak,totalHrs}:{logs:Record<string,Log>;progressDays:{iso:string;data:Log|null}[];totalQ:number;avgQ:number;streak:number;totalHrs:number}) { return <section className="space-y-4"><div className="grid gap-3 sm:grid-cols-4"><Metric value={totalQ} label="Questions / 28d" good={totalQ>0}/><Metric value={totalHrs.toFixed(1)} label="Study hours / 28d" good={totalHrs>0}/><Metric value={avgQ} label="Average Q / day" good={avgQ>=DAILY_Q_TARGET}/><Metric value={streak} label="40+ Q streak" good={streak>0}/></div><div className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-3 text-lg font-bold">Execution heatmap</h2><div className="grid grid-cols-7 gap-2">{progressDays.map(d=><div key={d.iso} title={`${fmtDate(d.iso)} · ${d.data?totalQuestions(d.data):0} Q · ${d.data?studyHours(d.data).toFixed(1):0} h`} className="aspect-square rounded-md border border-[#232838]" style={heatStyle(d.data?dayScore(d.data):0)} />)}</div></div></section>; }
function SyllabusView({syllabus,onToggle,viewer}:{syllabus:Record<string,Status>;onToggle:(k:string)=>void;viewer:boolean}) { return <section className="space-y-4">{(Object.keys(SYLLABUS) as Subject[]).map(s=><div key={s} className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-3 text-lg font-bold" style={{color:SUBJECT_META[s].color}}>{SUBJECT_META[s].label}</h2>{SYLLABUS[s].topics.map(t=>{const key=`${s}:${t.name}`;const status=syllabus[key]??t.status;return <button disabled={viewer} key={key} onClick={()=>onToggle(key)} className="flex w-full items-center gap-3 border-b border-[#232838] py-3 text-left last:border-b-0"><span className="w-20 rounded-full bg-[#171B24] px-2 py-1 text-center text-[10px] uppercase">{status}</span><span className="flex-1 text-sm font-semibold">{t.name}<span className="ml-2 text-xs font-normal text-[#565D70]">{t.note}</span></span></button>})}</div>)}</section>; }
