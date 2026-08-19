"use client";

import { useEffect, useState } from "react";

type Overview = { tasks: Array<{ id: string; title: string; dueAt?: string | null; status: string; priority: number }>; sessions: Array<{ id: string; subjectId?: string | null; topicId?: string | null; startedAt: string; minutes: number }>; totals: { sessionCount?: number; totalMinutes?: number } };

export function StudyOverview() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/study/overview", { cache: "no-store" }).then(async (r) => r.ok ? setData(await r.json()) : null).finally(() => setLoading(false)); }, []);
  if (loading) return <section className="paper-card p-5"><p className="text-sm opacity-60">Loading your study overview…</p></section>;
  if (!data) return <section className="paper-card p-5"><p className="text-sm opacity-60">Sign in to see your study overview.</p></section>;
  const minutes = Number(data.totals?.totalMinutes ?? 0);
  return <section className="grid lg:grid-cols-[1.2fr_.8fr] gap-4">
    <div className="paper-card p-5"><div className="flex items-center justify-between mb-4"><div><p className="text-xs uppercase tracking-widest opacity-50">Study plan</p><h2 className="font-hand text-2xl font-bold">Your tasks</h2></div><div className="text-right"><div className="font-bold">{Math.floor(minutes / 60)}h {minutes % 60}m</div><div className="text-xs opacity-50">tracked study time</div></div></div>{data.tasks.length === 0 ? <p className="text-sm opacity-60">No tasks yet. Start with one focused JEE target.</p> : <div className="space-y-2">{data.tasks.map((task) => <div key={task.id} className="rounded-lg border px-3 py-2 flex items-center justify-between" style={{ borderColor: "var(--grid-line)" }}><div><div className="text-sm font-semibold">{task.title}</div>{task.dueAt && <div className="text-xs opacity-50">Due {new Date(task.dueAt).toLocaleString()}</div>}</div><span className="text-[11px] uppercase opacity-50">{task.status}</span></div>)}</div>}</div>
    <div className="paper-card p-5"><p className="text-xs uppercase tracking-widest opacity-50">Recent sessions</p><h2 className="font-hand text-2xl font-bold mb-4">Study log</h2>{data.sessions.length === 0 ? <p className="text-sm opacity-60">No sessions recorded yet.</p> : <div className="space-y-2">{data.sessions.slice(0,6).map((session) => <div key={session.id} className="flex justify-between text-sm"><span>{new Date(session.startedAt).toLocaleDateString()}</span><span className="font-semibold">{session.minutes} min</span></div>)}</div>}</div>
  </section>;
}
