"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  day: string;
  time: string;
  slot: string;
  subject: string;
  topic: string;
  type: string;
  target: number;
  done: number;
  hours: number;
  status: "Planned" | "Done" | "Partial" | "Skipped";
  notes: string;
};

const week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const template = [
  ["11:00–11:30", "Wake / morning routine", "Other", "Wake, wash, breakfast, desk setup", "Routine", 0, 0, 0.5],
  ["11:30–13:30", "Chemistry priority block", "Chemistry", "Atomic Structure — theory + worked examples", "Concept + notes", 15, 0, 2],
  ["13:30–14:00", "Lunch / reset", "Other", "Lunch + short break", "Break", 0, 0, 0.5],
  ["14:00–16:00", "Physics / Maths side-by-side", "Physics", "WEP — concepts, graphs, work-energy theorem", "Concept + Level 1", 15, 0, 2],
  ["16:00–16:30", "Coaching prep / buffer", "Other", "Pack, travel/buffer, no heavy study", "Buffer", 0, 0, 0.5],
  ["16:30–21:15", "Coaching", "Other", "Attend coaching; mark doubts and questions to revisit", "Coaching", 0, 0, 4.75],
  ["21:15–22:00", "Dinner / reset", "Other", "Dinner, shower/reset, no doom-scrolling", "Reset", 0, 0, 0.75],
  ["22:00–23:30", "Question-solving block", "Maths", "Level 1 external-book questions + coaching sheets", "Question solving", 20, 0, 1.5],
  ["23:30–00:15", "Revision block", "Chemistry", "Active recall: Atomic Structure + Mole Concept maintenance", "Revision", 5, 0, 0.75],
  ["00:15–01:15", "GT / mistake diary", "Other", "Wrong + unattempted GT questions; doubt list; reattempt", "GT analysis", 5, 0, 1],
  ["01:15–02:30", "Night study block", "Physics", "H.C. Verma Level 1 / selected teacher-marked questions", "Question solving", 10, 0, 1.25],
  ["02:30–03:15", "Wind down", "Other", "Plan tomorrow, light music, phone away", "Wind down", 0, 0, 0.75],
  ["03:15–03:30", "Sleep prep", "Other", "Bed; target consistent sleep window", "Sleep prep", 0, 0, 0.25],
];

const dayFocus: Record<string, { chem: string; physics: string; maths: string }> = {
  Monday: {
    chem: "Atomic Structure — Bohr model, spectra, quantum numbers",
    physics: "WEP — work by constant/variable force, work-energy theorem",
    maths: "Straight Line — slope, forms of line, angle between lines",
  },
  Tuesday: {
    chem: "Atomic Structure — photoelectric effect + de Broglie + numericals",
    physics: "WEP — potential energy, conservation of mechanical energy",
    maths: "Straight Line — distance, section formula, family of lines",
  },
  Wednesday: {
    chem: "Mole Concept — Level 1 maintenance + mixed numericals",
    physics: "Kinematics + NLM — mixed Level 1 reinforcement",
    maths: "Circle — standard equation, centre/radius, basic problems",
  },
  Thursday: {
    chem: "Atomic Structure — quantum numbers, orbitals, electronic configuration",
    physics: "WEP — spring work + mixed energy problems",
    maths: "Circle — tangent/chord basics + selected Target Level 1",
  },
  Friday: {
    chem: "Atomic Structure — full chapter revision + Level 1",
    physics: "Vectors + Kinematics + NLM — mixed timed set",
    maths: "Straight Line + Circle — mixed timed set",
  },
  Saturday: {
    chem: "Atomic Structure — weak areas from the week",
    physics: "WEP — Level 1 H.C. Verma / teacher-marked questions",
    maths: "Straight Line + Circle — Target Level 1",
  },
  Sunday: {
    chem: "Weekly chemistry review + error correction",
    physics: "Weekly physics review + WEP reattempts",
    maths: "Weekly maths review + mixed problems",
  },
};

function makeRows(): Row[] {
  return week.flatMap((day) =>
    template.map(([time, slot, subject, topic, type, target, done, hours]) => {
      let finalTopic = String(topic);
      if (slot === "Chemistry priority block") finalTopic = dayFocus[day].chem;
      if (slot === "Physics / Maths side-by-side") finalTopic = dayFocus[day].physics;
      if (slot === "Question-solving block") finalTopic = dayFocus[day].maths;
      if (slot === "Revision block") finalTopic = dayFocus[day].chem;
      if (slot === "Night study block") finalTopic = dayFocus[day].physics;
      return {
        day,
        time: String(time),
        slot: String(slot),
        subject: String(subject),
        topic: finalTopic,
        type: String(type),
        target: Number(target),
        done: Number(done),
        hours: Number(hours),
        status: "Planned",
        notes: "",
      };
    }),
  );
}

