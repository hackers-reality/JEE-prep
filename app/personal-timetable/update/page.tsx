"use client";

import { useEffect, useState } from "react";

type Metrics = {
  gtWrong: number;
  gtMainLevel: number;
  unattempted: number;
  doubts: number;
  cleared: number;
  advanced: number;
};

const EMPTY: Metrics = { gtWrong: 0, gtMainLevel: 0, unattempted: 0, doubts: 0, cleared: 0, advanced: 0 };

export default function UpdateProgressPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [metrics, setMetrics] = useState<Metrics>(EMPTY);
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`jee-progress-${date}`);
      if (raw) setMetrics({ ...EMPTY, ...JSON.parse(raw) });
      else setMetrics(EMPTY);
    } catch {
      setMetrics(EMPTY);
    }
  }, [date]);

  function update(key: keyof Metrics, value: string) {
    setMetrics((m) => ({ ...m, [key]: Math.max(0, Number(value) || 0) }));
  }

  async function save() {
    localStorage.setItem(`jee-progress-${date}`, JSON.stringify(metrics));
    setStatus("Saved locally ✓");
    try {
      const response = await fetch("/api/personal-timetable", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progressDate: date, metrics }),
      });
      if (response.ok) setStatus("Saved & synced ✓");
    } catch {
      // Local save remains the fallback until Turso/auth is connected.
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Progress input</p>
          <h1 className="mt-2 text-3xl font-black">Update GT & doubt metrics</h1>
          <p className="mt-2 text-sm text-slate-400">These are simple counters, not a diary. Update them after a GT, coaching session, or doubt-clearing session.</p>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label="GT Wrong" value={metrics.gtWrong} onChange={(v) => update("gtWrong", v)} hint="Questions answered incorrectly." />
          <Metric label="GT Main Level" value={metrics.gtMainLevel} onChange={(v) => update("gtMainLevel", v)} hint="Main-level questions attempted/recorded." />
          <Metric label="Unattempted" value={metrics.unattempted} onChange={(v) => update("unattempted", v)} hint="Questions left unanswered." />
          <Metric label="Doubts" value={metrics.doubts} onChange={(v) => update("doubts", v)} hint="New doubts raised." />
          <Metric label="Cleared" value={metrics.cleared} onChange={(v) => update("cleared", v)} hint="Doubts actually cleared." />
          <Metric label="Advanced" value={metrics.advanced} onChange={(v) => update("advanced", v)} hint="Advanced-level questions solved." />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={save} className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-emerald-300">Save progress</button>
          {status && <span className="text-sm text-emerald-400">{status}</span>}
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value, onChange, hint }: { label: string; value: number; onChange: (v: string) => void; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <label className="text-sm font-bold text-slate-200">{label}</label>
      <input type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-2xl font-black outline-none focus:border-emerald-400" />
      <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p>
    </div>
  );
}
