"use client";

import { useEffect, useMemo, useState } from "react";

const PRESETS = [25, 50, 90];

export default function FocusTimer() {
  const [minutes, setMinutes] = useState(50);
  const [secondsLeft, setSecondsLeft] = useState(50 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    const saved = Number(localStorage.getItem("jee-focus-sessions") ?? 0);
    if (Number.isFinite(saved)) setSessions(saved);
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          setRunning(false);
          setSessions((current) => {
            const next = current + 1;
            localStorage.setItem("jee-focus-sessions", String(next));
            return next;
          });
          return minutes * 60;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, minutes]);

  const display = useMemo(() => {
    const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const ss = (secondsLeft % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }, [secondsLeft]);

  function choosePreset(value: number) {
    setMinutes(value);
    setSecondsLeft(value * 60);
    setRunning(false);
  }

  return (
    <div className="paper-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs uppercase tracking-widest opacity-50">Focus mode</p><h2 className="font-hand text-2xl font-bold">One clean session</h2></div>
        <span className="text-xs opacity-55">{sessions} completed</span>
      </div>
      <div className="text-center py-5">
        <div className="font-mono text-5xl font-bold tracking-tight">{display}</div>
        <p className="text-xs opacity-50 mt-2">Phone away. Questions open. Go.</p>
      </div>
      <div className="flex gap-2 mb-4">
        {PRESETS.map((value) => <button key={value} onClick={() => choosePreset(value)} className="flex-1 px-2 py-2 text-xs font-bold rounded border" style={{ background: minutes === value ? "var(--sticky-yellow)" : "white", borderColor: "var(--grid-line)" }}>{value}m</button>)}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setRunning((value) => !value)} className="flex-1 sticky-button" style={{ border: 0 }}>{running ? "Pause" : "Start focus"}</button>
        <button onClick={() => { setRunning(false); setSecondsLeft(minutes * 60); }} className="px-4 rounded border text-sm font-bold" style={{ borderColor: "var(--grid-line)" }}>Reset</button>
      </div>
    </div>
  );
}
