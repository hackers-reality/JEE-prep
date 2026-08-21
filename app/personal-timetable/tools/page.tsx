"use client";

import { useEffect, useState, type ReactNode } from "react";

type Subject = "phy" | "chem" | "math";
type TabKey = "gt" | "doubts" | "books" | "review";
type GtEntry = { id: string; date: string; gt: string; question: string; subject: Subject; topic: string; outcome: "Wrong" | "Unattempted" | "Guessed" | "Slow"; reason: string; approach: string; reattempted: boolean; similarSolved: boolean; teacherDoubt: boolean };
type Doubt = { id: string; date: string; subject: Subject; topic: string; question: string; status: "Pending" | "Asked" | "Cleared"; teacher: string; note: string };
type BookProgress = { attempted: number; solved: number; marked: number; note: string };
type WeeklyReview = { id: string; week: string; hours: number; questions: number; adherence: number; best: string; weak: string; next: string };
type Payload = { gtDiary: GtEntry[]; doubts: Doubt[]; bookProgress: Record<string, BookProgress>; weeklyReviews: WeeklyReview[] };

const SUBJECTS: Record<Subject, { label: string; color: string }> = { phy: { label: "Physics", color: "#3DDCFF" }, chem: { label: "Chemistry", color: "#A78BFA" }, math: { label: "Maths", color: "#FFB454" } };
const TABS: ReadonlyArray<readonly [TabKey, string]> = [["gt", "GT diary"], ["doubts", "Doubt queue"], ["books", "Books"], ["review", "Weekly review"]];
const BOOKS = ["H.C. Verma Level 1", "Target Level 1", "N. Avasthi Level 1"];
const emptyPayload = (): Payload => ({ gtDiary: [], doubts: [], bookProgress: {}, weeklyReviews: [] });
const uid = () => Math.random().toString(36).slice(2, 10);

export default function ToolsPage() {
  const [payload, setPayload] = useState<Payload>(emptyPayload());
  const [active, setActive] = useState<TabKey>("gt");
  const [viewer, setViewer] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const share = new URLSearchParams(window.location.search).get("share");
    setViewer(Boolean(share));
    fetch(share ? `/api/personal-timetable?share=${encodeURIComponent(share)}` : "/api/personal-timetable")
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("Could not load tracker")))
      .then((data) => setPayload((p) => ({ ...p, ...(data.payload ?? {}) })))
      .catch((e) => setStatus(e instanceof Error ? e.message : "Could not load tracker"));
  }, []);

  async function save(next: Payload) {
    if (viewer) return;
    setPayload(next); setStatus("Saving…");
    try {
      const r = await fetch("/api/personal-timetable", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      if (!r.ok) throw new Error("Save failed");
      setStatus("Saved ✓");
    } catch (e) { setStatus(e instanceof Error ? e.message : "Save failed"); }
  }

  return <main className="min-h-screen bg-[#0B0D12] px-4 pb-16 pt-6 text-[#E7E9EE] sm:px-6"><div className="mx-auto max-w-[1100px]">
    <div className="mb-5 flex items-center justify-between gap-3"><div><div className="text-[11px] uppercase tracking-[0.2em] text-[#3DDCFF]">JEE 2028 repair hub</div><h1 className="text-3xl font-bold">GT repair · doubts · books · review</h1><p className="mt-1 text-sm text-[#8B92A5]">{viewer ? "Read-only parent/teacher view" : "Use this page to turn mistakes into fixes."}</p></div><a href="/personal-timetable" className="rounded-lg border border-[#232838] bg-[#12151C] px-3 py-2 text-sm text-[#8B92A5]">Back</a></div>
    <nav className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{TABS.map(([key, label]) => <button key={key} onClick={() => setActive(key)} className={`rounded-xl border px-3 py-3 text-sm font-semibold ${active === key ? "border-[#3DDCFF]/50 bg-[#12151C] text-[#E7E9EE]" : "border-[#232838] bg-[#0F1218] text-[#8B92A5]"}`}>{label}</button>)}</nav>
    {active === "gt" && <GtDiary data={payload.gtDiary} viewer={viewer} onSave={(gtDiary) => save({ ...payload, gtDiary })} />}
    {active === "doubts" && <Doubts data={payload.doubts} viewer={viewer} onSave={(doubts) => save({ ...payload, doubts })} />}
    {active === "books" && <Books data={payload.bookProgress} viewer={viewer} onSave={(bookProgress) => save({ ...payload, bookProgress })} />}
    {active === "review" && <Review data={payload.weeklyReviews} viewer={viewer} onSave={(weeklyReviews) => save({ ...payload, weeklyReviews })} />}
    {status && <div className="mt-4 text-center text-xs text-[#565D70]">{status}</div>}
  </div></main>;
}

