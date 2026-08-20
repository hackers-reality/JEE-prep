"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Problem = {
  id: string; title: string; subject: string; topicId: string | null; exam: string; type: string;
  difficulty: number; statement: string; options: string[]; correctAnswer: string; explanation: string;
  source: string | null; sourceYear: number | null; sourceSession: string | null; expectedSeconds: number;
};

type Recommendation = { problemId: string; reason: string; priority: number };

function normalize(value: string) { return value.trim().replace(/\s+/g, " ").toLowerCase(); }
function answerMatches(answer: string, correct: string, type: string) {
  if (type === "MULTI_SELECT") {
    try { return JSON.stringify(JSON.parse(answer).sort()) === JSON.stringify(JSON.parse(correct).sort()); } catch { return normalize(answer) === normalize(correct); }
  }
  return normalize(answer) === normalize(correct);
}
function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60).toString().padStart(2, "0");
  const s = (safe % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [subject, setSubject] = useState("");
  const [exam, setExam] = useState("");
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [confidence, setConfidence] = useState(3);
  const [mistakeType, setMistakeType] = useState("");
  const startedAt = useMemo(() => Date.now(), [index]);
  const current = problems[index];
  const correct = current ? answerMatches(answer, current.correctAnswer, current.type) : false;
  const expected = current?.expectedSeconds ?? 0;
  const timeRatio = expected > 0 ? elapsed / expected : null;

  useEffect(() => {
    if (submitted || !current) return;
    const id = window.setInterval(() => setElapsed(Math.max(0, Math.round((Date.now() - startedAt) / 1000))), 250);
    return () => window.clearInterval(id);
  }, [current, submitted, startedAt]);

  async function load() {
    setLoading(true); setError(""); setIndex(0); setAnswer(""); setSubmitted(false); setElapsed(0); setConfidence(3); setMistakeType("");
    try {
      const qs = new URLSearchParams({ limit: "20" });
      if (subject) qs.set("subject", subject);
      if (exam) qs.set("exam", exam);
      const [p, r] = await Promise.all([
        fetch(`/api/problems?${qs}`).then((x) => x.json()),
        fetch(`/api/problems/recommended?${subject ? `subject=${subject}` : ""}&limit=10`).then((x) => x.json()),
      ]);
      if (p?.error) throw new Error(p.error);
      setProblems(p.problems ?? []); setRecommendations(r.recommendations ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load problems."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function submit() {
    if (!current || !answer || submitted || saving) return;
    setSaving(true);
    const timeSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
    try {
      const res = await fetch("/api/problems/attempt", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
        problemId: current.id, answer, isCorrect: correct, timeSeconds, confidence,
        mistakeType: mistakeType || null,
      }) });
      if (!res.ok) throw new Error("Could not save this attempt.");
      setElapsed(timeSeconds); setSubmitted(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save attempt."); }
    finally { setSaving(false); }
  }

  function next() { setIndex((i) => Math.min(i + 1, problems.length - 1)); setAnswer(""); setSubmitted(false); setElapsed(0); setConfidence(3); setMistakeType(""); setError(""); }

  return <main className="max-w-6xl mx-auto p-5 sm:p-6">
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
      <div><Link href="/dashboard" className="text-sm hover:underline">← Dashboard</Link><p className="text-xs uppercase tracking-widest opacity-50 mt-4">Problem library</p><h1 className="font-hand text-4xl font-bold">Solve. Submit. Learn.</h1><p className="text-sm opacity-65 mt-1">Every attempt feeds your topic mastery, timing profile and next-question difficulty.</p></div>
      <div className="flex gap-2 flex-wrap"><select value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded border p-2 text-sm" style={{ borderColor: "var(--grid-line)" }}><option value="">All subjects</option><option value="PHYSICS">Physics</option><option value="CHEMISTRY">Chemistry</option><option value="MATHEMATICS">Mathematics</option></select><select value={exam} onChange={(e) => setExam(e.target.value)} className="rounded border p-2 text-sm" style={{ borderColor: "var(--grid-line)" }}><option value="">All exams</option><option value="JEE_MAIN">JEE Main</option><option value="JEE_ADVANCED">JEE Advanced</option><option value="PRACTICE">Practice</option></select><button onClick={() => void load()} className="sticky-button">Refresh set</button></div>
    </div>

    {error && <div className="paper-card p-4 mb-5" style={{ background: "var(--sticky-pink)" }}>{error}</div>}
    {loading ? <div className="paper-card p-10 text-center">Loading your problem set…</div> : !current ? <div className="paper-card p-10 text-center"><h2 className="font-hand text-2xl font-bold">No problems yet.</h2><p className="text-sm opacity-60 mt-2">The solver is ready; the content library still needs problems imported.</p></div> : <div className="grid lg:grid-cols-[1fr_300px] gap-5">
      <section className="paper-card p-5 sm:p-7">
        <div className="flex justify-between gap-3 mb-5"><div><span className="text-xs uppercase tracking-widest opacity-50">Question {index + 1} / {problems.length}</span><h2 className="font-hand text-2xl font-bold mt-1">{current.title}</h2></div><div className="flex gap-2 items-start"><span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: current.difficulty >= 8 ? "var(--sticky-pink)" : current.difficulty >= 6 ? "var(--sticky-yellow)" : "var(--sticky-green)" }}>D{current.difficulty}</span><span className="text-xs font-mono font-bold px-3 py-1 rounded-full" style={{ background: timeRatio !== null && timeRatio > 1.5 ? "var(--sticky-pink)" : "var(--sticky-blue)" }}>{formatDuration(elapsed)} / {formatDuration(expected)}</span></div></div>
        <div className="mb-4 flex gap-2 flex-wrap text-xs"><span className="px-2 py-1 rounded bg-white/60">{current.exam.replace("JEE_", "JEE ")}</span><span className="px-2 py-1 rounded bg-white/60">{current.subject}</span>{timeRatio !== null && <span className="px-2 py-1 rounded bg-white/60">{timeRatio <= 1 ? "On pace" : `${timeRatio.toFixed(1)}× expected time`}</span>}</div>
        <div className="text-base leading-7 whitespace-pre-wrap mb-6">{current.statement}</div>
        {current.type === "MCQ" || current.type === "MULTI_SELECT" ? <div className="space-y-2">{current.options.map((option) => <button key={option} disabled={submitted} onClick={() => setAnswer(option)} className="w-full text-left p-3 rounded-lg border transition" style={{ borderColor: answer === option ? "var(--ink)" : "var(--grid-line)", background: answer === option ? "var(--sticky-blue)" : "white", opacity: submitted && answer !== option ? .65 : 1 }}>{option}</button>)}</div> : <input value={answer} disabled={submitted} onChange={(e) => setAnswer(e.target.value)} placeholder={current.type === "NUMERICAL" ? "Enter numerical answer" : "Enter integer answer"} className="w-full rounded-lg border p-4" style={{ borderColor: "var(--grid-line)" }} />}
        {!submitted && <div className="mt-6 grid sm:grid-cols-2 gap-3"><label className="text-xs font-semibold">Confidence before submission<select value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="mt-1 block w-full rounded border p-2 text-sm"><option value={1}>1 — guessing</option><option value={2}>2 — unsure</option><option value={3}>3 — moderate</option><option value={4}>4 — confident</option><option value={5}>5 — certain</option></select></label><label className="text-xs font-semibold">Mistake type (optional)<select value={mistakeType} onChange={(e) => setMistakeType(e.target.value)} className="mt-1 block w-full rounded border p-2 text-sm"><option value="">None</option><option value="CONCEPT">Concept</option><option value="CALCULATION">Calculation</option><option value="SIGN_UNIT">Sign / unit</option><option value="READING">Misread</option><option value="TIME_PRESSURE">Time pressure</option></select></label></div>}
        <div className="flex items-center justify-between mt-7 gap-3"><span className="text-xs opacity-50">{submitted ? `Recorded in ${formatDuration(elapsed)}` : "Timer is running"}</span>{!submitted ? <button disabled={!answer || saving} onClick={() => void submit()} className="sticky-button blue">{saving ? "Saving…" : "Submit answer"}</button> : <button onClick={next} className="sticky-button green">{index < problems.length - 1 ? "Next question →" : "Finish set"}</button>}</div>
        {submitted && <div className="mt-6 p-5 rounded-lg" style={{ background: correct ? "var(--sticky-green)" : "var(--sticky-pink)" }}><h3 className="font-hand text-2xl font-bold">{correct ? "Correct. 🔥" : "Not this time."}</h3><p className="text-sm mt-1">Correct answer: <b>{current.correctAnswer}</b></p><p className="text-sm mt-2">Time: <b>{formatDuration(elapsed)}</b>{expected > 0 ? <> · Expected <b>{formatDuration(expected)}</b> · <b>{timeRatio!.toFixed(1)}×</b> expected</> : null}</p><p className="text-sm mt-3 whitespace-pre-wrap">{current.explanation}</p>{current.source && <p className="text-xs opacity-60 mt-3">Source: {current.source}{current.sourceYear ? ` • ${current.sourceYear}` : ""}{current.sourceSession ? ` • ${current.sourceSession}` : ""}</p>}</div>}
      </section>
      <aside className="space-y-5"><div className="paper-card p-5"><p className="text-xs uppercase tracking-widest opacity-50">Adaptive queue</p><h2 className="font-hand text-2xl font-bold">Your next targets</h2><div className="mt-3 space-y-2">{recommendations.slice(0, 5).map((r, i) => <div key={r.problemId} className="p-3 rounded-lg" style={{ background: i === 0 ? "var(--sticky-yellow)" : "rgba(255,255,255,.55)" }}><p className="text-sm font-semibold">#{i + 1} {r.reason}</p><p className="text-xs opacity-50 mt-1">Priority {r.priority}</p></div>)}{recommendations.length === 0 && <p className="text-sm opacity-55">Solve a few questions and the queue will learn from you.</p>}</div></div><div className="paper-card p-5"><p className="text-xs uppercase tracking-widest opacity-50">Protocol</p><ul className="text-sm space-y-2 mt-2"><li>• Solve without opening the explanation.</li><li>• Submit even when unsure.</li><li>• Record confidence honestly.</li><li>• Review every mistake.</li><li>• Then move on. No ego rematches.</li></ul></div></aside>
    </div>}
  </main>;
}
