import { NextResponse } from "next/server";
import { ensureProblemSchema } from "@/lib/problem-engine";
import { createClient } from "@libsql/client";
import { getCurrentStudent } from "@/lib/auth";

function client() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient({ url, ...(authToken ? { authToken } : {}) });
}

export async function GET(request: Request) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureProblemSchema();
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get("subject");
  const exam = searchParams.get("exam");
  const difficulty = Number(searchParams.get("difficulty") ?? 0);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const where: string[] = [];
  const args: (string | number)[] = [];
  if (subject) { where.push('"subject" = ?'); args.push(subject); }
  if (exam) { where.push('"exam" = ?'); args.push(exam); }
  if (difficulty > 0) { where.push('"difficulty" = ?'); args.push(difficulty); }

  const db = client();
  try {
    const result = await db.execute({
      sql: `SELECT "id","title","subject","topicId","exam","type","difficulty","statement","options","correctAnswer","explanation","source","sourceYear","sourceSession","expectedSeconds" FROM "Problem" ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY "difficulty", "createdAt" DESC LIMIT ${limit}`,
      args,
    });
    const problems = result.rows.map((row) => ({ ...row, options: JSON.parse(String(row.options ?? "[]")) }));
    return NextResponse.json({ problems });
  } finally {
    db.close();
  }
}
