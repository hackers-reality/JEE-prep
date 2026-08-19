import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { ensureExamPlanningSchema, currentStudentId, newExamId, newExamScopeId, normalizeExamInput, type ExamInput } from "@/lib/exam-planning";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function GET() {
  await ensureExamPlanningSchema();
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const client = db();
  try {
    const exams = await client.execute({ sql: `SELECT id,title,examType,examAt,priority,durationMinutes,notes,status,createdAt,updatedAt FROM "StudentExam" WHERE studentId = ? ORDER BY examAt ASC`, args: [studentId] });
    const scopes = await client.execute({ sql: `SELECT id,examId,subjectId,chapterId,topicId,label,sourceText,mappingStatus,createdAt FROM "StudentExamScope" WHERE examId IN (SELECT id FROM "StudentExam" WHERE studentId = ?) ORDER BY createdAt ASC`, args: [studentId] });
    const byExam = new Map<string, unknown[]>();
    for (const scope of scopes.rows) { const id = String(scope.examId); const current = byExam.get(id) ?? []; current.push(scope); byExam.set(id, current); }
    return NextResponse.json({ exams: exams.rows.map((exam) => ({ ...exam, scope: byExam.get(String(exam.id)) ?? [] })) });
  } finally { client.close(); }
}

export async function POST(req: NextRequest) {
  await ensureExamPlanningSchema();
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => ({})) as ExamInput;
  let input;
  try { input = normalizeExamInput(body); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid exam." }, { status: 400 }); }
  const client = db();
  try {
    const examId = newExamId();
    await client.execute({ sql: `INSERT INTO "StudentExam" (id,studentId,title,examType,examAt,priority,durationMinutes,notes) VALUES (?,?,?,?,?,?,?,?)`, args: [examId,studentId,input.title,input.examType,input.examAt,input.priority,input.durationMinutes,input.notes] });
    for (const scope of input.scope) {
      await client.execute({ sql: `INSERT INTO "StudentExamScope" (id,examId,subjectId,chapterId,topicId,label,sourceText,mappingStatus) VALUES (?,?,?,?,?,?,?,?)`, args: [newExamScopeId(),examId,scope.subjectId,scope.chapterId,scope.topicId,scope.label,scope.sourceText,scope.topicId || scope.chapterId || scope.subjectId ? "MAPPED" : "UNRESOLVED"] });
    }
    return NextResponse.json({ exam: { id: examId, ...input } }, { status: 201 });
  } finally { client.close(); }
}
