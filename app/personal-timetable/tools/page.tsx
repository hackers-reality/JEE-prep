"use client";

import { useEffect, useMemo, useState } from "react";

type Subject = "phy" | "chem" | "math";
const SUBJECTS: Record<Subject, { label: string; color: string }> = {
  phy: { label: "Physics", color: "#3DDCFF" },
  chem: { label: "Chemistry", color: "#A78BFA" },
  math: { label: "Maths", color: "#FFB454" },
};

type Payload = {
  rows: unknown[];
  logs: Record<string, any>;
  syllabus: Record<string, string>;
  gtDiary: GtEntry[];
  doubts: Doubt[];
  bookProgress: Record<string, BookProgress>;
  weeklyReviews: WeeklyReview[];
};

type GtEntry = {
  id: string; date: string; gt: string; question: string; subject: Subject; topic: string;
  outcome: "Wrong" | "Unattempted" | "Guessed" | "Slow"; reason: string; correctApproach: string;
  reattempted: boolean; similarSolved: boolean; teacherDoubt: boolean; note: string;
};
type Doubt = { id: string; date: string; subject: Subject; topic: string; question: string; status: "Pending" | "Asked" | "Cleared"; teacher: string; note: string };
type BookProgress = { attempted: number; solved: number; marked: number; note: string };
type WeeklyReview = { id: string; week: string; selfStudy: number; questions: number; adherence: number; best: string; weak: string; next: string };

const emptyPayload = (): Payload => ({ rows: [], logs: {}, syllabus: {}, gtDiary: [], doubts: [], bookProgress: {}, weeklyReviews: [] });
const uid = () => Math.random().toString(36).slice(2, 10);

