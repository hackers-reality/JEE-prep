import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { getCurrentStudent } from "@/lib/auth";
import { ensureAssessmentSchema } from "@/lib/assessment-persistence";
import { aggregateWeaknessEvents } from "@/lib/weakness-aggregation";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function GET() {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  await ensureAssessmentSchema();
  const client = db();
  try {
    const rows = await client.execute({
      sql: `SELECT q.topicId, q.expectedSeconds, q.activeSeconds, q.isCorrect, q.confidence, q.mistakeType, q.submittedAt, t.title AS topicTitle, s.name AS subjectName FROM "AssessmentQuestionAttempt" q LEFT JOIN "Topic" t ON t.id = q.topicId LEFT JOIN "Chapter" c ON c.id = t.chapterId LEFT JOIN "Book" b ON b.id = c.bookId LEFT JOIN "Subject" s ON s.id = b.subjectId JOIN "AssessmentAttempt" a ON a.id = q.assessmentId WHERE a.studentId = ? AND a.status = 'COMPLETED' AND q.status = 'SUBMITTED' ORDER BY q.submittedAt DESC LIMIT 2000`,
      args: [student.id],
    });
    const events = rows.rows.filter((row) => typeof row.topicId === "string").map((row) => ({
      topicId: String(row.topicId),
      subject: row.subjectName == null ? null : String(row.subjectName),
      accuracy: Number(row.isCorrect) === 1 ? 1 : 0,
      actualSeconds: Number(row.activeSeconds ?? 0),
      expectedSeconds: Number(row.expectedSeconds ?? 120),
      confidence: row.confidence == null ? null : Number(row.confidence),
      repeatedMistake: Boolean(row.mistakeType && String(row.mistakeType) !== "NONE"),
      occurredAt: row.submittedAt == null ? undefined : String(row.submittedAt),
    }));
    const weaknesses = aggregateWeaknessEvents(events).map((item) => ({ ...item, topicTitle: events.find((event) => event.topicId === item.topicId)?.topicId ?? item.topicId }));
    return NextResponse.json({ weaknesses, sampleSize: events.length });
  } finally { client.close(); }
}
