"use client";

import { useEffect, useMemo, useState } from "react";

type Subject = "phy" | "chem" | "math";
type Status = "done" | "progress" | "todo";
type RoutineItem = { time: string; title: string; desc: string; subject: Subject | "life" };
type Row = RoutineItem & { day: string };

type Log = {
  q: Record<Subject, number>;
  touched: Record<Subject, boolean>;
  hrs: number;
  notes: string;
  savedAt?: string;
};

const WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const EXAM_DATE = "2026-09-12T00:00:00+05:30";
const DOUBT_DEADLINE = "2026-09-05T00:00:00+05:30";

const SUBJECT_META: Record<Subject, { label: string; color: string; book: string }> = {
  phy: { label: "Physics", color: "#3DDCFF", book: "H.C. Verma Level 1" },
  chem: { label: "Chemistry", color: "#A78BFA", book: "N. Avasthi Level 1" },
  math: { label: "Maths", color: "#FFB454", book: "Target Level 1" },
};

const SYLLABUS: Record<Subject, { topics: { name: string; status: Status; note: string }[] }> = {
  phy: { topics: [
    { name: "Scalar & Vector", status: "done", note: "Completed — now revision + JEE application" },
    { name: "Kinematics", status: "done", note: "Completed — mixed application practice" },
    { name: "Laws of Motion", status: "progress", note: "Covered; strengthen friction, pulleys and connected-body application" },
    { name: "Work, Energy & Power", status: "progress", note: "New priority — build from fundamentals to Level 1" },
  ] },
  chem: { topics: [
    { name: "Mole Concept", status: "done", note: "Completed — maintenance + mixed numericals" },
    { name: "Atomic Structure", status: "progress", note: "New priority — tuition + self-study + Level 1" },
  ] },
  math: { topics: [
    { name: "Trigonometry", status: "done", note: "Completed — revision + problem recognition" },
    { name: "Sets", status: "done", note: "Completed — revision + application" },
    { name: "Relations & Functions", status: "done", note: "Completed — revision + application" },
    { name: "Straight Line", status: "progress", note: "New — Target Level 1" },
    { name: "Circle", status: "progress", note: "New — Target Level 1" },
  ] },
};