export default function ToolsPage() {
  const [payload, setPayload] = useState<Payload>(emptyPayload());
  const [viewer, setViewer] = useState(false);
  const [status, setStatus] = useState("");
  const [active, setActive] = useState<"gt" | "doubts" | "books" | "review">("gt");

  useEffect(() => {
    const share = new URLSearchParams(window.location.search).get("share");
    setViewer(Boolean(share));
    const url = share ? `/api/personal-timetable?share=${encodeURIComponent(share)}` : "/api/personal-timetable";
    fetch(url)
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("Could not load tracker")))
      .then((data) => setPayload({ ...emptyPayload(), ...(data.payload ?? {}) }))
      .catch((e) => setStatus(e.message));
  }, []);

  async function save(next: Payload = payload) {
    if (viewer) return;
    setStatus("Saving…");
    try {
      const response = await fetch("/api/personal-timetable", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      if (!response.ok) throw new Error("Save failed");
      setPayload(next); setStatus("Saved ✓");
    } catch (e) { setStatus(e instanceof Error ? e.message : "Save failed"); }
  }

  function patch<K extends keyof Payload>(key: K, value: Payload[K]) { setPayload((p) => ({ ...p, [key]: value })); }

  return <main className="min-h-screen bg-[#0B0D12] text-[#E7E9EE] px-4 pb-16 pt-6 sm:px-6">
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-5 flex items-center justify-between gap-3"><div><div className="text-[11px] uppercase tracking-[0.2em] text-[#3DDCFF]">JEE 2028 tracker</div><h1 className="text-3xl font-bold">Repair, doubts, books & weekly review</h1><p className="mt-1 text-sm text-[#8B92A5]">{viewer ? "Read-only parent/teacher view" : "Owner tools — this is where the work gets repaired, not just recorded."}</p></div><a href="/personal-timetable" className="rounded-lg border border-[#232838] bg-[#12151C] px-3 py-2 text-sm text-[#8B92A5]">Back to dashboard</a></div>

      <nav className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{([['gt','GT diary'],['doubts','Doubt queue'],['books','Books'],['review','Weekly review'] as const]).map(([k,label]) => <button key={k} onClick={() => setActive(k)} className={`rounded-xl border px-3 py-3 text-sm font-semibold ${active === k ? "border-[#3DDCFF]/50 bg-[#12151C] text-[#E7E9EE]" : "border-[#232838] bg-[#0F1218] text-[#8B92A5]"}`}>{label}</button>)}</nav>

      {active === "gt" && <GtDiary entries={payload.gtDiary} viewer={viewer} onChange={(x) => patch("gtDiary", x)} onSave={() => save()} />}
      {active === "doubts" && <DoubtQueue items={payload.doubts} viewer={viewer} onChange={(x) => patch("doubts", x)} onSave={() => save()} />}
      {active === "books" && <BookTracker data={payload.bookProgress} viewer={viewer} onChange={(x) => patch("bookProgress", x)} onSave={() => save()} />}
      {active === "review" && <WeeklyReview items={payload.weeklyReviews} viewer={viewer} onChange={(x) => patch("weeklyReviews", x)} onSave={() => save()} />}
      {status && <div className="mt-4 text-center text-xs text-[#565D70]">{status}</div>}
    </div>
  </main>;
}

function GtDiary({ entries, viewer, onChange, onSave }: { entries: GtEntry[]; viewer: boolean; onChange: (x: GtEntry[]) => void; onSave: () => void }) {
  const [draft, setDraft] = useState<Partial<GtEntry>>({ outcome: "Wrong", subject: "phy", reattempted: false, similarSolved: false, teacherDoubt: false });
  function add() { if (!draft.question || !draft.topic) return; onChange([{ id: uid(), date: draft.date || new Date().toISOString().slice(0,10), gt: draft.gt || "GT-02", question: draft.question, subject: draft.subject as Subject, topic: draft.topic, outcome: draft.outcome as GtEntry["outcome"], reason: draft.reason || "", correctApproach: draft.correctApproach || "", reattempted: Boolean(draft.reattempted), similarSolved: Boolean(draft.similarSolved), teacherDoubt: Boolean(draft.teacherDoubt), note: draft.note || "" }, ...entries]); setDraft({ outcome: "Wrong", subject: "phy" }); }
  return <section className="space-y-4">
    <Card title="GT mistake diary" subtitle="Every wrong or unattempted question should end with a reason and a repair action.">
      <div className="grid gap-2 md:grid-cols-4"><Input label="Date" value={draft.date || ""} onChange={(v) => setDraft({ ...draft, date: v })} type="date"/><Input label="GT" value={draft.gt || "GT-02"} onChange={(v) => setDraft({ ...draft, gt: v })}/><Input label="Question" value={draft.question || ""} onChange={(v) => setDraft({ ...draft, question: v })}/><Input label="Topic" value={draft.topic || ""} onChange={(v) => setDraft({ ...draft, topic: v })}/></div>
      <div className="mt-2 grid gap-2 md:grid-cols-3"><Select label="Subject" value={draft.subject || "phy"} options={Object.keys(SUBJECTS).map((k) => [k, SUBJECTS[k as Subject].label])} onChange={(v) => setDraft({ ...draft, subject: v as Subject })}/><Select label="Outcome" value={draft.outcome || "Wrong"} options={[["Wrong","Wrong"],["Unattempted","Unattempted"],["Guessed","Guessed"],["Slow","Slow"]]} onChange={(v) => setDraft({ ...draft, outcome: v as GtEntry["outcome"] })}/><Input label="Why?" value={draft.reason || ""} onChange={(v) => setDraft({ ...draft, reason: v })}/></div>
      <div className="mt-2 grid gap-2 md:grid-cols-2"><TextArea label="Correct approach / concept" value={draft.correctApproach || ""} onChange={(v) => setDraft({ ...draft, correctApproach: v })}/><TextArea label="Repair note" value={draft.note || ""} onChange={(v) => setDraft({ ...draft, note: v })}/></div>
      <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#8B92A5]"><Check label="Reattempted" checked={Boolean(draft.reattempted)} onChange={(v) => setDraft({ ...draft, reattempted: v })}/><Check label="Solved similar" checked={Boolean(draft.similarSolved)} onChange={(v) => setDraft({ ...draft, similarSolved: v })}/><Check label="Teacher doubt" checked={Boolean(draft.teacherDoubt)} onChange={(v) => setDraft({ ...draft, teacherDoubt: v })}/></div><button disabled={viewer} onClick={() => { add(); setTimeout(onSave, 0); }} className="mt-3 rounded-lg bg-[#3DDCFF] px-4 py-2 font-semibold text-[#031014] disabled:opacity-50">Add repair item</button>
    </Card>
    <div className="space-y-2">{entries.map((e) => <div key={e.id} className="rounded-xl border border-[#232838] bg-[#12151C] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div className="font-bold">{e.gt} · Q{e.question} · <span style={{ color: SUBJECTS[e.subject].color }}>{SUBJECTS[e.subject].label}</span></div><div className="text-[10px] uppercase tracking-wider text-[#8B92A5]">{e.outcome}</div></div><div className="mt-1 text-sm text-[#C0C5D0]">{e.topic}</div><div className="mt-2 grid gap-2 text-xs text-[#8B92A5] md:grid-cols-2"><div><b>Why:</b> {e.reason || "—"}</div><div><b>Approach:</b> {e.correctApproach || "—"}</div><div><b>Reattempted:</b> {e.reattempted ? "Yes" : "No"}</div><div><b>Teacher doubt:</b> {e.teacherDoubt ? "Yes" : "No"}</div></div></div>)}</div>
  </section>;
}

function DoubtQueue({ items, viewer, onChange, onSave }: { items: Doubt[]; viewer: boolean; onChange: (x: Doubt[]) => void; onSave: () => void }) {
  const [draft, setDraft] = useState<Partial<Doubt>>({ subject: "chem", status: "Pending" });
  function add() { if (!draft.topic || !draft.question) return; onChange([{ id: uid(), date: draft.date || new Date().toISOString().slice(0,10), subject: draft.subject as Subject, topic: draft.topic, question: draft.question, status: draft.status as Doubt["status"], teacher: draft.teacher || "", note: draft.note || "" }, ...items]); setDraft({ subject: "chem", status: "Pending" }); }
  return <section className="space-y-4"><Card title="Doubt queue" subtitle="Nothing stays vague until the next GT. Put it here and force a resolution."><div className="grid gap-2 md:grid-cols-4"><Input label="Date" value={draft.date || ""} onChange={(v) => setDraft({ ...draft, date: v })} type="date"/><Select label="Subject" value={draft.subject || "chem"} options={Object.keys(SUBJECTS).map((k) => [k, SUBJECTS[k as Subject].label])} onChange={(v) => setDraft({ ...draft, subject: v as Subject })}/><Input label="Topic" value={draft.topic || ""} onChange={(v) => setDraft({ ...draft, topic: v })}/><Input label="Question / doubt" value={draft.question || ""} onChange={(v) => setDraft({ ...draft, question: v })}/></div><div className="mt-2 grid gap-2 md:grid-cols-3"><Select label="Status" value={draft.status || "Pending"} options={[["Pending","Pending"],["Asked","Asked"],["Cleared","Cleared"]]} onChange={(v) => setDraft({ ...draft, status: v as Doubt["status"] })}/><Input label="Teacher" value={draft.teacher || ""} onChange={(v) => setDraft({ ...draft, teacher: v })}/><Input label="Note" value={draft.note || ""} onChange={(v) => setDraft({ ...draft, note: v })}/></div><button disabled={viewer} onClick={() => { add(); setTimeout(onSave, 0); }} className="mt-3 rounded-lg bg-[#3DDCFF] px-4 py-2 font-semibold text-[#031014] disabled:opacity-50">Add doubt</button></Card><div className="grid gap-2">{items.map((d) => <div key={d.id} className="rounded-xl border border-[#232838] bg-[#12151C] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div className="font-bold"><span style={{ color: SUBJECTS[d.subject].color }}>{SUBJECTS[d.subject].label}</span> · {d.topic}</div><span className={`rounded-full px-2 py-1 text-[10px] ${d.status === "Cleared" ? "bg-emerald-400/10 text-emerald-300" : d.status === "Asked" ? "bg-sky-400/10 text-sky-300" : "bg-amber-400/10 text-amber-300"}`}>{d.status}</span></div><div className="mt-1 text-sm text-[#C0C5D0]">{d.question}</div><div className="mt-2 text-xs text-[#8B92A5]">Teacher: {d.teacher || "—"} · {d.note || "No note"}</div></div>)}</div></section>;
}

function BookTracker({ data, viewer, onChange, onSave }: { data: Record<string, BookProgress>; viewer: boolean; onChange: (x: Record<string, BookProgress>) => void; onSave: () => void }) {
  const books = ["H.C. Verma Level 1", "Target Level 1", "N. Avasthi Level 1"];
  function update(book: string, key: keyof BookProgress, value: string) { onChange({ ...data, [book]: { attempted: data[book]?.attempted || 0, solved: data[book]?.solved || 0, marked: data[book]?.marked || 0, note: data[book]?.note || "", [key]: key === "note" ? value : Number(value) || 0 } }); }
  return <section className="space-y-4"><Card title="External-book tracker" subtitle="Teacher-selected Level 1 first. Record the volume that matters, not just that you opened the book."><div className="grid gap-3 md:grid-cols-3">{books.map((book) => { const b = data[book] || { attempted: 0, solved: 0, marked: 0, note: "" }; return <div key={book} className="rounded-xl border border-[#232838] bg-[#12151C] p-4"><div className="font-bold text-[#E7E9EE]">{book}</div><div className="mt-3 grid grid-cols-3 gap-2"><MiniInput label="Attempted" value={b.attempted} disabled={viewer} onChange={(v) => update(book, "attempted", v)}/><MiniInput label="Solved" value={b.solved} disabled={viewer} onChange={(v) => update(book, "solved", v)}/><MiniInput label="Marked" value={b.marked} disabled={viewer} onChange={(v) => update(book, "marked", v)}/></div><textarea disabled={viewer} value={b.note} onChange={(e) => update(book, "note", e.target.value)} placeholder="Teacher-marked chapters/questions…" className="mt-3 min-h-20 w-full rounded-lg border border-[#232838] bg-[#0B0D12] px-3 py-2 text-xs outline-none"/></div>; })}</div><button disabled={viewer} onClick={onSave} className="mt-3 rounded-lg bg-[#3DDCFF] px-4 py-2 font-semibold text-[#031014] disabled:opacity-50">Save books</button></Card></section>;
}

function WeeklyReview({ items, viewer, onChange, onSave }: { items: WeeklyReview[]; viewer: boolean; onChange: (x: WeeklyReview[]) => void; onSave: () => void }) {
  const [draft, setDraft] = useState<Partial<WeeklyReview>>({});
  function add() { if (!draft.week) return; const item: WeeklyReview = { id: uid(), week: draft.week, selfStudy: Number(draft.selfStudy)||0, questions: Number(draft.questions)||0, adherence: Number(draft.adherence)||0, best: draft.best||"", weak: draft.weak||"", next: draft.next||"" }; onChange([item, ...items]); setDraft({}); }
  return <section className="space-y-4"><Card title="Weekly review" subtitle="The Sunday question: did your behaviour improve, or did only the dashboard get prettier?"><div className="grid gap-2 md:grid-cols-4"><Input label="Week" value={draft.week || ""} onChange={(v) => setDraft({ ...draft, week: v })}/><Input label="Self-study h" value={String(draft.selfStudy||"")} onChange={(v) => setDraft({ ...draft, selfStudy: Number(v) })} type="number"/><Input label="Questions" value={String(draft.questions||"")} onChange={(v) => setDraft({ ...draft, questions: Number(v) })} type="number"/><Input label="Adherence %" value={String(draft.adherence||"")} onChange={(v) => setDraft({ ...draft, adherence: Number(v) })} type="number"/></div><div className="mt-2 grid gap-2 md:grid-cols-3"><TextArea label="Best thing this week" value={draft.best || ""} onChange={(v) => setDraft({ ...draft, best: v })}/><TextArea label="Weakest point" value={draft.weak || ""} onChange={(v) => setDraft({ ...draft, weak: v })}/><TextArea label="Next week's change" value={draft.next || ""} onChange={(v) => setDraft({ ...draft, next: v })}/></div><button disabled={viewer} onClick={() => { add(); setTimeout(onSave, 0); }} className="mt-3 rounded-lg bg-[#3DDCFF] px-4 py-2 font-semibold text-[#031014] disabled:opacity-50">Add weekly review</button></Card><div className="grid gap-3 md:grid-cols-2">{items.map((r) => <div key={r.id} className="rounded-xl border border-[#232838] bg-[#12151C] p-4"><div className="font-bold">{r.week}</div><div className="mt-2 grid grid-cols-3 gap-2 text-center"><Metric value={r.selfStudy.toFixed(1)} label="h"/><Metric value={r.questions} label="Qs"/><Metric value={`${r.adherence}%`} label="adherence"/></div><div className="mt-3 grid gap-2 text-xs text-[#8B92A5]"><div><b>Best:</b> {r.best || "—"}</div><div><b>Weak:</b> {r.weak || "—"}</div><div><b>Next:</b> {r.next || "—"}</div></div></div>)}</div></section>;
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-[#232838] bg-[#12151C] p-5"><h2 className="text-[16px] font-semibold">{title}</h2><p className="mt-1 text-[12px] text-[#565D70]">{subtitle}</p><div className="mt-4">{children}</div></section>; }
function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) { return <label className="block text-[10px] uppercase tracking-wider text-[#565D70]">{label}<input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-[#232838] bg-[#0B0D12] px-2.5 py-2 text-sm text-[#E7E9EE] outline-none"/></label>; }
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) { return <label className="block text-[10px] uppercase tracking-wider text-[#565D70]">{label}<textarea value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 min-h-20 w-full rounded-lg border border-[#232838] bg-[#0B0D12] px-3 py-2 text-sm text-[#E7E9EE] outline-none"/></label>; }
function Select({ label, value, options, onChange }: { label: string; value: string; options: string[][]; onChange: (v: string) => void }) { return <label className="block text-[10px] uppercase tracking-wider text-[#565D70]">{label}<select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-[#232838] bg-[#0B0D12] px-2.5 py-2 text-sm text-[#E7E9EE] outline-none">{options.map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></label>; }
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) { return <label className="flex items-center gap-2"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />{label}</label>; }
function MiniInput({ label, value, onChange, disabled }: { label: string; value: number; onChange: (v: string) => void; disabled?: boolean }) { return <label className="text-[9px] text-[#565D70]">{label}<input disabled={disabled} type="number" min={0} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-md border border-[#232838] bg-[#0B0D12] px-2 py-1.5 text-xs"/></label>; }
function Metric({ value, label }: { value: string | number; label: string }) { return <div className="rounded-lg border border-[#232838] bg-[#171B24] px-3 py-2"><div className="font-mono text-sm font-bold">{value}</div><div className="text-[9px] uppercase tracking-wider text-[#565D70]">{label}</div></div>; }
