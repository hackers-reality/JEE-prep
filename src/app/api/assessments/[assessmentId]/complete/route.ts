import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { ensureAssessmentSchema, currentStudentId } from "@/lib/assessment-persistence";
import { buildReviewQueues, type ReviewClassification, type ReviewItem } from "@/lib/assessment-review";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

function classify(isCorrect: number | null, activeSeconds: number, expectedSeconds: number): ReviewClassification {
  if (isCorrect == null) return "UNATTEMPTED";
  const slow = activeSeconds > expectedSeconds * 1.5;
  if (isCorrect === 1) return slow ? "CORRECT_SLOW" : "CORRECT_FAST";
  return slow ? "INCORRECT_SLOW" : "INCORRECT_FAST";
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ assessmentId: string }> }) {
  await ensureAssessmentSchema();
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { assessmentId } = await params;
  const client = db();
  try {
    const owned = await client.execute({
      sql: `SELECT id,title,timeLimitSeconds,startedAt,endedAt,status FROM "AssessmentAttempt" WHERE id = ? AND studentId = ? LIMIT 1`,
      args: [assessmentId, studentId],
    });
    if (!owned.rows.length) return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
    const assessment = owned.rows[0] as Record<string, unknown>;
    if (assessment.status === "COMPLETED") {
      const reviews = await client.execute({ sql: `SELECT questionId,classification,actualSeconds,expectedSeconds,intervention FROM "AssessmentReview" WHERE assessmentId = ? ORDER BY createdAt ASC`, args: [assessmentId] });
      return NextResponse.json({ ok: true, alreadyCompleted: true, assessment, reviews: reviews.rows });
    }

    await client.execute({ sql: `UPDATE "AssessmentAttempt" SET status = 'COMPLETED', endedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND studentId = ?`, args: [assessmentId, studentId] });
    await client.execute({ sql: `DELETE FROM "AssessmentReview" WHERE assessmentId = ?`, args: [assessmentId] });

    const rows = await client.execute({
      sql: `SELECT questionId,topicId,activeSeconds,expectedSeconds,isCorrect,confidence,mistakeType,status FROM "AssessmentQuestionAttempt" WHERE assessmentId = ? ORDER BY createdAt ASC`,
      args: [assessmentId],
    });

    const items: ReviewItem[] = rows.rows.map((row) => {
      const actualSeconds = Number(row.activeSeconds ?? 0);
      const expectedSeconds = Math.max(1, Number(row.expectedSeconds ?? 120));
      return {
        questionId: String(row.questionId),
        topicId: row.topicId ? String(row.topicId) : undefined,
        classification: classify(row.isCorrect == null ? null : Number(row.isCorrect), actualSeconds, expectedSeconds),
        actualSeconds,
        expectedSeconds,
        deltaSeconds: actualSeconds - expectedSeconds,
        confidence: row.confidence == null ? null : Number(row.confidence),
        mistakeType: row.mistakeType == null ? null : String(row.mistakeType),
      };
    });

    const queues = buildReviewQueues(items);
    for (const item of items) {
      const intervention = item.classification === "CORRECT_FAST" ? "REINFORCE" : item.classification === "CORRECT_SLOW" ? "SPEED_PRACTICE" : item.classification === "INCORRECT_FAST" ? "ACCURACY_REBUILD" : item.classification === "INCORRECT_SLOW" ? "CONCEPT_REBUILD_AND_TIMED_PRACTICE" : "ATTEMPT_STRATEGY";
      await client.execute({
        sql: `INSERT INTO "AssessmentReview" (id,assessmentId,questionId,classification,actualSeconds,expectedSeconds,intervention) VALUES (?,?,?,?,?,?,?)`,
        args: [crypto.randomUUID(), assessmentId, item.questionId, item.classification, item.actualSeconds, item.expectedSeconds, intervention],
      });
    }

    const totals = items.reduce((acc, item) => {
      acc.total += 1;
      if (item.classification.startsWith("CORRECT")) acc.correct += 1;
      if (item.classification.startsWith("INCORRECT")) acc.incorrect += 1;
      if (item.classification === "UNATTEMPTED") acc.unattempted += 1;
      acc.timeUsed += item.actualSeconds;
      return acc;
    }, { total: 0, correct: 0, incorrect: 0, unattempted: 0, timeUsed: 0 });

    return NextResponse.json({
      ok: true,
      assessment: { ...assessment, status: "COMPLETED" },
      summary: totals,
      reviews: items,
      queues,
    });
  } finally { client.close(); }
}
