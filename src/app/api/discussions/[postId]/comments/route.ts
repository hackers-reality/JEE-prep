import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { postId } = await params;

  const comments = await prisma.discussionComment.findMany({
    where: { postId },
    include: { student: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { postId } = await params;

  try {
    const post = await prisma.discussionPost.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) return NextResponse.json({ error: "Discussion not found." }, { status: 404 });

    const body = await req.json();
    const content = typeof body?.body === "string" ? body.body.trim() : "";
    if (content.length < 2 || content.length > 10000) {
      return NextResponse.json({ error: "Comment must be 2–10,000 characters." }, { status: 400 });
    }

    const comment = await prisma.discussionComment.create({
      data: { postId, studentId: student.id, body: content },
      include: { student: { select: { id: true, name: true } } },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("discussion comments POST error:", error);
    return NextResponse.json({ error: "Failed to add comment." }, { status: 500 });
  }
}
