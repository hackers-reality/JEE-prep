import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { answers } = await req.json();
    // answers: { [questionId]: selectedOption }

    const test = await prisma.mockTest.findUnique({
      where: { id },
      include: { questions: true },
    });
    if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });
    if (test.takenAt) return NextResponse.json({ error: "Already submitted" }, { status: 400 });

    let correct = 0;
    for (const q of test.questions) {
      const studentAnswer = answers[q.id] ?? null;
      const isCorrect = studentAnswer === q.correctAnswer;
      if (isCorrect) correct++;

      await prisma.mockQuestion.update({
        where: { id: q.id },
        data: { studentAnswer, isCorrect },
      });
    }

    return NextResponse.json({
      mockTestId: id,
      total: test.questions.length,
      correct,
    });
  } catch (err) {
    console.error("mock-test/submit error:", err);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
