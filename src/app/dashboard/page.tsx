import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureDatabaseSchema } from "@/lib/database";
import { getCurrentStudent } from "@/lib/auth";
import FocusTimer from "@/components/FocusTimer";
import { StudyOverview } from "@/components/StudyOverview";

export const dynamic = "force-dynamic";
const subjectLabel = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

export default async function DashboardPage() {
  await ensureDatabaseSchema();
  const student = await getCurrentStudent();
  if (!student) redirect("/login");

  const [totalTopics, reviewedTopics, mastery, tests, reviewQueue, studySessions] = await Promise.all([
    prisma.topic.count(),
    prisma.topic.count({ where: { needsReview: false } }),
    prisma.topicMastery.findMany({ where: { studentId: student.id }, include: { topic: { include: { chapter: { include: { book: { include: { subject: true } } } } } } }, orderBy: { lastUpdated: "desc" } }),
    prisma.mockTest.findMany({ where: { studentId: student.id }, include: { result: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.topic.findMany({ where: { needsReview: true }, include: { chapter: { include: { book: { include: { subject: true } } } } }, orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.studySession.findMany({ where: { studentId: student.id }, orderBy: { startedAt: "desc" }, take: 100 }),
  ]);

  const weak = mastery.filter((m) => m.questionsSeen >= 2 && m.questionsCorrect / m.questionsSeen < 0.6).sort((a, b) => a.questionsCorrect / a.questionsSeen - b.questionsCorrect / b.questionsSeen).slice(0, 4);
  const mastered = mastery.filter((m) => m.questionsSeen >= 3 && m.questionsCorrect / m.questionsSeen >= 0.8).length;
  const completion = totalTopics ? Math.round((reviewedTopics / totalTopics) * 100) : 0;
  const displayName = student.name?.split(" ")[0] || "Student";
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
  const weekMinutes = studySessions.filter((session) => session.startedAt >= weekStart).reduce((sum, session) => sum + session.durationMinutes, 0);
  const studiedDays = new Set(studySessions.map((session) => session.startedAt.toISOString().slice(0, 10)));
  let streak = 0; const streakCursor = new Date();
  while (studiedDays.has(streakCursor.toISOString().slice(0, 10))) { streak += 1; streakCursor.setDate(streakCursor.getDate() - 1); }

  const topicHref = (subjectId: string, bookId: string, chapterId: string) => `/subjects/${subjectId}/books/${bookId}/chapters/${chapterId}`;
  const missionItems = [
    ...weak.map((m) => ({ id: m.topic.id, title: m.topic.title, href: topicHref(m.topic.chapter.book.subjectId, m.topic.chapter.bookId, m.topic.chapterId), meta: `${subjectLabel(m.topic.chapter.book.subject.name)} • ${Math.round((m.questionsCorrect / m.questionsSeen) * 100)}% accuracy`, reason: "Weak topic" })),
    ...reviewQueue.map((t) => ({ id: t.id, title: t.title, href: topicHref(t.chapter.book.subjectId, t.chapter.bookId, t.chapterId), meta: `${subjectLabel(t.chapter.book.subject.name)} • ${t.chapter.title}`, reason: "Needs review" })),
  ].filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i).slice(0, 5);

  return (
    <main className="max-w-6xl mx-auto p-5 sm:p-6 space-y-6">
      <section className="paper-card p-6"><div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5"><div><p className="text-sm opacity-60">JEE 2028 • personal command center</p><h1 className="font-hand text-4xl sm:text-5xl font-bold mt-1">Lock in, {displayName}. <span className="emoji" aria-hidden="true">🫡</span></h1><p className="mt-2 opacity-70">One focused session at a time. No productivity cosplay.</p></div><div className="flex flex-wrap gap-3"><Link href="/subjects" className="sticky-button">Study subjects</Link><Link href="/problems" className="sticky-button blue">Practice</Link><Link href="/chat" className="sticky-button green">Ask AI</Link><form action="/api/auth/logout" method="post"><button className="sticky-button">Sign out</button></form></div></div></section>
      <StudyOverview />
      <section className="grid grid-cols-2 lg:grid-cols-6 gap-4"><Stat title="Topics reviewed" value={`${reviewedTopics}/${totalTopics}`} sub={`${completion}% content progress`} /><Stat title="Mastered" value={String(mastered)} sub="80%+ question accuracy" /><Stat title="Tests taken" value={String(tests.length)} sub="Assessment engine under rebuild" /><Stat title="Daily target" value={student.preferredDailyHours ? `${student.preferredDailyHours}h` : "—"} sub={student.jeeTarget === "MAIN_AND_ADVANCED" ? "Main + Advanced" : student.jeeTarget === "MAIN_ONLY" ? "JEE Main" : "JEE 2028"} /><Stat title="7-day study" value={`${Math.floor(weekMinutes / 60)}h ${weekMinutes % 60}m`} sub="Recorded focus time" /><Stat title="Streak" value={`${streak}d`} sub="Consecutive study days" /></section>
      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-5"><div className="paper-card p-6"><div className="flex items-center justify-between mb-5"><div><p className="text-xs uppercase tracking-widest opacity-50">Today&apos;s mission</p><h2 className="font-hand text-2xl font-bold">Do these before wandering off</h2></div><span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--sticky-yellow)" }}>Priority</span></div><div className="space-y-3">{missionItems.map((item) => <Link key={item.id} href={item.href} className="block p-4 rounded-lg border transition hover:-translate-y-0.5" style={{ borderColor: "var(--grid-line)", background: "rgba(255,255,255,.45)" }}><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">{item.title}</p><p className="text-xs opacity-60 mt-1">{item.meta}</p></div><span className="text-xs font-bold opacity-60">{item.reason} →</span></div></Link>)}{missionItems.length === 0 && <p className="opacity-60">Nothing urgent. Pick a chapter and keep the streak going.</p>}</div></div><div className="paper-card p-6"><p className="text-xs uppercase tracking-widest opacity-50">Revision queue</p><h2 className="font-hand text-2xl font-bold mb-4">Spaced repetition, but useful</h2><div className="space-y-2">{reviewQueue.map((topic) => <Link key={topic.id} href={topicHref(topic.chapter.book.subjectId, topic.chapter.bookId, topic.chapterId)} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-white/40"><span className="text-sm font-medium">{topic.title}</span><span className="text-[11px] opacity-50">{subjectLabel(topic.chapter.book.subject.name)}</span></Link>)}{reviewQueue.length === 0 && <p className="text-sm opacity-60">Revision queue is clear. Suspiciously productive. 😭</p>}</div></div></section>
      <section className="grid lg:grid-cols-[1fr_1.15fr] gap-5"><FocusTimer /><div className="paper-card p-6"><p className="text-xs uppercase tracking-widest opacity-50">Study protocol</p><h2 className="font-hand text-2xl font-bold mb-3">Use the app like this</h2><ol className="space-y-3 text-sm"><li><b>01.</b> Pick one mission topic.</li><li><b>02.</b> Read theory + formulas, then hide the solution and solve.</li><li><b>03.</b> Mark the topic reviewed only when you can reproduce the method.</li><li><b>04.</b> Practice problems and let the weakness engine decide what comes next.</li></ol><p className="text-xs opacity-55 mt-5">Focus sessions sync to the cloud, so your study history survives across devices.</p></div></section>
      <section className="grid lg:grid-cols-2 gap-5"><div className="paper-card p-6"><div className="flex justify-between items-center mb-4"><div><p className="text-xs uppercase tracking-widest opacity-50">Weakness radar</p><h2 className="font-hand text-2xl font-bold">Where marks are leaking</h2></div><Link href="/subjects" className="text-xs underline">Explore</Link></div>{weak.length ? weak.map((m) => { const accuracy = Math.round((m.questionsCorrect / m.questionsSeen) * 100); return <div key={m.topic.id} className="mb-4"><div className="flex justify-between text-sm mb-1"><span>{m.topic.title}</span><b>{accuracy}%</b></div><div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,.1)" }}><div className="h-full" style={{ width: `${accuracy}%`, background: "var(--sticky-pink)" }} /></div></div>; }) : <p className="opacity-60 text-sm">Practice problems and this section will start learning your weak areas.</p>}</div><div className="paper-card p-6"><div className="flex justify-between items-center mb-4"><div><p className="text-xs uppercase tracking-widest opacity-50">Assessment history</p><h2 className="font-hand text-2xl font-bold">Legacy tests</h2></div></div><div className="space-y-2">{tests.map((test) => { const score = test.result ? Math.round((test.result.correctCount / Math.max(test.result.totalQuestions, 1)) * 100) : null; return <div key={test.id} className="flex justify-between items-center p-3 rounded-lg"><span className="text-sm font-medium">{subjectLabel(test.type)} test</span><span className="font-bold">{score === null ? "Incomplete" : `${score}%`}</span></div>; })}{tests.length === 0 && <p className="text-sm opacity-60">The new assessment engine is being rebuilt before this becomes a real JEE testing system.</p>}</div></div></section>
    </main>
  );
}

function Stat({ title, value, sub }: { title: string; value: string; sub: string }) { return <div className="paper-card p-4"><p className="text-xs uppercase tracking-widest opacity-50">{title}</p><p className="font-hand text-3xl font-bold mt-1">{value}</p><p className="text-xs opacity-55 mt-1">{sub}</p></div>; }
