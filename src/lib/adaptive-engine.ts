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
    const attempts = await client.execute({ sql: `SELECT "problemId", "isCorrect", "timeSeconds" FROM "ProblemAttempt" WHERE "studentId" = ? ORDER BY "createdAt" DESC LIMIT 40`, args: [studentId] });
    const rows = attempts.rows;
    const accuracy = rows.length ? rows.filter((r) => Number(r.isCorrect) === 1).length / rows.length : 0.5;
    const avgSeconds = rows.length ? rows.reduce((s, r) => s + Number(r.timeSeconds ?? 0), 0) / rows.length : 120;
    const target = chooseDifficulty(accuracy, accuracy, avgSeconds, 120);
    const excluded = rows.map((r) => String(r.problemId));
    const params: (string | number)[] = [Math.max(1, target - 1), Math.min(10, target + 1)];
    let where = '"difficulty" BETWEEN ? AND ?';
    if (subject) { where += ' AND "subject" = ?'; params.push(subject); }
    if (excluded.length) { where += ` AND "id" NOT IN (${excluded.map(() => '?').join(',')})`; params.push(...excluded); }
    const result = await client.execute({ sql: `SELECT "id", "difficulty" FROM "Problem" WHERE ${where} ORDER BY ABS("difficulty" - ?) ASC, RANDOM() LIMIT ${Math.min(20, Math.max(1, limit))}`, args: [...params, target] });
    return result.rows.map((r, i) => ({ problemId: String(r.id), reason: accuracy < 0.6 ? "Strengthen your fundamentals" : "Push your level", priority: Math.max(1, 100 - i * 5) }));
  } finally { client.close(); }
}
