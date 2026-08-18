import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDatabaseSchema } from "@/lib/database";

export const dynamic = "force-dynamic";

function label(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export async function GET() {
  await ensureDatabaseSchema();

  const student = await prisma.student.findFirst({
    include: { selfRatings: true },
    orderBy: { createdAt: "asc" },
  });

  if (!student) {
    return NextResponse.json({ student: null });
  }

  const [totalTopics, reviewedTopics, mastery, tests] = await Promise.all([
    prisma.topic.count(),
    prisma.topic.count({ where: { needsReview: false } }),
    prisma.topicMastery.findMany({
      where: { studentId: student.id },
      include: {
        topic: {
          include: {
            chapter: {
              include: { book: { include: { subject: true } } },
            },
          },
        },
      },
      orderBy: { lastUpdated: "desc" },
    }),
    prisma.mockTest.findMany({
      where: { studentId: student.id },
      include: { result: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const reviewQueue = await prisma.topic.findMany({
    where: { needsReview: true },
    include: {
      chapter: { include: { book: { include: { subject: true } } } },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "asc" }],
    take: 8,
  });

  const weakTopics = mastery
    .filter((m) => m.questionsSeen >= 2 && m.questionsCorrect / m.questionsSeen < 0.6)
    .sort((a, b) => a.questionsCorrect / a.questionsSeen - b.questionsCorrect / b.questionsSeen)
    .slice(0, 6)
    .map((m) => ({
      id: m.topic.id,
      title: m.topic.title,
      accuracy: Math.round((m.questionsCorrect / m.questionsSeen) * 100),
      subject: label(m.topic.chapter.book.subject.name),
    }));

  const masteredTopics = mastery.filter(
    (m) => m.questionsSeen >= 3 && m.questionsCorrect / m.questionsSeen >= 0.8,
  ).length;

  const testHistory = tests.map((test) => ({
    id: test.id,
    type: label(test.type),
    createdAt: test.createdAt,
    takenAt: test.takenAt,
    score: test.result ? Math.round((test.result.correctCount / Math.max(test.result.totalQuestions, 1)) * 100) : null,
    correct: test.result?.correctCount ?? null,
    total: test.result?.totalQuestions ?? null,
  }));

  const selfRatedWeak = student.selfRatings
    .filter((r) => r.level === "BEGINNER")
    .map((r) => label(r.subject));

  const mission = [
    ...weakTopics.map((t) => ({ id: t.id, title: t.title, meta: `${t.subject} • ${t.accuracy}% accuracy`, reason: "Weak topic" })),
    ...reviewQueue.map((t) => ({ id: t.id, title: t.title, meta: `${label(t.chapter.book.subject.name)} • ${t.chapter.title}`, reason: "Needs review" })),
  ].filter((item, index, items) => items.findIndex((x) => x.id === item.id) === index).slice(0, 5);

  if (mission.length === 0) {
    for (const rating of selfRatedWeak) {
      mission.push({
        id: rating,
        title: `${rating} fundamentals`,
        meta: "Build the foundation",
        reason: "Self-rated beginner",
      });
    }
  }

  return NextResponse.json({
    student: {
      id: student.id,
      name: student.name ?? "Student",
      prepStage: student.prepStage,
      jeeTarget: student.jeeTarget,
      dailyHours: student.preferredDailyHours,
    },
    progress: {
      totalTopics,
      reviewedTopics,
      masteredTopics,
      completion: totalTopics ? Math.round((reviewedTopics / totalTopics) * 100) : 0,
    },
    mission,
    weakTopics,
    reviewQueue: reviewQueue.map((t) => ({
      id: t.id,
      title: t.title,
      subject: label(t.chapter.book.subject.name),
      chapter: t.chapter.title,
    })),
    testHistory,
  });
}
