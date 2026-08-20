import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { getCurrentStudent } from "@/lib/auth";
import { masteryState, scoreMastery } from "@/lib/mastery-engine";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function GET() {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const client = db();
  try {
    const rows = await client.execute({
      sql: `
        SELECT
          tm.topicId,
          tm.questionsSeen,
          tm.questionsCorrect,
          tm.lastUpdated,
          t.title AS topicTitle,
          c.title AS chapterTitle,
          b.title AS bookTitle,
          s.name AS subject,
          AVG(pa.timeSeconds) AS avgSeconds,
          AVG(CASE WHEN pa.confidence IS NOT NULL THEN pa.confidence END) AS avgConfidence,
          SUM(CASE WHEN pa.mistakeType IS NOT NULL THEN 1 ELSE 0 END) AS mistakeCount,
          AVG(CASE WHEN pa.isCorrect IS NOT NULL AND pa.createdAt >= datetime('now','-14 days') THEN CAST(pa.isCorrect AS REAL) END) AS recentAccuracy,
          MAX(p.expectedSeconds) AS expectedSeconds
        FROM "TopicMastery" tm
        JOIN "Topic" t ON t.id = tm.topicId
        JOIN "Chapter" c ON c.id = t.chapterId
        JOIN "Book" b ON b.id = c.bookId
        JOIN "Subject" s ON s.id = b.subjectId
        LEFT JOIN "Problem" p ON p.topicId = tm.topicId
        LEFT JOIN "ProblemAttempt" pa ON pa.problemId = p.id AND pa.studentId = tm.studentId
        WHERE tm.studentId = ?
        GROUP BY tm.topicId, tm.questionsSeen, tm.questionsCorrect, tm.lastUpdated, t.title, c.title, b.title, s.name
        LIMIT 40
      `,
      args: [student.id],
    });

    const now = Date.now();
    const recommendations = rows.rows.map((row) => {
      const seen = Number(row.questionsSeen ?? 0);
      const correct = Number(row.questionsCorrect ?? 0);
      const accuracy = seen > 0 ? correct / seen : 0;
      const avgSeconds = row.avgSeconds == null ? null : Number(row.avgSeconds);
      const expectedSeconds = row.expectedSeconds == null ? null : Number(row.expectedSeconds);
      const confidence = row.avgConfidence == null ? null : Number(row.avgConfidence);
      const mistakes = Number(row.mistakeCount ?? 0);
      const updatedAt = row.lastUpdated ? new Date(String(row.lastUpdated)).getTime() : 0;
      const freshnessDays = updatedAt > 0 ? Math.max(0, (now - updatedAt) / 86_400_000) : null;
      const recentAccuracy = row.recentAccuracy == null ? accuracy : Number(row.recentAccuracy);

      const mastery = scoreMastery({
        accuracy,
        recentAccuracy,
        avgSeconds,
        expectedSeconds,
        confidence,
        repeatedMistakes: mistakes,
        attempts: seen,
        lastSeenDays: freshnessDays,
      });
      const state = masteryState(mastery);
      const timeRatio = avgSeconds != null && expectedSeconds && expectedSeconds > 0 ? avgSeconds / expectedSeconds : null;
      const speedRisk = timeRatio == null ? 0.2 : Math.max(0, Math.min(1, (timeRatio - 1) / 1.5));
      const mistakeRisk = Math.max(0, Math.min(1, mistakes / Math.max(1, seen)));
      const freshnessRisk = freshnessDays == null ? 0.25 : Math.max(0, Math.min(1, freshnessDays / 30));
      const confidenceRisk = confidence == null ? 0.25 : Math.max(0, Math.min(1, 1 - confidence / 5));
      const risk = Math.max(0, Math.min(1,
        (1 - mastery) * 0.45 + speedRisk * 0.18 + mistakeRisk * 0.17 + freshnessRisk * 0.12 + confidenceRisk * 0.08,
      ));

      let reason = "Good candidate for spaced revision";
      let action = "REVISE";
      if (state === "UNSEEN") { reason = "Insufficient evidence — build baseline"; action = "PRACTICE"; }
      else if (state === "WEAK" && speedRisk > 0.45) { reason = "Weak mastery and over time"; action = "REPAIR"; }
      else if (state === "WEAK") { reason = "Mastery gap"; action = "TARGETED_PRACTICE"; }
      else if (state === "DEVELOPING" && speedRisk > 0.45) { reason = "Good accuracy, but too slow"; action = "TIMED_PRACTICE"; }
      else if (mistakeRisk > 0.4) { reason = "Repeated error pattern"; action = "ERROR_REVIEW"; }
      else if (state === "DEVELOPING" || freshnessRisk > 0.5) { reason = "Needs reinforcement before exam pressure"; action = "REFRESH"; }

      return {
        topicId: String(row.topicId), topicTitle: String(row.topicTitle), chapterTitle: String(row.chapterTitle),
        bookTitle: String(row.bookTitle), subject: String(row.subject), accuracy: Math.round(accuracy * 100),
        recentAccuracy: Math.round(recentAccuracy * 100), questionsSeen: seen, avgSeconds, expectedSeconds, timeRatio,
        confidence: confidence == null ? null : Math.round(confidence * 10) / 10, mistakeCount: mistakes,
        freshnessDays: freshnessDays == null ? null : Math.round(freshnessDays), mastery: Math.round(mastery * 100),
        state, risk: Math.round(risk * 100), reason, action,
      };
    }).sort((a, b) => b.risk - a.risk || a.questionsSeen - b.questionsSeen).slice(0, 8);

    return NextResponse.json({ recommendations });
  } finally { client.close(); }
}