const DAILY_PLAN: { date: string; items?: { t: string; q: number; sub: Subject | "rev"; note?: string }[]; revision?: boolean; note?: string }[] = [
  { date: "2026-08-21", items: [{ t: "Kinematics", q: 10, sub: "phy", note: "revision" }, { t: "Mole Concept + % Composition", q: 10, sub: "chem", note: "revision" }, { t: "WEP", q: 8, sub: "phy", note: "new topic — self-study" }, { t: "Trigonometry", q: 12, sub: "math", note: "revision" }] },
  { date: "2026-08-22", items: [{ t: "Kinematics", q: 10, sub: "phy", note: "revision" }, { t: "Mole Concept + % Composition", q: 10, sub: "chem", note: "revision" }, { t: "WEP", q: 7, sub: "phy", note: "new topic — self-study" }, { t: "Trigonometry", q: 13, sub: "math", note: "revision" }] },
  { date: "2026-08-23", items: [{ t: "Kinematics", q: 10, sub: "phy", note: "revision" }, { t: "Atomic Structure", q: 10, sub: "chem", note: "new topic" }, { t: "Sets + Relation & Function", q: 13, sub: "math", note: "revision" }, { t: "Trigonometry", q: 12, sub: "math", note: "revision" }] },
  { date: "2026-08-24", items: [{ t: "NLM", q: 12, sub: "phy", note: "revision" }, { t: "Atomic Structure", q: 10, sub: "chem", note: "new topic" }, { t: "Sets + Relation & Function", q: 13, sub: "math", note: "revision" }, { t: "Straight Line", q: 5, sub: "math", note: "new — Target Level 1" }] },
  { date: "2026-08-25", items: [{ t: "NLM", q: 12, sub: "phy", note: "revision" }, { t: "Atomic Structure", q: 10, sub: "chem", note: "new topic" }, { t: "Sets + Relation & Function", q: 12, sub: "math", note: "revision" }, { t: "Straight Line", q: 5, sub: "math", note: "new — Target Level 1" }] },
  { date: "2026-08-26", items: [{ t: "NLM", q: 6, sub: "phy", note: "revision — finishing up" }, { t: "Friction", q: 8, sub: "phy", note: "revision / application" }, { t: "Atomic Structure", q: 10, sub: "chem", note: "new topic" }, { t: "Sets + Relation & Function", q: 12, sub: "math", note: "revision" }, { t: "Circle", q: 5, sub: "math", note: "new — Target Level 1" }] },
  { date: "2026-08-27", items: [{ t: "Friction", q: 7, sub: "phy", note: "revision — finishing up" }, { t: "Atomic Structure", q: 10, sub: "chem", note: "new topic" }, { t: "Circle", q: 5, sub: "math", note: "new — Target Level 1" }, { t: "Mixed revision (all subjects)", q: 18, sub: "rev", note: "concept-recognition practice" }] },
  { date: "2026-08-28", items: [{ t: "Mole Concept + % Composition", q: 10, sub: "chem", note: "revision — finishing up" }, { t: "Trigonometry", q: 13, sub: "math", note: "revision" }, { t: "Mixed revision (all subjects)", q: 20, sub: "rev", note: "unfamiliar questions" }] },
  { date: "2026-08-29", items: [{ t: "Mole Concept + % Composition", q: 10, sub: "chem", note: "revision" }, { t: "Mixed revision (all subjects)", q: 35, sub: "rev", note: "application" }] },
  { date: "2026-08-30", items: [{ t: "Mixed revision — Chemistry priority", q: 20, sub: "rev" }, { t: "Mixed revision — Physics", q: 15, sub: "rev" }, { t: "Mixed revision — Maths", q: 10, sub: "rev" }] },
  { date: "2026-08-31", items: [{ t: "Mixed revision — Chemistry priority", q: 20, sub: "rev" }, { t: "Mixed revision — Physics", q: 15, sub: "rev" }, { t: "Mixed revision — Maths", q: 10, sub: "rev" }] },
  { date: "2026-09-01", items: [{ t: "Mixed revision — Chemistry priority", q: 18, sub: "rev" }, { t: "Mixed revision — Physics", q: 14, sub: "rev" }, { t: "Mixed revision — Maths", q: 12, sub: "rev" }] },
  { date: "2026-09-02", items: [{ t: "Mixed revision — Chemistry priority", q: 18, sub: "rev" }, { t: "Mixed revision — Physics", q: 14, sub: "rev" }, { t: "Mixed revision — Maths", q: 12, sub: "rev" }] },
  { date: "2026-09-03", items: [{ t: "Full-syllabus mock practice", q: 50, sub: "rev", note: "timed mixed Level 1" }] },
  { date: "2026-09-04", revision: true, note: "Light revision only — redo flagged/wrong questions, clear final doubts." },
  { date: "2026-09-05", revision: true, note: "Doubt-clearing deadline — no new heavy topics." },
  { date: "2026-09-06", items: [{ t: "GT-02 mock / selected mixed set", q: 45, sub: "rev", note: "timed + analyse immediately" }] },
  { date: "2026-09-07", items: [{ t: "Chemistry weak areas", q: 20, sub: "chem" }, { t: "Physics weak areas", q: 15, sub: "phy" }, { t: "Maths weak areas", q: 15, sub: "math" }] },
  { date: "2026-09-08", items: [{ t: "Chemistry application", q: 20, sub: "chem" }, { t: "NLM/WEP application", q: 15, sub: "phy" }, { t: "Straight Line/Circle", q: 15, sub: "math" }] },
  { date: "2026-09-09", items: [{ t: "Mixed JEE Main-level set", q: 50, sub: "rev", note: "focus on unfamiliar questions" }] },
  { date: "2026-09-10", items: [{ t: "GT-02 style mini mock", q: 45, sub: "rev", note: "135-minute discipline practice" }] },
  { date: "2026-09-11", revision: true, note: "Light revision, formulas, marked doubts, confidence and sleep. No new grinding." },
];

