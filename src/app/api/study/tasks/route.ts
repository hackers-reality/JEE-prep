import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { ensureStudySchema, currentStudentId, newStudyId } from "@/lib/student-study";

function db() { const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db"; const authToken = process.env.TURSO_AUTH_TOKEN; return createClient({ url, ...(authToken ? { authToken } : {}) }); }

export async function GET() {
  await ensureStudySchema(); const studentId = await currentStudentId(); if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const client = db(); try { const result = await client.execute({ sql: `SELECT id,title,description,dueAt,status,priority,createdAt,updatedAt FROM "StudyTask" WHERE studentId = ? ORDER BY CASE WHEN status='DONE' THEN 1 ELSE 0 END, dueAt IS NULL, dueAt ASC, priority ASC`, args: [studentId] }); return NextResponse.json({ tasks: result.rows }); } finally { client.close(); }
}

export async function POST(req: NextRequest) {
  await ensureStudySchema(); const studentId = await currentStudentId(); if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => ({})); const title = typeof body.title === "string" ? body.title.trim().slice(0,160) : ""; if (!title) return NextResponse.json({ error: "Task title is required." }, { status: 400 });
  const status = ["TODO","IN_PROGRESS","DONE"].includes(body.status) ? body.status : "TODO"; const priority = Number.isInteger(body.priority) ? Math.min(3, Math.max(1, body.priority)) : 2; const dueAt = typeof body.dueAt === "string" ? body.dueAt : null;
  const client = db(); try { const id = newStudyId(); await client.execute({ sql: `INSERT INTO "StudyTask" (id,studentId,title,description,dueAt,status,priority) VALUES (?,?,?,?,?,?,?)`, args: [id,studentId,title,typeof body.description === "string" ? body.description.slice(0,1000) : null,dueAt,status,priority] }); return NextResponse.json({ task: { id,title,status,priority,dueAt } }, { status: 201 }); } finally { client.close(); }
}
