import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { ensureAIConversationSchema, currentStudentId } from "@/lib/ai-conversations";

function db() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  await ensureAIConversationSchema();
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { conversationId } = await params;
  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
  if (!title) return NextResponse.json({ error: "A title is required." }, { status: 400 });
  const client = db();
  try {
    const result = await client.execute({ sql: `UPDATE "AIConversation" SET title = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND studentId = ?`, args: [title, conversationId, studentId] });
    if (result.rowsAffected === 0) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    return NextResponse.json({ ok: true, title });
  } finally { client.close(); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  await ensureAIConversationSchema();
  const studentId = await currentStudentId();
  if (!studentId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { conversationId } = await params;
  const client = db();
  try {
    const result = await client.execute({ sql: `DELETE FROM "AIConversation" WHERE id = ? AND studentId = ?`, args: [conversationId, studentId] });
    if (result.rowsAffected === 0) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } finally { client.close(); }
}
