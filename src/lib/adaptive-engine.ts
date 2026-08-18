import { createClient } from "@libsql/client";
import { chooseDifficulty } from "@/lib/problem-engine";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export type Recommendation = { problemId: string; reason: string; priority: number };

export async function recommendProblems(studentId: string, subject?: string, limit = 10): Promise<Recommendation[]> {
  const client = db();
  try {
    const attempts = await client.execute({
      sql: `SELECT "problemId", "isCorrect", "timeSeconds" FROM "ProblemAttempt" WHERE "studentId" = ? ORDER BY "createdAt" DESC LIMIT 40`,
      args: [studentId],
    });

    const rows = attempts.rows;
    const accuracy = rows.length ? rows.filter((r) => Number(r.isCorrect) === 1).length / rows.length : 0.5;
    const avgSeconds = rows.length
      ? rows.reduce((sum, row) => sum + Number(row.timeSeconds ?? 0), 0) / rows.length
      : 120;
    const target = chooseDifficulty(accuracy, accuracy, avgSeconds, 120);

    // Don't keep serving the same questions merely because they are outside
    // the latest 40 attempts. A recommendation should be genuinely fresh.
    const excluded = rows.map((row) => String(row.problemId));
    const params: (string | number)[] = [Math.max(1, target - 1), Math.min(10, target + 1)];
    let where = '"difficulty" BETWEEN ? AND ?';

    if (subject) {
      where += ' AND "subject" = ?';
      params.push(subject);
    }

    if (excluded.length) {
      where += ` AND "id" NOT IN (${excluded.map(() => '?').join(',')})`;
      params.push(...excluded);
    }

    const requestedLimit = Math.min(20, Math.max(1, limit));
    const result = await client.execute({
      sql: `SELECT "id", "difficulty" FROM "Problem" WHERE ${where} ORDER BY ABS("difficulty" - ?) ASC, RANDOM() LIMIT ${requestedLimit}`,
      args: [...params, target],
    });

    const reason = accuracy < 0.6
      ? "Strengthen your fundamentals"
      : accuracy >= 0.8
        ? "Push your level"
        : "Build consistency";

    return result.rows.map((row, index) => ({
      problemId: String(row.id),
      reason,
      priority: Math.max(1, 100 - index * 5),
    }));
  } finally {
    client.close();
  }
}