function GtDiary({ data, viewer, onSave }: { data: GtEntry[]; viewer: boolean; onSave: (x: GtEntry[]) => void }) {
  const [d, setD] = useState<Partial<GtEntry>>({ outcome: "Wrong", subject: "phy", reattempted: false, similarSolved: false, teacherDoubt: false });
  function add() { if (!d.question || !d.topic) return; onSave([{ id: uid(), date: d.date || new Date().toISOString().slice(0, 10), gt: d.gt || "GT-02", question: d.question, subject: d.subject as Subject, topic: d.topic, outcome: d.outcome as GtEntry["outcome"], reason: d.reason || "", approach: d.approach || "", reattempted: Boolean(d.reattempted), similarSolved: Boolean(d.similarSolved), teacherDoubt: Boolean(d.teacherDoubt) }, ...data]); setD({ outcome: "Wrong", subject: "phy" }); }
  return <section className="space-y-4"><Card title="GT mistake diary" subtitle="Wrong, unattempted, guessed and slow questions each need a repair action."><div className="grid gap-2 md:grid-cols-4"><Field label="Date" value={d.date || ""} onChange={(v) => setD({ ...d, date: v })} type="date"/><Field label="GT" value={d.gt || "GT-02"} onChange={(v) => setD({ ...d, gt: v })}/><Field label="Question" value={d.question || ""} onChange={(v) => setD({ ...d, question: v })}/><Field label="Topic" value={d.topic || ""} onChange={(v) => setD({ ...d, topic: v })}/></div><div className="mt-2 grid gap-2 md:grid-cols-3"><Select label="Subject" value={d.subject || "phy"} options={Object.entries(SUBJECTS).map(([k, v]) => [k, v.label])} onChange={(v) => setD({ ...d, subject: v as Subject })}/><Select label="Outcome" value={d.outcome || "Wrong"} options={[["Wrong", "Wrong"], ["Unattempted", "Unattempted"], ["Guessed", "Guessed"], ["Slow", "Slow"]]} onChange={(v) => setD({ ...d, outcome: v as GtEntry["outcome"] })}/><Field label="Why?" value={d.reason || ""} onChange={(v) => setD({ ...d, reason: v })}/></div><div className="mt-2 grid gap-2 md:grid-cols-2"><Area label="Correct approach / concept" value={d.approach || ""} onChange={(v) => setD({ ...d, approach: v })}/><div className="flex flex-wrap items-center gap-4 rounded-lg border border-[#232838] bg-[#0F1218] p-3 text-sm text-[#8B92A5]"><Check label="Reattempted" value={Boolean(d.reattempted)} onChange={(v) => setD({ ...d, reattempted: v })}/><Check label="Similar solved" value={Boolean(d.similarSolved)} onChange={(v) => setD({ ...d, similarSolved: v })}/><Check label="Teacher doubt" value={Boolean(d.teacherDoubt)} onChange={(v) => setD({ ...d, teacherDoubt: v })}/></div></div><button disabled={viewer} onClick={add} className="mt-3 rounded-lg bg-[#3DDCFF] px-4 py-2 font-semibold text-[#031014] disabled:opacity-50">Add repair item</button></Card><ListCard items={data.map((e) => `${e.gt} · Q${e.question} · ${SUBJECTS[e.subject].label} · ${e.topic} · ${e.outcome} · ${e.reason || "No reason logged"}`)} /></section>;
}