const ROUTINE: RoutineItem[] = [
  { time: "11:00–11:45", title: "Wake up + breakfast + get ready", desc: "Start without rushing into study.", subject: "life" },
  { time: "11:45–13:45", title: "Self-study block 1", desc: "Chemistry priority — Atomic Structure / Mole maintenance / N. Avasthi Level 1.", subject: "chem" },
  { time: "13:45–14:15", title: "Lunch break", desc: "Eat and reset.", subject: "life" },
  { time: "14:15–16:00", title: "Self-study block 2", desc: "Physics — WEP / NLM / Kinematics / H.C. Verma Level 1.", subject: "phy" },
  { time: "16:00–16:30", title: "Travel / coaching buffer", desc: "Pack, travel, transition.", subject: "life" },
  { time: "16:30–21:15", title: "Coaching", desc: "Class + travel buffer. Mark doubts and teacher-selected problems.", subject: "life" },
  { time: "21:15–21:45", title: "Dinner + break", desc: "Reset before the night session.", subject: "life" },
  { time: "21:45–23:15", title: "Self-study block 3", desc: "Maths — Straight Line / Circle / revision + Target Level 1.", subject: "math" },
  { time: "23:15–23:30", title: "Short break", desc: "No doom-scrolling.", subject: "life" },
  { time: "23:30–01:00", title: "Self-study block 4", desc: "Coaching homework + same-day revision.", subject: "life" },
  { time: "01:00–01:30", title: "Daily log", desc: "Questions, hours, doubts, GT mistakes and notes.", subject: "life" },
  { time: "01:30–03:00", title: "Buffer / catch-up / question finishing", desc: "Finish the daily target if needed; otherwise light revision.", subject: "life" },
  { time: "03:00–03:30", title: "Wind down", desc: "Screens down, plan tomorrow.", subject: "life" },
  { time: "03:30", title: "Sleep", desc: "Protect the sleep window.", subject: "life" },
];

