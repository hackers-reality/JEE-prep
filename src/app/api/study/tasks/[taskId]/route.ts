import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { ensureStudySchema, currentStudentId } from "@/lib/student-study";

function db() { const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db"; const authToken = process.env.TURSO_AUTH_TOKEN; return createClient({ url, ...(authToken ? { authToken } : {}) }); }

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  await ensureStudySchema(); const studentId = await currentStudentId(); if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { taskId } = await params; const body = await req.json().catch(() => ({}));
  const fields: string[] = []; const args: unknown[] = [];
  if (typeof body.title === "string" && body.title.trim()) { fields.push("title = ?"); args.push(body.title.trim().slice(0,160)); }
  if (typeof body.description === "string") { fields.push("description = ?"); args.push(body.description.slice(0,1000)); }
  if (typeof body.dueAt === "string" || body.dueAt === null) { fields.push("dueAt = ?"); args.push(body.dueAt); }
  if (["TODO","IN_PROGRESS","DONE"].includes(body.status)) { fields.push("status = ?"); args.push(body.status); }
  if (Number.isInteger(body.priority)) { fields.push("priority = ?"); args.push(Math.min(3, Math.max(1, body.priority))); }
  if (!fields.length) return NextResponse.json({ error: "No changes supplied." }, { status: 400 });
  fields.push("updatedAt = CURRENT_TIMESTAMP"); args.push(taskId, studentId);
  const client = db(); try { const result = await client.execute({ sql: `UPDATE "StudyTask" SET ${fields.join(", ")} WHERE id = ? AND studentId = ?`, args }); if (result.rowsAffected === 0) return NextResponse.json({ error: "Task not found." }, { status: 404 }); return NextResponse.json({ ok: true }); } finally { client.close(); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  await ensureStudySchema(); const studentId = await currentStudentId(); if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 }); const { taskId } = await params; const client = db(); try { const result = await client.execute({ sql: `DELETE FROM "StudyTask" WHERE id = ? AND studentId = ?`, args: [taskId, studentId] }); if (result.rowsAffected === 0) return NextResponse.json({ error: "Task not found." }, { status: 404 }); return NextResponse.json({ ok: true }); } finally { client.close(); }
}
