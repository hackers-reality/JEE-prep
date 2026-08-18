import { createClient } from "@libsql/client";

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
  const client = db();
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS "Problem" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "title" TEXT NOT NULL,
      "subject" TEXT NOT NULL,
      "topicId" TEXT,
      "exam" TEXT NOT NULL DEFAULT 'PRACTICE',
      "type" TEXT NOT NULL DEFAULT 'MCQ',
      "difficulty" INTEGER NOT NULL DEFAULT 5,
      "statement" TEXT NOT NULL,
      "options" TEXT NOT NULL DEFAULT '[]',
      "correctAnswer" TEXT NOT NULL,
      "explanation" TEXT NOT NULL,
      "source" TEXT,
      "sourceYear" INTEGER,
      "sourceSession" TEXT,
      "expectedSeconds" INTEGER NOT NULL DEFAULT 120,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "Problem_subject_exam_difficulty_idx" ON "Problem"("subject", "exam", "difficulty")`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "Problem_topicId_idx" ON "Problem"("topicId")`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "ProblemAttempt" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "problemId" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      "answer" TEXT,
      "isCorrect" BOOLEAN,
      "timeSeconds" INTEGER NOT NULL DEFAULT 0,
      "confidence" INTEGER,
      "mistakeType" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE,
      FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE
    )`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "ProblemAttempt_student_problem_idx" ON "ProblemAttempt"("studentId", "problemId")`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "ProblemAttempt_student_created_idx" ON "ProblemAttempt"("studentId", "createdAt")`);
  } finally {
    client.close();
  }
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
  const client = db();
  try {
    await client.execute({
      sql: `INSERT INTO "ProblemAttempt" ("id","problemId","studentId","answer","isCorrect","timeSeconds","confidence","mistakeType") VALUES (?,?,?,?,?,?,?,?)`,
      args: [input.id, input.problemId, input.studentId, input.answer, input.isCorrect ? 1 : 0, input.timeSeconds, input.confidence ?? null, input.mistakeType ?? null],
    });
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