function Doubts({ data, viewer, onSave }: { data: Doubt[]; viewer: boolean; onSave: (x: Doubt[]) => void }) {
  const [d, setD] = useState<Partial<Doubt>>({ subject: "chem", status: "Pending" });
  function add() { if (!d.topic || !d.question) return; onSave([{ id: uid(), date: d.date || new Date().toISOString().slice(0, 10), subject: d.subject as Subject, topic: d.topic, question: d.question, status: d.status as Doubt["status"], teacher: d.teacher || "", note: d.note || "" }, ...data]); setD({ subject: "chem", status: "Pending" }); }
  return <section className="space-y-4"><Card title="Doubt queue" subtitle="Put every unresolved doubt here before it leaks into the next GT."><div className="grid gap-2 md:grid-cols-4"><Field label="Date" value={d.date || ""} onChange={(v) => setD({ ...d, date: v })} type="date"/><Select label="Subject" value={d.subject || "chem"} options={Object.entries(SUBJECTS).map(([k, v]) => [k, v.label])} onChange={(v) => setD({ ...d, subject: v as Subject })}/><Field label="Topic" value={d.topic || ""} onChange={(v) => setD({ ...d, topic: v })}/><Field label="Question / doubt" value={d.question || ""} onChange={(v) => setD({ ...d, question: v })}/></div><div className="mt-2 grid gap-2 md:grid-cols-3"><Select label="Status" value={d.status || "Pending"} options={[["Pending", "Pending"], ["Asked", "Asked"], ["Cleared", "Cleared"]]} onChange={(v) => setD({ ...d, status: v as Doubt["status"] })}/><Field label="Teacher" value={d.teacher || ""} onChange={(v) => setD({ ...d, teacher: v })}/><Field label="Note" value={d.note || ""} onChange={(v) => setD({ ...d, note: v })}/></div><button disabled={viewer} onClick={add} className="mt-3 rounded-lg bg-[#3DDCFF] px-4 py-2 font-semibold text-[#031014] disabled:opacity-50">Add doubt</button></Card><ListCard items={data.map((x) => `${SUBJECTS[x.subject].label} · ${x.topic} · ${x.status} · ${x.question} · Teacher: ${x.teacher || "—"}`)} /></section>;
}

function Books({ data, viewer, onSave }: { data: Record<string, BookProgress>; viewer: boolean; onSave: (x: Record<string, BookProgress>) => void }) { return <section className="space-y-4"><Card title="External-book tracker" subtitle="Teacher-selected Level 1 first: H.C. Verma, Target and N. Avasthi."><div className="grid gap-3 md:grid-cols-3">{BOOKS.map((book) => { const b = data[book] || { attempted: 0, solved: 0, marked: 0, note: "" }; const update = (key: keyof BookProgress, value: string) => onSave({ ...data, [book]: { ...b, [key]: key === "note" ? value : Number(value) || 0 } }); return <div key={book} className="rounded-xl border border-[#232838] bg-[#12151C] p-4"><div className="font-bold">{book}</div><div className="mt-3 grid grid-cols-3 gap-2"><Mini label="Attempted" value={b.attempted} disabled={viewer} onChange={(v) => update("attempted", v)}/><Mini label="Solved" value={b.solved} disabled={viewer} onChange={(v) => update("solved", v)}/><Mini label="Marked" value={b.marked} disabled={viewer} onChange={(v) => update("marked", v)}/></div><textarea disabled={viewer} value={b.note} onChange={(e) => update("note", e.target.value)} placeholder="Teacher-marked ranges" className="mt-3 min-h-[70px] w-full rounded-lg border border-[#232838] bg-[#0B0D12] px-3 py-2 text-xs outline-none disabled:opacity-60"/></div>; })}</div></Card></section>; }