export default function PersonalTimetablePage() {
  const [rows, setRows] = useState<Row[]>(makeRows);
  const [activeDay, setActiveDay] = useState("Monday");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("jee2028-personal-timetable-v2");
      if (stored) setRows(JSON.parse(stored) as Row[]);
    } catch {
      // Keep the seeded timetable if local storage is unavailable.
    }
  }, []);

  const dayRows = useMemo(() => rows.filter((r) => r.day === activeDay), [rows, activeDay]);
  const totals = useMemo(() => {
    const completedHours = rows.reduce((sum, r) => sum + (r.status === "Done" ? r.hours : 0), 0);
    const plannedHours = rows.reduce((sum, r) => sum + r.hours, 0);
    const questionsDone = rows.reduce((sum, r) => sum + r.done, 0);
    const questionsTarget = rows.reduce((sum, r) => sum + r.target, 0);
    return { completedHours, plannedHours, questionsDone, questionsTarget };
  }, [rows]);

  const daily = useMemo(
    () =>
      week.map((day) => {
        const dayRows = rows.filter((r) => r.day === day);
        return {
          day: day.slice(0, 3),
          hours: Number(dayRows.reduce((s, r) => s + (r.status === "Done" ? r.hours : 0), 0).toFixed(1)),
          questions: dayRows.reduce((s, r) => s + r.done, 0),
        };
      }),
    [rows],
  );

  function updateRow(day: string, time: string, key: keyof Row, value: string) {
    setRows((current) => current.map((r) => (r.day === day && r.time === time ? { ...r, [key]: key === "target" || key === "done" || key === "hours" ? Number(value) || 0 : value } as Row : r)));
    setSaved(false);
  }

  function saveLocal() {
    localStorage.setItem("jee2028-personal-timetable-v2", JSON.stringify(rows));
    setSaved(true);
  }

  function resetSeed() {
    setRows(makeRows());
    localStorage.removeItem("jee2028-personal-timetable-v2");
    setSaved(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-10">
        <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">JEE 2028 • Personal command centre</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Personal Timetable & Progress</h1>
            <p className="mt-2 max-w-4xl text-slate-400">Built around your actual routine: wake around 11 AM, coaching 4:30–9:15 PM, 6–7 hours of self-study, Chemistry priority, and daily question solving.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={saveLocal} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-300">{saved ? "Saved ✓" : "Save today"}</button>
            <button onClick={resetSeed} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800">Reset seeded plan</button>
          </div>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Stat label="Self-study target" value="6–7 h/day" hint="Coaching is separate" />
          <Stat label="Question target" value="50+ Q/day" hint="Quality + analysis matter" />
          <Stat label="Chemistry" value="Priority" hint="Daily first major block" />
          <Stat label="Sleep target" value="3:15–3:30 AM" hint="Keep it consistent" />
          <Stat label="GT-02" value="12 Sep 2026" hint="135 min • 45 Q" />
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-bold">Weekly progress graph</h2>
                <p className="mt-1 text-xs text-slate-500">Only completed blocks count toward actual study hours.</p>
              </div>
              <div className="text-right"><div className="text-2xl font-black text-emerald-400">{totals.completedHours.toFixed(1)} h</div><div className="text-xs text-slate-500">completed</div></div>
            </div>
            <div className="mt-5 grid grid-cols-7 items-end gap-2 sm:gap-4" style={{ minHeight: 170 }}>
              {daily.map((d) => {
                const height = Math.min(100, (d.hours / 7) * 100);
                return <div key={d.day} className="flex h-40 flex-col items-center justify-end gap-2"><div className="text-[10px] text-slate-500">{d.hours}h</div><div className="w-full max-w-10 rounded-t-lg bg-emerald-400/80" style={{ height: `${Math.max(4, height)}%` }} /><div className="text-xs font-semibold text-slate-400">{d.day}</div></div>;
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <h2 className="font-bold">GT improvement checklist</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {[
                "Ask teacher about doubts instead of carrying them forward",
                "Analyse wrong + unattempted GT questions",
                "Look back at the exact concept behind each mistake",
                "Reattempt corrected questions without seeing the solution",
                "Use teacher-marked Level 1 questions from external books",
              ].map((item) => <label key={item} className="flex gap-3"><input type="checkbox" className="mt-1 accent-emerald-400" /><span>{item}</span></label>)}
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex flex-wrap gap-2">
            {week.map((day) => <button key={day} onClick={() => setActiveDay(day)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeDay === day ? "bg-emerald-400 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>{day}</button>)}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="border-b border-slate-800 bg-slate-900/95 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">{activeDay} plan</h2><p className="text-xs text-slate-500">Edit targets, actuals, status and notes as you work.</p></div><div className="text-xs text-slate-500">Daily target: <span className="font-bold text-slate-300">50+ questions</span></div></div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1450px] w-full text-left text-sm">
              <thead className="bg-slate-800/80 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Block</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Task / topic</th><th className="px-4 py-3">Study type</th><th className="px-4 py-3">Target Qs</th><th className="px-4 py-3">Done</th><th className="px-4 py-3">Hours</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Notes</th></tr></thead>
              <tbody className="divide-y divide-slate-800">
                {dayRows.map((r) => <tr key={`${r.day}-${r.time}`} className="align-top hover:bg-slate-800/40"><td className="whitespace-nowrap px-4 py-3 font-bold text-emerald-300">{r.time}</td><td className="px-4 py-3 font-medium text-slate-200">{r.slot}</td><td className="px-4 py-3 text-slate-300">{r.subject}</td><td className="min-w-72 px-4 py-3 text-slate-300">{r.topic}</td><td className="px-4 py-3 text-slate-400">{r.type}</td><Cell value={String(r.target)} onChange={(v) => updateRow(r.day, r.time, "target", v)} number /><Cell value={String(r.done)} onChange={(v) => updateRow(r.day, r.time, "done", v)} number /><Cell value={String(r.hours)} onChange={(v) => updateRow(r.day, r.time, "hours", v)} number /><td className="px-4 py-3"><select value={r.status} onChange={(e) => updateRow(r.day, r.time, "status", e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs"><option>Planned</option><option>Done</option><option>Partial</option><option>Skipped</option></select></td><Cell value={r.notes} onChange={(v) => updateRow(r.day, r.time, "notes", v)} placeholder="What happened? Doubt? Mistake?" /></tr>)}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Panel title="External-book targets"><p><b>Physics:</b> H.C. Verma Level 1, teacher-marked questions first. <b>Maths:</b> Target Level 1. <b>Chemistry:</b> N. Avasthi Level 1.</p></Panel>
          <Panel title="Already covered"><p>Vectors, Kinematics, NLM, basic Trigonometry, Sets, Functions/R&amp;F and Mole Concept are treated as revision/practice—not first-time learning.</p></Panel>
          <Panel title="Current priority"><p><b>Chemistry:</b> Atomic Structure. <b>Physics:</b> WEP. <b>Maths:</b> Straight Line + Circle. Completed chapters stay alive through mixed Level 1 practice.</p></Panel>
          <Panel title="Actual GT-02"><p>12 Sep 2026 • 135 min • 45 questions. Physics: Vector, Kinematics, NLM, WEP. Chemistry: Mole Concept, Atomic Structure. Maths: Trig, Sets, R&amp;F, Straight Line, Circle.</p></Panel>
        </section>

        <section className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <h2 className="font-bold text-emerald-300">Private progress architecture</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">This page is seeded as your personal owner dashboard. The next layer is server sync + a read-only parent/teacher view so your actual daily entries and graphs follow you across devices instead of living only in one browser.</p>
        </section>
      </div>
    </main>
  );
}

function Cell({ value, onChange, placeholder = "", number }: { value: string; onChange: (v: string) => void; placeholder?: string; number?: boolean }) {
  return <td className="px-4 py-3"><input type={number ? "number" : "text"} min={number ? 0 : undefined} step={number ? "0.25" : undefined} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full min-w-24 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs outline-none placeholder:text-slate-600 focus:border-emerald-400" /></td>;
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-xl font-black">{value}</div><div className="mt-1 text-[11px] text-slate-600">{hint}</div></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><h2 className="font-semibold text-emerald-400">{title}</h2><div className="mt-2 text-sm leading-6 text-slate-400">{children}</div></section>;
}
