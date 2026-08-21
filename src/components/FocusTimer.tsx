"use client";

import { useEffect, useMemo, useState } from "react";

const PRESETS = [25, 50, 90];

type StudySummary = { sessions?: unknown[] };

export default function FocusTimer() {
  const [minutes, setMinutes] = useState(50);
  const [secondsLeft, setSecondsLeft] = useState(50 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [saving, setSaving] = useState(false);

  async function refreshSessions() {
    try {
      const response = await fetch("/api/study-session", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as StudySummary;
      setSessions(Array.isArray(data.sessions) ? data.sessions.length : 0);
    } catch {
      // The cloud value remains unchanged if the network is unavailable.
    }
  }

  useEffect(() => { void refreshSessions(); }, []);

  async function completeSession(duration: number) {
    setSaving(true);
    try {
      const response = await fetch("/api/study-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ durationMinutes: duration, sessionType: "FOCUS" }),
      });
      if (response.ok) await refreshSessions();
    } catch {
      // Do not fabricate a completed cloud session when the network is unavailable.
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          setRunning(false);
          void completeSession(minutes);
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
        <span className="text-xs opacity-55">{sessions} completed{saving ? " • saving…" : ""}</span>
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