function Review({ data, viewer, onSave }: { data: WeeklyReview[]; viewer: boolean; onSave: (x: WeeklyReview[]) => void }) { const [d, setD] = useState<Partial<WeeklyReview>>({}); function add() { if (!d.week) return; onSave([{ id: uid(), week: d.week, hours: Number(d.hours)||0, questions: Number(d.questions)||0, adherence: Number(d.adherence)||0, best: d.best||"", weak: d.weak||"", next: d.next||"" }, ...data]); setD({}); } return <section className="space-y-4"><Card title="Weekly review" subtitle="Use the data to decide what changes next week."><div className="grid gap-2 md:grid-cols-4"><Field label="Week" value={d.week || ""} onChange={(v)=>setD({...d,week:v})}/><Field label="Self-study hours" value={String(d.hours||0)} onChange={(v)=>setD({...d,hours:Number(v)})} type="number"/><Field label="Questions" value={String(d.questions||0)} onChange={(v)=>setD({...d,questions:Number(v)})} type="number"/><Field label="Adherence %" value={String(d.adherence||0)} onChange={(v)=>setD({...d,adherence:Number(v)})} type="number"/></div><div className="mt-2 grid gap-2 md:grid-cols-3"><Area label="Best thing" value={d.best||""} onChange={(v)=>setD({...d,best:v})}/><Area label="Weakest point" value={d.weak||""} onChange={(v)=>setD({...d,weak:v})}/><Area label="Next change" value={d.next||""} onChange={(v)=>setD({...d,next:v})}/></div><button disabled={viewer} onClick={add} className="mt-3 rounded-lg bg-[#3DDCFF] px-4 py-2 font-semibold text-[#031014] disabled:opacity-50">Add review</button></Card><ListCard items={data.map((x)=>`${x.week} · ${x.hours}h · ${x.questions} Q · ${x.adherence}% adherence · Weak: ${x.weak||"—"}`)} /></section>; }

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) { return <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="text-[16px] font-semibold">{title}</h2><p className="mt-1 text-[11px] text-[#565D70]">{subtitle}</p><div className="mt-4">{children}</div></section>; }
function ListCard({ items }: { items: string[] }) { return <section className="space-y-2">{items.map((x, i)=><div key={`${x}-${i}`} className="rounded-xl border border-[#232838] bg-[#12151C] p-4 text-sm text-[#C0C5D0]">{x}</div>)}</section>; }
function Field({ label, value, onChange, type="text" }: { label:string; value:string; onChange:(v:string)=>void; type?:string }) { return <label className="block text-[10px] uppercase tracking-wider text-[#565D70]">{label}<input type={type} value={value} onChange={(e)=>onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-[#232838] bg-[#0B0D12] px-2.5 py-2 text-xs outline-none"/></label>; }
function Area({ label, value, onChange }: { label:string; value:string; onChange:(v:string)=>void }) { return <label className="block text-[10px] uppercase tracking-wider text-[#565D70]">{label}<textarea value={value} onChange={(e)=>onChange(e.target.value)} className="mt-1 min-h-[74px] w-full rounded-lg border border-[#232838] bg-[#0B0D12] px-3 py-2 text-xs outline-none"/></label>; }
function Select({ label,value,options,onChange }: { label:string; value:string; options:Array<[string,string]>; onChange:(v:string)=>void }) { return <label className="block text-[10px] uppercase tracking-wider text-[#565D70]">{label}<select value={value} onChange={(e)=>onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-[#232838] bg-[#0B0D12] px-2.5 py-2 text-xs outline-none">{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>; }
function Check({ label, value, onChange }: { label:string; value:boolean; onChange:(v:boolean)=>void }) { return <label className="flex items-center gap-2"><input type="checkbox" checked={value} onChange={(e)=>onChange(e.target.checked)} className="accent-[#3DDCFF]"/>{label}</label>; }
function Mini({ label, value, disabled, onChange }: { label:string; value:number; disabled:boolean; onChange:(v:string)=>void }) { return <label className="block text-[9px] text-[#565D70]">{label}<input disabled={disabled} type="number" min={0} value={value} onChange={(e)=>onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-[#232838] bg-[#0B0D12] px-2 py-1.5 text-xs outline-none disabled:opacity-60"/></label>; }