function isoToday() { return new Date().toISOString().slice(0, 10); }
function fmtDate(iso: string) { return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function fmtWeekday(iso: string) { return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" }); }
function daysLeft(target: string) { return Math.max(0, Math.ceil((new Date(target).getTime() - Date.now()) / 86400000)); }
function shiftIso(iso: string, amount: number) { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + amount); return d.toISOString().slice(0, 10); }
function defaultRows(): Row[] { return WEEK.flatMap((day) => ROUTINE.map((r) => ({ ...r, day }))); }

export default function PersonalTimetablePage() {
  const [activeView, setActiveView] = useState<"today" | "schedule" | "progress" | "syllabus">("today");
  const [currentDate, setCurrentDate] = useState(isoToday());
  const [rows, setRows] = useState<Row[]>(defaultRows());
  const [logs, setLogs] = useState<Record<string, Log>>({});
  const [syllabus, setSyllabus] = useState<Record<string, Status>>({});
  const [viewer, setViewer] = useState(false);
  const [studentName, setStudentName] = useState("JEE 2028 student");
  const [shareUrl, setShareUrl] = useState("");
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "saved" | "error">("idle");

  useEffect(() => {
    const share = new URLSearchParams(window.location.search).get("share");
    if (share) {
      setViewer(true);
      fetch(`/api/personal-timetable?share=${encodeURIComponent(share)}`)
        .then((r) => r.ok ? r.json() : Promise.reject(new Error("Share link unavailable")))
        .then((data) => {
          if (Array.isArray(data.payload?.rows) && data.payload.rows.length) setRows(data.payload.rows as Row[]);
          if (data.payload?.logs) setLogs(data.payload.logs as Record<string, Log>);
          if (data.payload?.syllabus) setSyllabus(data.payload.syllabus as Record<string, Status>);
          setStudentName(data.studentName ?? "JEE 2028 student");
        })
        .catch(() => setSyncState("error"));
      return;
    }
    try {
      const local = localStorage.getItem("jee2028-grind-tracker");
      if (local) {
        const parsed = JSON.parse(local) as { rows?: Row[]; logs?: Record<string, Log>; syllabus?: Record<string, Status> };
        if (parsed.rows?.length) setRows(parsed.rows);
        if (parsed.logs) setLogs(parsed.logs);
        if (parsed.syllabus) setSyllabus(parsed.syllabus);
      }
    } catch { /* remote data is still attempted */ }
    fetch("/api/personal-timetable")
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("Not signed in")))
      .then((data) => {
        const p = data.payload;
        if (Array.isArray(p?.rows) && p.rows.length) setRows(p.rows as Row[]);
        if (p?.logs) setLogs(p.logs as Record<string, Log>);
        if (p?.syllabus) setSyllabus(p.syllabus as Record<string, Status>);
        if (data.shareToken) setShareUrl(`${window.location.origin}/personal-timetable?share=${data.shareToken}`);
      })
      .catch(() => undefined);
  }, []);

  const todayLog = logs[currentDate] ?? { q: { phy: 0, chem: 0, math: 0 }, touched: { phy: false, chem: false, math: false }, hrs: 0, notes: "" };
  const todayPlan = DAILY_PLAN.find((p) => p.date === currentDate);
  const plannedQ = todayPlan?.items?.reduce((sum, item) => sum + item.q, 0) ?? 0;
  const todayQ = Object.values(todayLog.q).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const touched = (Object.values(todayLog.touched) as boolean[]).filter(Boolean).length;
  const progressDays = useMemo(() => { const out: { iso: string; data: Log | null }[] = []; for (let i = 27; i >= 0; i -= 1) { const d = new Date(); d.setDate(d.getDate() - i); const iso = d.toISOString().slice(0, 10); out.push({ iso, data: logs[iso] ?? null }); } return out; }, [logs]);
  const last21 = progressDays.slice(-21);
  const loggedDays = progressDays.filter((d) => d.data);
  const totalQ = loggedDays.reduce((sum, d) => sum + (d.data?.q.phy ?? 0) + (d.data?.q.chem ?? 0) + (d.data?.q.math ?? 0), 0);
  const totalHrs = loggedDays.reduce((sum, d) => sum + (d.data?.hrs ?? 0), 0);
  const avgQ = loggedDays.length ? Math.round(totalQ / loggedDays.length) : 0;
  let streak = 0;
  for (let i = progressDays.length - 1; i >= 0; i -= 1) { const q = progressDays[i].data ? (progressDays[i].data?.q.phy ?? 0) + (progressDays[i].data?.q.chem ?? 0) + (progressDays[i].data?.q.math ?? 0) : 0; if (q >= 40) streak += 1; else break; }
  const daysToDoubt = daysLeft(DOUBT_DEADLINE);
  const daysToGT = daysLeft(EXAM_DATE);

  async function saveAll(nextLogs = logs, nextRows = rows, nextSyllabus = syllabus) {
    localStorage.setItem("jee2028-grind-tracker", JSON.stringify({ logs: nextLogs, rows: nextRows, syllabus: nextSyllabus }));
    if (viewer) return;
    setSyncState("syncing");
    try {
      const response = await fetch("/api/personal-timetable", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows: nextRows, logs: nextLogs, syllabus: nextSyllabus }) });
      if (!response.ok) throw new Error("Save failed");
      const data = await response.json();
      if (data.shareToken) setShareUrl(`${window.location.origin}/personal-timetable?share=${data.shareToken}`);
      setSyncState("saved");
    } catch { setSyncState("error"); }
  }

  async function ensureShareLink() {
    if (viewer) return;
    setSyncState("syncing");
    try { await saveAll(); const response = await fetch("/api/personal-timetable", { method: "POST" }); if (!response.ok) throw new Error("Could not create share link"); const data = await response.json(); const link = `${window.location.origin}/personal-timetable?share=${data.shareToken}`; setShareUrl(link); await navigator.clipboard?.writeText(link); setSyncState("saved"); } catch { setSyncState("error"); }
  }

  function updateTodayLog(patch: Partial<Log>) { const next = { ...todayLog, ...patch }; setLogs({ ...logs, [currentDate]: next }); setSyncState("idle"); }
  function updateSyllabus(key: string) { if (viewer) return; const current = syllabus[key] ?? findTopicStatus(key); const next: Status = current === "todo" ? "progress" : current === "progress" ? "done" : "todo"; const nextSyllabus = { ...syllabus, [key]: next }; setSyllabus(nextSyllabus); void saveAll(logs, rows, nextSyllabus); }

  return <main className="min-h-screen bg-[#0B0D12] text-[#E7E9EE]"><div className="mx-auto max-w-[980px] px-4 pb-20 pt-6 sm:px-6">
    <header className="mb-5 flex flex-wrap items-center justify-between gap-4"><div className="flex items-baseline gap-3"><span className="font-bold text-[20px]">Arnav's JEE Grind</span><span className="font-mono text-[11px] text-[#565D70]">GT-02 · 12 Sep</span></div><div className="flex items-center gap-3 rounded-[14px] border border-[#232838] bg-[#12151C] px-3 py-2"><div className="text-right"><div className="font-bold text-[#3DDCFF]">{daysToDoubt}d</div><div className="text-[9px] uppercase tracking-wider text-[#565D70]">to Sep 5 doubts</div></div><div className="h-8 w-px bg-[#232838]"/><div className="text-right"><div className="font-bold text-[#FFB454]">{daysToGT}d</div><div className="text-[9px] uppercase tracking-wider text-[#565D70]">to GT-02</div></div></div></header>
    <nav className="mb-5 flex gap-1 overflow-x-auto rounded-[12px] border border-[#232838] bg-[#12151C] p-1">{([['today','Today'],['schedule','Schedule'],['progress','Progress'],['syllabus','Syllabus']] as const).map(([key,label])=><button key={key} onClick={()=>setActiveView(key)} className={`whitespace-nowrap rounded-[8px] px-4 py-2.5 text-[13px] font-semibold ${activeView===key?'bg-[#171B24] text-[#E7E9EE] shadow-[inset_0_0_0_1px_#232838]':'text-[#8B92A5] hover:text-[#E7E9EE]'}`}>{label}</button>)}</nav>
    {activeView === "today" && <TodayView currentDate={currentDate} setCurrentDate={setCurrentDate} log={todayLog} updateLog={updateTodayLog} plannedQ={plannedQ} todayQ={todayQ} touched={touched} plan={todayPlan} viewer={viewer} studentName={studentName} shareUrl={shareUrl} onShare={ensureShareLink} onSave={()=>void saveAll()} syncState={syncState}/>} 
    {activeView === "schedule" && <ScheduleView/>}
    {activeView === "progress" && <ProgressView totalQ={totalQ} avgQ={avgQ} streak={streak} totalHrs={totalHrs} last21={last21} progressDays={progressDays}/>} 
    {activeView === "syllabus" && <SyllabusView syllabus={syllabus} onToggle={updateSyllabus} viewer={viewer}/>} 
    <footer className="mt-8 text-center font-mono text-[10px] text-[#565D70]">{viewer ? "Read-only shared progress · no editing" : "Private owner dashboard · shareable read-only parent/teacher view"}</footer>
  </div></main>;
}

