"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Task = { id: string; title: string; description: string | null; dueDate: string | null; priority: string; category: string; completedAt: string | null };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [loading, setLoading] = useState(true);

  async function load() {
    const response = await fetch("/api/tasks");
    if (response.ok) setTasks(await response.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addTask(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    await fetch("/api/tasks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, dueDate: dueDate || null, priority }) });
    setTitle("");
    setDueDate("");
    await load();
  }

  async function toggle(task: Task) {
    await fetch("/api/tasks", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: task.id, completed: !task.completedAt }) });
    await load();
  }

  const open = tasks.filter((task) => !task.completedAt);
  const done = tasks.filter((task) => task.completedAt);

  return <main className="max-w-4xl mx-auto p-5 sm:p-6 space-y-6">
    <div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-widest opacity-50">Personal execution board</p><h1 className="font-hand text-5xl font-bold">Tasks & schedule</h1><p className="opacity-65 mt-1">Turn the plan into things you actually finish.</p></div><Link href="/dashboard" className="sticky-button">← Dashboard</Link></div>
    <section className="paper-card p-5"><form onSubmit={addTask} className="grid sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-end"><label className="block"><span className="text-xs font-bold opacity-60">Task</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Finish 20 kinematics questions" className="mt-1 w-full rounded-xl border p-3 bg-white/70" /></label><label className="block"><span className="text-xs font-bold opacity-60">Due</span><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 rounded-xl border p-3 bg-white/70" /></label><label className="block"><span className="text-xs font-bold opacity-60">Priority</span><select value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-1 rounded-xl border p-3 bg-white/70"><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label><button className="sticky-button">Add task</button></form></section>
    <section className="grid gap-3">{loading ? <div className="paper-card p-6 opacity-60">Loading your board…</div> : open.length === 0 ? <div className="paper-card p-6"><b>Nothing pending.</b> Now go solve something before creating more tasks. 😭</div> : open.map((task) => <TaskRow key={task.id} task={task} onToggle={() => toggle(task)} />)}</section>
    {done.length > 0 && <section><p className="text-xs uppercase tracking-widest opacity-50 mb-2">Completed</p><div className="grid gap-2 opacity-65">{done.map((task) => <TaskRow key={task.id} task={task} onToggle={() => toggle(task)} />)}</div></section>}
  </main>;
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return <div className="paper-card p-4 flex items-center gap-3"><button onClick={onToggle} className="w-6 h-6 rounded-full border-2 shrink-0" style={{ background: task.completedAt ? "var(--sticky-green)" : "transparent" }} aria-label={task.completedAt ? "Reopen task" : "Complete task"}>{task.completedAt ? "✓" : ""}</button><div className="min-w-0 flex-1"><p className={`font-semibold ${task.completedAt ? "line-through" : ""}`}>{task.title}</p><div className="text-xs opacity-55 mt-1 flex gap-3"><span>{task.priority}</span>{task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}</div></div></div>;
}
