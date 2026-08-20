"use client";

import { useMemo, useState } from "react";

const slots = [
  "Wake / morning routine",
  "Morning study block",
  "Midday break / meal",
  "Afternoon study block",
  "Coaching: 4:30 PM – 9:15 PM",
  "Dinner / reset",
  "Night study block",
  "Revision block",
  "Question-solving block",
  "GT / mistake diary",
  "Wind down",
  "Sleep",
];

const week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const initialRows = week.flatMap((day) =>
  slots.map((slot) => ({ day, slot, subject: "", topic: "", type: "", target: "", done: "", hours: "", status: "Planned", notes: "" }))
);

export default function PersonalTimetablePage() {
  const [rows, setRows] = useState(initialRows);
  const [activeDay, setActiveDay] = useState("Monday");

  const dayRows = useMemo(() => rows.filter((r) => r.day === activeDay), [rows, activeDay]);
  const totals = useMemo(() => {
    const hours = rows.reduce((sum, r) => sum + (Number(r.hours) || 0), 0);
    const questions = rows.reduce((sum, r) => sum + (Number(r.done) || 0), 0);
    return { hours, questions };
  }, [rows]);

  function updateRow(day: string, slot: string, key: string, value: string) {
    setRows((current) => current.map((r) => (r.day === day && r.slot === slot ? { ...r, [key]: value } : r)));
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl p-6 lg:p-10">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">JEE 2028</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">Personal Timetable & Progress</h1>
            <p className="mt-2 max-w-3xl text-slate-400">A simple daily command centre for self-study, revision, question solving, doubts and GT improvement.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Study hours" value={totals.hours.toFixed(1)} />
            <Stat label="Questions" value={String(totals.questions)} />
            <Stat label="Daily target" value="50 Q" />
          </div>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex flex-wrap gap-2">
            {week.map((day) => (
              <button key={day} onClick={() => setActiveDay(day)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeDay === day ? "bg-emerald-400 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                {day}
              </button>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-[1250px] w-full text-left text-sm">
              <thead className="bg-slate-800/80 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Time / block</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Task / topic</th><th className="px-4 py-3">Study type</th><th className="px-4 py-3">Target Qs</th><th className="px-4 py-3">Done</th><th className="px-4 py-3">Hours</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {dayRows.map((r) => (
                  <tr key={`${r.day}-${r.slot}`} className="align-top hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-slate-200">{r.slot}</td>
                    <Cell value={r.subject} onChange={(v) => updateRow(r.day, r.slot, "subject", v)} placeholder="P / C / M / Other" />
                    <Cell value={r.topic} onChange={(v) => updateRow(r.day, r.slot, "topic", v)} placeholder="Topic / task" />
                    <Cell value={r.type} onChange={(v) => updateRow(r.day, r.slot, "type", v)} placeholder="Self-study / Revision / Solving" />
                    <Cell value={r.target} onChange={(v) => updateRow(r.day, r.slot, "target", v)} placeholder="0" number />
                    <Cell value={r.done} onChange={(v) => updateRow(r.day, r.slot, "done", v)} placeholder="0" number />
                    <Cell value={r.hours} onChange={(v) => updateRow(r.day, r.slot, "hours", v)} placeholder="0" number />
                    <td className="px-4 py-3">
                      <select value={r.status} onChange={(e) => updateRow(r.day, r.slot, "status", e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs">
                        <option>Planned</option><option>Done</option><option>Partial</option><option>Skipped</option>
                      </select>
                    </td>
                    <Cell value={r.notes} onChange={(v) => updateRow(r.day, r.slot, "notes", v)} placeholder="Notes" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <Panel title="GT / Mistake diary">
            <p>Track wrong and unattempted questions with exact reason, correct concept, corrective practice and reattempt status.</p>
          </Panel>
          <Panel title="Book targets">
            <p>Physics: H.C. Verma Level 1 • Maths: Target Level 1 • Chemistry: N. Avasthi Level 1 • plus coaching sheets and GT work.</p>
          </Panel>
          <Panel title="Actual GT-02">
            <p>12 Sep 2026 • 135 min • 45 questions. Physics: Vector, Kinematics, NLM, WEP. Chemistry: Mole Concept, Atomic Structure. Maths: Trig, Sets, R&amp;F, Straight Line, Circle.</p>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function Cell({ value, onChange, placeholder, number }: { value: string; onChange: (v: string) => void; placeholder: string; number?: boolean }) {
  return (
    <td className="px-4 py-3">
      <input type={number ? "number" : "text"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full min-w-28 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs outline-none placeholder:text-slate-600 focus:border-emerald-400" />
    </td>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-xl font-bold">{value}</div></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><h2 className="font-semibold text-emerald-400">{title}</h2><div className="mt-2 text-sm leading-6 text-slate-400">{children}</div></section>;
}