function TodayView({ currentDate,setCurrentDate,log,updateLog,plannedQ,todayQ,touched,plan,viewer,studentName,shareUrl,onShare,onSave,syncState}:{currentDate:string;setCurrentDate:(v:string)=>void;log:Log;updateLog:(p:Partial<Log>)=>void;plannedQ:number;todayQ:number;touched:number;plan:(typeof DAILY_PLAN)[number]|undefined;viewer:boolean;studentName:string;shareUrl:string;onShare:()=>void;onSave:()=>void;syncState:string}){
  const totalHit=todayQ>=40; const hrsHit=log.hrs>=6;
  return <div className="space-y-4">
    <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><div className="text-[26px] font-bold">{fmtDate(currentDate)}</div><div className="text-[13px] text-[#8B92A5]">{fmtWeekday(currentDate)} · {viewer?`Viewing ${studentName}`:"Your personal dashboard"}</div></div><div className="flex gap-2"><button disabled={viewer} onClick={()=>setCurrentDate(shiftIso(currentDate,-1))} className="h-9 w-9 rounded-[9px] border border-[#232838] bg-[#171B24] text-[#8B92A5] disabled:opacity-40">‹</button><button disabled={viewer} onClick={()=>setCurrentDate(isoToday())} className="h-9 w-9 rounded-[9px] border border-[#232838] bg-[#171B24] text-[#8B92A5] disabled:opacity-40">•</button><button disabled={viewer} onClick={()=>setCurrentDate(shiftIso(currentDate,1))} className="h-9 w-9 rounded-[9px] border border-[#232838] bg-[#171B24] text-[#8B92A5] disabled:opacity-40">›</button></div></div>
      <div className="mb-4 grid grid-cols-3 gap-2"><Metric value={todayQ} label="Questions solved" good={totalHit}/><Metric value={log.hrs.toFixed(1)} label="Self-study hrs" good={hrsHit}/><Metric value={`${touched}/3`} label="Subjects touched" good={touched===3}/></div>
      <div className="mb-3 text-[10px] uppercase tracking-wider text-[#565D70]">Subject log — questions solved & touched today</div><div className="grid gap-3 md:grid-cols-3">{(['phy','chem','math'] as Subject[]).map(s=><div key={s} className="rounded-xl border border-[#232838] bg-[#171B24] p-3" style={{boxShadow:log.touched[s]?`inset 0 0 0 1.5px ${SUBJECT_META[s].color}`:undefined}}><div className="mb-2 font-bold" style={{color:SUBJECT_META[s].color}}>{SUBJECT_META[s].label}</div><div className="text-[10px] uppercase tracking-wider text-[#565D70]">Questions</div><input disabled={viewer} type="number" min={0} value={log.q[s]||""} onChange={e=>updateLog({q:{...log.q,[s]:Number(e.target.value)||0}})} className="mt-1 w-full rounded-lg border border-[#232838] bg-[#0B0D12] px-2.5 py-2 font-mono text-sm outline-none"/><label className="mt-2 flex items-center gap-2 text-[11px] text-[#8B92A5]"><input disabled={viewer} type="checkbox" checked={!!log.touched[s]} onChange={e=>updateLog({touched:{...log.touched,[s]:e.target.checked}})}/>Touched today</label></div>)}</div>
      <div className="mt-4 grid gap-3 md:grid-cols-[160px_1fr]"><div><label className="text-[10px] uppercase tracking-wider text-[#565D70]">Self-study hours</label><input disabled={viewer} type="number" min={0} max={14} step={0.25} value={log.hrs||""} onChange={e=>updateLog({hrs:Number(e.target.value)||0})} className="mt-1 w-full rounded-lg border border-[#232838] bg-[#171B24] px-2.5 py-2 font-mono text-sm outline-none"/></div><div><label className="text-[10px] uppercase tracking-wider text-[#565D70]">Notes / stuck points</label><textarea disabled={viewer} value={log.notes} onChange={e=>updateLog({notes:e.target.value})} placeholder="What did you cover? What blocked you? Which doubt goes to teacher?" className="mt-1 min-h-[76px] w-full rounded-lg border border-[#232838] bg-[#171B24] px-3 py-2 text-sm outline-none"/></div></div>
      {!viewer && <div className="mt-3 flex flex-wrap items-center gap-2"><button onClick={onSave} className="rounded-lg bg-[#3DDCFF] px-5 py-2.5 font-semibold text-[#031014]">{syncState==='syncing'?'Saving…':syncState==='saved'?'Saved ✓':'Save today'}</button><button onClick={onShare} className="rounded-lg border border-[#232838] bg-[#171B24] px-4 py-2.5 text-sm text-[#8B92A5]">Share read-only</button>{shareUrl&&<span className="max-w-full break-all text-[10px] text-[#565D70]">{shareUrl}</span>}</div>}
    </section>
    <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-3 flex items-center justify-between text-[15px] font-semibold">Today's syllabus target <span className="text-[11px] font-normal text-[#565D70]">{plannedQ?`${plannedQ} planned questions`:'No fixed plan'}</span></h2>{plan?.revision?<div className="rounded-xl border border-[#4ADE80]/20 bg-[#4ADE80]/5 p-3 text-sm text-[#4ADE80]">🔁 {plan.note}</div>:plan?.items?<div className="space-y-2">{plan.items.map(item=><div key={`${item.t}-${item.sub}`} className="flex items-center gap-3 border-b border-[#232838] py-2 last:border-b-0"><div className="w-20 text-[11px] font-bold" style={{color:item.sub==='rev'?'#4ADE80':SUBJECT_META[item.sub].color}}>{item.sub==='rev'?'REV':SUBJECT_META[item.sub].label.slice(0,4).toUpperCase()}</div><div className="flex-1 text-[13px]">{item.t}<div className="text-[10px] text-[#565D70]">{item.note}</div></div><div className="rounded-lg bg-[#171B24] px-2.5 py-1 font-mono text-sm">{item.q}</div></div>)}</div>:<div className="text-[12px] text-[#565D70]">Use coaching homework + mixed revision.</div>}</section>
    <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-3 flex items-center justify-between text-[15px] font-semibold">Today's routine <span className="text-[11px] font-normal text-[#565D70]">11:00 AM wake → 3:30 AM sleep</span></h2><div className="space-y-0">{ROUTINE.map(item=><div key={item.time} className="flex gap-3 border-b border-[#232838] py-3 last:border-b-0"><div className="w-[80px] shrink-0 font-mono text-[11px] text-[#565D70]">{item.time}</div><div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{background:item.subject==='life'?'#565D70':SUBJECT_META[item.subject].color}}/><div><div className="text-[13px] font-semibold">{item.title}</div><div className="text-[12px] text-[#8B92A5]">{item.desc}</div></div></div>)}</div></section>
  </div>;
}

function ScheduleView(){return <div className="space-y-4"><section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-1 text-[15px] font-semibold">Syllabus plan — now to GT-02</h2><p className="mb-4 text-[12px] text-[#565D70]">Near-done chapters stay in revision while new topics move forward in parallel.</p>{DAILY_PLAN.map(p=>{const today=isoToday();const past=p.date<today;const current=p.date===today;const total=p.items?.reduce((s,i)=>s+i.q,0)??0;return <div key={p.date} className={`border-b border-[#232838] py-3 last:border-b-0 ${past?'opacity-40':''} ${current?'rounded-lg bg-[#3DDCFF]/5 px-3':''}`}><div className="mb-1 flex items-center gap-2 text-[12px] font-bold">{fmtDate(p.date)} {current&&<span className="rounded-full bg-[#3DDCFF] px-2 py-0.5 text-[9px] text-[#031014]">TODAY</span>}</div>{p.revision?<div className="text-[12px] text-[#4ADE80]">🔁 {p.note}</div>:<div className="text-[12.5px] leading-6">{p.items?.map((i,idx)=><span key={idx}><span style={{color:i.sub==='rev'?'#4ADE80':SUBJECT_META[i.sub].color}}>{i.sub==='rev'?'REV':SUBJECT_META[i.sub].label}</span>: {i.t} ({i.q}){idx<(p.items?.length??1)-1?' · ':''}</span>)} <strong> · = {total} Qs</strong></div>}</div>})}</section><section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-3 text-[15px] font-semibold">Daily template</h2>{ROUTINE.map(item=><div key={item.time} className="flex gap-3 border-b border-[#232838] py-2.5 last:border-b-0"><div className="w-[90px] shrink-0 font-mono text-[11px] text-[#3DDCFF]">{item.time}</div><div className="text-[13px]">{item.title}<div className="text-[11px] text-[#8B92A5]">{item.desc}</div></div></div>)}</section><section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-3 text-[15px] font-semibold">Non-negotiables</h2>{['40–60 questions is the working daily range; 50 is the aim.','6–7 hours self-study separate from coaching.','Touch Physics, Chemistry and Maths every day.','Clear Level 1 teacher-selected external-book questions before moving up.','Chemistry gets slightly more weight.','Analyse wrong + unattempted GT questions and reattempt them.'].map(x=><div key={x} className="flex gap-2 border-b border-[#232838] py-2.5 text-[12.5px] last:border-b-0"><span className="text-[#3DDCFF]">•</span><span>{x}</span></div>)}</section></div>}

function ProgressView({totalQ,avgQ,streak,totalHrs,last21,progressDays}:{totalQ:number;avgQ:number;streak:number;totalHrs:number;last21:{iso:string;data:Log|null}[];progressDays:{iso:string;data:Log|null}[]}){const maxQ=Math.max(60,...last21.map(d=>d.data?(d.data.q.phy+d.data.q.chem+d.data.q.math):0));return <div className="space-y-4"><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><StatBox value={totalQ} label="Total Qs solved"/><StatBox value={avgQ} label="Avg Qs / day"/><StatBox value={streak} label="Day streak (40+ Qs)"/><StatBox value={totalHrs.toFixed(1)} label="Total self-study hrs"/></div><section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-1 text-[15px] font-semibold">Questions solved — last 21 days</h2><p className="mb-5 text-[11px] text-[#565D70]">Visual target band is 40–60 questions; logged days become opaque.</p><div className="flex h-52 items-end gap-1 overflow-x-auto">{last21.map(d=><div key={d.iso} className="flex h-full min-w-[22px] flex-col items-center justify-end gap-1"><div className="text-[8px] text-[#565D70]">{d.data?d.data.q.phy+d.data.q.chem+d.data.q.math:''}</div><div className="w-full rounded-t-sm bg-[#3DDCFF]" style={{height:`${Math.max(2,((d.data?d.data.q.phy+d.data.q.chem+d.data.q.math:0)/maxQ)*100)}%`,opacity:d.data?1:0.12}}/><div className="text-[8px] text-[#565D70]">{new Date(`${d.iso}T12:00:00`).getDate()}</div></div>)}</div></section><section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-3 text-[15px] font-semibold">Subject touch heatmap — last 28 days</h2><div className="space-y-3">{(['phy','chem','math'] as Subject[]).map(s=><div key={s} className="flex items-center gap-3"><div className="w-14 text-[11px] font-bold" style={{color:SUBJECT_META[s].color}}>{SUBJECT_META[s].label}</div><div className="flex flex-wrap gap-1">{progressDays.map(d=><div key={d.iso} className="h-3.5 w-3.5 rounded-[3px] border border-[#232838]" style={{background:d.data?.touched?.[s]?SUBJECT_META[s].color:'#171B24'}} title={d.iso}/>)}</div></div>)}</div></section><section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="mb-3 text-[15px] font-semibold">Recent notes log</h2>{progressDays.filter(d=>d.data?.notes?.trim()).slice().reverse().slice(0,10).map(d=><div key={d.iso} className="mb-3"><div className="font-mono text-[10px] text-[#565D70]">{d.iso}</div><div className="mt-1 rounded-lg border border-[#232838] bg-[#171B24] px-3 py-2 text-[12px] text-[#8B92A5]">{d.data?.notes}</div></div>)}{progressDays.every(d=>!d.data?.notes?.trim())&&<div className="text-[12px] text-[#565D70]">No notes logged yet.</div>}</section></div>}

function SyllabusView({syllabus,onToggle,viewer}:{syllabus:Record<string,Status>;onToggle:(key:string)=>void;viewer:boolean}){const all=Object.values(SYLLABUS).flatMap(s=>s.topics);const done=all.filter(t=>(syllabus[t.name]??t.status)==='done').length;const pct=Math.round(done/all.length*100);return <div className="space-y-4"><section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><div className="flex items-end justify-between"><div><h2 className="text-[15px] font-semibold">Overall syllabus completion</h2><p className="text-[11px] text-[#565D70]">Completed chapters stay in practice while new ones move forward.</p></div><div className="font-mono text-lg font-bold text-[#3DDCFF]">{pct}%</div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#171B24]"><div className="h-full rounded-full bg-[#3DDCFF]" style={{width:`${pct}%`}}/></div></section>{(Object.keys(SYLLABUS) as Subject[]).map(s=><section key={s} className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h3 className="mb-3 text-[15px] font-semibold" style={{color:SUBJECT_META[s].color}}>{SUBJECT_META[s].label}<span className="ml-2 font-normal text-[#565D70]">• {SUBJECT_META[s].book}</span></h3>{SYLLABUS[s].topics.map(t=><div key={t.name} className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-[#232838] bg-[#171B24] px-3 py-3"><div><div className="text-[13px] font-medium">{t.name}</div><div className="mt-1 text-[10px] text-[#565D70]">{t.note}</div></div><button disabled={viewer} onClick={()=>onToggle(t.name)} className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase ${statusClass(syllabus[t.name]??t.status)} disabled:opacity-70`}>{syllabus[t.name]??t.status}</button></div>)}</section>)}</div>}

function findTopicStatus(name:string):Status{for(const subject of Object.values(SYLLABUS)){const t=subject.topics.find(x=>x.name===name);if(t)return t.status;}return 'todo';}
function Metric({value,label,good}:{value:string|number;label:string;good:boolean}){return <div className={`rounded-xl border border-[#232838] bg-[#171B24] p-3 text-center ${good?'text-[#4ADE80]':''}`}><div className="font-mono text-2xl font-bold">{value}</div><div className="text-[10px] uppercase tracking-wider text-[#565D70]">{label}</div></div>}
function StatBox({value,label}:{value:string|number;label:string}){return <div className="rounded-[14px] border border-[#232838] bg-[#12151C] p-4 text-center"><div className="font-mono text-2xl font-bold">{value}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-[#565D70]">{label}</div></div>}
function statusClass(status:Status){if(status==='done')return 'bg-[#4ADE80]/15 text-[#4ADE80]';if(status==='progress')return 'bg-[#FFB454]/15 text-[#FFB454]';return 'bg-[#8B92A5]/10 text-[#565D70]';}
