import { createClient } from "@libsql/client";
import { getCurrentStudent } from "@/lib/auth";
import type { MistakeType } from "./assessment-engine";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function ensureAssessmentSchema() {
  const client = db();
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS "AssessmentAttempt" ("id" TEXT NOT NULL PRIMARY KEY, "studentId" TEXT NOT NULL, "title" TEXT NOT NULL, "timeLimitSeconds" INTEGER NOT NULL, "startedAt" DATETIME NOT NULL, "endedAt" DATETIME, "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AssessmentAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "AssessmentAttempt_studentId_startedAt_idx" ON "AssessmentAttempt"("studentId", "startedAt")`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "AssessmentQuestionAttempt" ("id" TEXT NOT NULL PRIMARY KEY, "assessmentId" TEXT NOT NULL, "questionId" TEXT NOT NULL, "topicId" TEXT, "startedAt" DATETIME, "submittedAt" DATETIME, "expectedSeconds" INTEGER NOT NULL DEFAULT 120, "activeSeconds" INTEGER NOT NULL DEFAULT 0, "answer" TEXT, "isCorrect" INTEGER, "confidence" INTEGER, "mistakeType" TEXT, "status" TEXT NOT NULL DEFAULT 'UNATTEMPTED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AssessmentQuestionAttempt_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "AssessmentAttempt"("id") ON DELETE CASCADE)`);
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "AssessmentQuestionAttempt_assessmentId_questionId_key" ON "AssessmentQuestionAttempt"("assessmentId", "questionId")`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "AssessmentQuestionAttempt_assessmentId_idx" ON "AssessmentQuestionAttempt"("assessmentId")`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "AssessmentReview" ("id" TEXT NOT NULL PRIMARY KEY, "assessmentId" TEXT NOT NULL, "questionId" TEXT NOT NULL, "classification" TEXT NOT NULL, "actualSeconds" INTEGER NOT NULL, "expectedSeconds" INTEGER NOT NULL, "intervention" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AssessmentReview_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "AssessmentAttempt"("id") ON DELETE CASCADE)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "AssessmentReview_assessmentId_idx" ON "AssessmentReview"("assessmentId")`);
  } finally { client.close(); }
}

export async function currentStudentId() {
  const student = await getCurrentStudent();
  return student?.id ?? null;
}

export function newAssessmentId() { return crypto.randomUUID(); }

export type SaveQuestionAttempt = {
  questionId: string;
  topicId?: string | null;
  startedAt?: string | null;
  submittedAt?: string | null;
  expectedSeconds?: number;
  activeSeconds?: number;
  answer?: string | null;
  isCorrect?: boolean | null;
  confidence?: number | null;
  mistakeType?: MistakeType | null;
  status?: "UNATTEMPTED" | "ANSWERED" | "SUBMITTED";
};
