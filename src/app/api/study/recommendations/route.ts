import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { getCurrentStudent } from "@/lib/auth";

function db() { const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db"; const authToken = process.env.TURSO_AUTH_TOKEN; return createClient({ url, ...(authToken ? { authToken } : {}) }); }

export async function GET() {
  const student = await getCurrentStudent(); if (!student) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const client = db();
  try {
    const rows = await client.execute({ sql: `SELECT tm.topicId, tm.questionsSeen, tm.questionsCorrect, tm.lastUpdated, t.title AS topicTitle, c.title AS chapterTitle, b.title AS bookTitle, s.name AS subject FROM "TopicMastery" tm JOIN "Topic" t ON t.id = tm.topicId JOIN "Chapter" c ON c.id = t.chapterId JOIN "Book" b ON b.id = c.bookId JOIN "Subject" s ON s.id = b.subjectId WHERE tm.studentId = ? ORDER BY tm.questionsSeen < 3 DESC, (CAST(tm.questionsCorrect AS REAL) / CASE WHEN tm.questionsSeen = 0 THEN 1 ELSE tm.questionsSeen END) ASC, tm.lastUpdated ASC LIMIT 20`, args: [student.id] });
    const recommendations = rows.rows.map((row) => {
      const seen = Number(row.questionsSeen ?? 0); const correct = Number(row.questionsCorrect ?? 0); const accuracy = seen ? correct / seen : 0;
      const reason = seen < 3 ? "Needs more evidence" : accuracy < 0.6 ? "Weak accuracy" : accuracy < 0.8 ? "Needs consolidation" : "Good candidate for spaced revision";
      const priority = seen < 3 ? 1 : accuracy < 0.6 ? 0 : accuracy < 0.8 ? 2 : 3;
      return { topicId: String(row.topicId), topicTitle: String(row.topicTitle), chapterTitle: String(row.chapterTitle), bookTitle: String(row.bookTitle), subject: String(row.subject), accuracy: Math.round(accuracy * 100), questionsSeen: seen, reason, priority };
    }).sort((a,b) => a.priority - b.priority).slice(0, 8);
    return NextResponse.json({ recommendations });
  } finally { client.close(); }
}
