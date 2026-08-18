import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeTestResult } from "@/lib/diagnostic-questions";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const answers = body?.answers && typeof body.answers === "object" ? body.answers : {};

    const test = await prisma.mockTest.findUnique({
      where: { id },
      include: { questions: { include: { topics: true } } },
    });
    if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });
    if (test.takenAt) return NextResponse.json({ error: "Already submitted" }, { status: 400 });
    if (test.questions.length === 0) return NextResponse.json({ error: "Test has no questions" }, { status: 400 });

    let correct = 0;
    let incorrect = 0;
    const submittedAt = new Date();

    await prisma.$transaction(async (tx) => {
      for (const q of test.questions) {
        const raw = answers[q.id];
        const studentAnswer = typeof raw === "string" && raw.trim() ? raw : null;
        const isCorrect = studentAnswer !== null && studentAnswer === q.correctAnswer;
        if (isCorrect) correct++;
        else if (studentAnswer !== null) incorrect++;

        await tx.mockQuestion.update({ where: { id: q.id }, data: { studentAnswer, isCorrect } });

        for (const relation of q.topics) {
          await tx.topicMastery.upsert({
            where: { studentId_topicId: { studentId: test.studentId, topicId: relation.topicId } },
            create: { studentId: test.studentId, topicId: relation.topicId, questionsSeen: 1, questionsCorrect: isCorrect ? 1 : 0 },
            update: { questionsSeen: { increment: 1 }, questionsCorrect: { increment: isCorrect ? 1 : 0 } },
          });
        }
      }
      await tx.mockTest.update({ where: { id }, data: { takenAt: submittedAt } });
    });

    let result = null;
    try {
      result = await computeTestResult(id);
    } catch (analysisError) {
      console.error("mock-test result computation error:", analysisError);
    }

    return NextResponse.json({
      mockTestId: id,
      total: test.questions.length,
      correct,
      incorrect,
      unanswered: test.questions.length - correct - incorrect,
      submittedAt: submittedAt.toISOString(),
      result,
    });
  } catch (err) {
    console.error("mock-test/submit error:", err);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
