import { createClient } from "@libsql/client";
import { ensureDatabaseSchema } from "@/lib/database";

export type ProblemType = "MCQ" | "NUMERICAL" | "INTEGER" | "MULTI_SELECT";
export type Exam = "JEE_MAIN" | "JEE_ADVANCED" | "PRACTICE";

export type Problem = {
  id: string;
  title: string;
  subject: string;
  topicId: string | null;
  exam: Exam;
  type: ProblemType;
  difficulty: number;
  statement: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  source: string | null;
  sourceYear: number | null;
  sourceSession: string | null;
  expectedSeconds: number;
};

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function ensureProblemSchema() {
  await ensureDatabaseSchema();
}

export async function recordProblemAttempt(input: {
  id: string;
  problemId: string;
  studentId: string;
  answer: string | null;
  isCorrect: boolean;
  timeSeconds: number;
  confidence?: number | null;
  mistakeType?: string | null;
}) {
  await ensureDatabaseSchema();
  const client = db();
  try {
    await client.execute({
      sql: `INSERT INTO "ProblemAttempt" ("id","problemId","studentId","answer","isCorrect","timeSeconds","confidence","mistakeType") VALUES (?,?,?,?,?,?,?,?)`,
      args: [input.id, input.problemId, input.studentId, input.answer, input.isCorrect ? 1 : 0, input.timeSeconds, input.confidence ?? null, input.mistakeType ?? null],
    });

    const problem = await client.execute({ sql: `SELECT "topicId" FROM "Problem" WHERE "id" = ? LIMIT 1`, args: [input.problemId] });
    const topicId = problem.rows[0]?.topicId;
    if (topicId) {
      await client.execute({
        sql: `INSERT INTO "TopicMastery" ("id","studentId","topicId","questionsSeen","questionsCorrect","lastUpdated") VALUES (lower(hex(randomblob(16))),?,?,1,?,CURRENT_TIMESTAMP)
              ON CONFLICT("studentId","topicId") DO UPDATE SET "questionsSeen" = "questionsSeen" + 1, "questionsCorrect" = "questionsCorrect" + excluded."questionsCorrect", "lastUpdated" = CURRENT_TIMESTAMP`,
        args: [input.studentId, String(topicId), input.isCorrect ? 1 : 0],
      });
    }
  } finally {
    client.close();
  }
}

export function chooseDifficulty(currentMastery: number, recentAccuracy: number, recentAverageSeconds: number, expectedSeconds: number) {
  const performance = Math.max(0, Math.min(1, currentMastery * 0.5 + recentAccuracy * 0.35 + Math.min(1, expectedSeconds / Math.max(1, recentAverageSeconds)) * 0.15));
  if (performance >= 0.82) return 8;
  if (performance >= 0.68) return 7;
  if (performance >= 0.52) return 6;
  if (performance >= 0.35) return 4;
  return 3;
}
