import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureDatabaseSchema } from "@/lib/database";

export const dynamic = "force-dynamic";

const subjectLabel = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

export default async function DashboardPage() {
  await ensureDatabaseSchema();

  const student = await prisma.student.findFirst({
    include: { selfRatings: true },
    orderBy: { createdAt: "asc" },
  });

  if (!student) {
    return (
      <main className="max-w-5xl mx-auto p-6 min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-hand text-4xl font-bold mb-3">Your JEE command center</h1>
          <p className="opacity-70 mb-6">Finish onboarding first and we&apos;ll build your study plan.</p>
          <Link href="/onboarding" className="sticky-button">Start setup</Link>
        </div>
      </main>
    );
  }

  const [totalTopics, reviewedTopics, mastery, tests, reviewQueue] = await Promise.all([
    prisma.topic.count(),
    prisma.topic.count({ where: { needsReview: false } }),
    prisma.topicMastery.findMany({
      where: { studentId: student.id },
      include: { topic: { include: { chapter: { include: { book: { include: { subject: true } } } } } } },
      orderBy: { lastUpdated: "desc" },
    }),
    prisma.mockTest.findMany({ where: { studentId: student.id }, include: { result: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.topic.findMany({
      where: { needsReview: true },
      include: { chapter: { include: { book: { include: { subject: true } } } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const weak = mastery
    .filter((m) => m.questionsSeen >= 2 && m.questionsCorrect / m.questionsSeen < 0.6)
    .sort((a, b) => a.questionsCorrect / a.questionsSeen - b.questionsCorrect / b.questionsSeen)
    .slice(0, 4);

  const mastered = mastery.filter((m) => m.questionsSeen >= 3 && m.questionsCorrect / m.questionsSeen >= 0.8).length;
  const completion = totalTopics ? Math.round((reviewedTopics / totalTopics) * 100) : 0;
  const displayName = student.name?.split(" ")[0] || "Arnav";

  return (
    <main className="max-w-6xl mx-auto p-5 sm:p-6 space-y-6">
      <section className="paper-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <p className="text-sm opacity-60">JEE 2028 • personal command center</p>
            <h1 className="font-hand text-4xl sm:text-5xl font-bold mt-1">Lock in, {displayName}. 🫡</h1>
            <p className="mt-2 opacity-70">One focused session at a time. No productivity cosplay.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/subjects" className="sticky-button">Study subjects</Link>
            <Link href="/mock-test/regular" className="sticky-button blue">Take a test</Link>
            <Link href="/chat" className="sticky-button green">Ask AI</Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="Topics reviewed" value={`${reviewedTopics}/${totalTopics}`} sub={`${completion}% content progress`} />
        <Stat title="Mastered" value={String(mastered)} sub="80%+ question accuracy" />
        <Stat title="Tests taken" value={String(tests.length)} sub="Keep the feedback loop alive" />
        <Stat title="Daily target" value={student.preferredDailyHours ? `${student.preferredDailyHours}h` : "Set it"} sub={student.jeeTarget === "MAIN_AND_ADVANCED" ? "Main + Advanced" : "JEE Main"} />
      </section>

      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="paper-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-50">Today&apos;s mission</p>
              <h2 className="font-hand text-2xl font-bold">Do these before wandering off</h2>
            </div>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--sticky-yellow)" }}>Priority</span>
          </div>
          <div className="space-y-3">
            {[
              ...weak.map((m) => ({ id: m.topic.id, title: m.topic.title, meta: `${subjectLabel(m.topic.chapter.book.subject.name)} • ${Math.round((m.questionsCorrect / m.questionsSeen) * 100)}% accuracy`, reason: "Weak topic" })),
              ...reviewQueue.map((t) => ({ id: t.id, title: t.title, meta: `${subjectLabel(t.chapter.book.subject.name)} • ${t.chapter.title}`, reason: "Needs review" })),
            ].filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i).slice(0, 5).map((item) => (
              <Link key={item.id} href={`/topics/${item.id}`} className="block p-4 rounded-lg border transition hover:-translate-y-0.5" style={{ borderColor: "var(--grid-line)", background: "rgba(255,255,255,.45)" }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs opacity-60 mt-1">{item.meta}</p>
                  </div>
                  <span className="text-xs font-bold opacity-60">{item.reason} →</span>
                </div>
              </Link>
            ))}
            {weak.length === 0 && reviewQueue.length === 0 && <p className="opacity-60">Nothing urgent. Pick a chapter and keep the streak going.</p>}
          </div>
        </div>

        <div className="paper-card p-6">
          <p className="text-xs uppercase tracking-widest opacity-50">Revision queue</p>
          <h2 className="font-hand text-2xl font-bold mb-4">Spaced repetition, but useful</h2>
          <div className="space-y-2">
            {reviewQueue.map((topic) => (
              <Link key={topic.id} href={`/topics/${topic.id}`} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-white/40">
                <span className="text-sm font-medium">{topic.title}</span>
                <span className="text-[11px] opacity-50">{subjectLabel(topic.chapter.book.subject.name)}</span>
              </Link>
            ))}
            {reviewQueue.length === 0 && <p className="text-sm opacity-60">Revision queue is clear. Suspiciously productive. 😭</p>}
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="paper-card p-6">
          <div className="flex justify-between items-center mb-4">
            <div><p className="text-xs uppercase tracking-widest opacity-50">Weakness radar</p><h2 className="font-hand text-2xl font-bold">Where marks are leaking</h2></div>
            <Link href="/subjects" className="text-xs underline">Explore</Link>
          </div>
          {weak.length ? weak.map((m) => {
            const accuracy = Math.round((m.questionsCorrect / m.questionsSeen) * 100);
            return <div key={m.topic.id} className="mb-4"><div className="flex justify-between text-sm mb-1"><span>{m.topic.title}</span><b>{accuracy}%</b></div><div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,.1)" }}><div className="h-full" style={{ width: `${accuracy}%`, background: "var(--sticky-pink)" }} /></div></div>;
          }) : <p className="opacity-60 text-sm">Do a few tests and this section will start learning your weak areas.</p>}
        </div>

        <div className="paper-card p-6">
          <div className="flex justify-between items-center mb-4"><div><p className="text-xs uppercase tracking-widest opacity-50">Test history</p><h2 className="font-hand text-2xl font-bold">Recent performance</h2></div><Link href="/mock-test/regular" className="text-xs underline">New test</Link></div>
          <div className="space-y-2">
            {tests.map((test) => {
              const score = test.result ? Math.round((test.result.correctCount / Math.max(test.result.totalQuestions, 1)) * 100) : null;
              return <Link key={test.id} href={`/mock-test/results/${test.id}`} className="flex justify-between items-center p-3 rounded-lg hover:bg-white/40"><span className="text-sm font-medium">{subjectLabel(test.type)} test</span><span className="font-bold">{score === null ? "Incomplete" : `${score}%`}</span></Link>;
            })}
            {tests.length === 0 && <p className="text-sm opacity-60">No tests yet. Take the diagnostic when you&apos;re ready.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ title, value, sub }: { title: string; value: string; sub: string }) {
  return <div className="paper-card p-4"><p className="text-xs uppercase tracking-widest opacity-50">{title}</p><p className="font-hand text-3xl font-bold mt-1">{value}</p><p className="text-xs opacity-55 mt-1">{sub}</p></div>;
}
