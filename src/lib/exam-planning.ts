import { createClient } from "@libsql/client";
import { getCurrentStudent } from "@/lib/auth";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function ensureExamPlanningSchema() {
  const client = db();
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS "StudentExam" ("id" TEXT NOT NULL PRIMARY KEY, "studentId" TEXT NOT NULL, "title" TEXT NOT NULL, "examType" TEXT NOT NULL DEFAULT 'SCHOOL', "examAt" DATETIME NOT NULL, "priority" INTEGER NOT NULL DEFAULT 2, "durationMinutes" INTEGER, "notes" TEXT, "status" TEXT NOT NULL DEFAULT 'ACTIVE', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "StudentExam_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS "StudentExamScope" ("id" TEXT NOT NULL PRIMARY KEY, "examId" TEXT NOT NULL, "subjectId" TEXT, "chapterId" TEXT, "topicId" TEXT, "label" TEXT NOT NULL, "sourceText" TEXT, "mappingStatus" TEXT NOT NULL DEFAULT 'UNRESOLVED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "StudentExamScope_examId_fkey" FOREIGN KEY ("examId") REFERENCES "StudentExam"("id") ON DELETE CASCADE)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "StudentExam_studentId_examAt_idx" ON "StudentExam"("studentId", "examAt")`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "StudentExamScope_examId_idx" ON "StudentExamScope"("examId")`);
    await client.execute(`CREATE INDEX IF NOT EXISTS "StudentExamScope_topicId_idx" ON "StudentExamScope"("topicId")`);
  } finally { client.close(); }
}

export async function currentStudentId() {
  const student = await getCurrentStudent();
  return student?.id ?? null;
}

export function newExamId() { return crypto.randomUUID(); }
export function newExamScopeId() { return crypto.randomUUID(); }

export type ExamInput = {
  title: string;
  examType?: string;
  examAt: string;
  priority?: number;
  durationMinutes?: number | null;
  notes?: string | null;
  scope?: Array<{
    label: string;
    subjectId?: string | null;
    chapterId?: string | null;
    topicId?: string | null;
    sourceText?: string | null;
  }>;
};

export function normalizeExamInput(input: ExamInput) {
  const title = input.title.trim().slice(0, 160);
  if (!title) throw new Error("Exam title is required.");
  const date = new Date(input.examAt);
  if (Number.isNaN(date.getTime())) throw new Error("A valid exam date/time is required.");
  return {
    title,
    examType: (input.examType ?? "SCHOOL").trim().slice(0, 40),
    examAt: date.toISOString(),
    priority: Math.min(3, Math.max(1, Number.isInteger(input.priority) ? input.priority! : 2)),
    durationMinutes: Number.isInteger(input.durationMinutes) ? Math.min(600, Math.max(1, input.durationMinutes!)) : null,
    notes: typeof input.notes === "string" ? input.notes.slice(0, 2000) : null,
    scope: (input.scope ?? []).map((item) => ({
      label: String(item.label ?? "").trim().slice(0, 200),
      subjectId: item.subjectId ?? null,
      chapterId: item.chapterId ?? null,
      topicId: item.topicId ?? null,
      sourceText: typeof item.sourceText === "string" ? item.sourceText.slice(0, 1000) : null,
    })).filter((item) => item.label.length > 0),
  };
}
