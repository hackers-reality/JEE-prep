import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { postId } = await params;

  const post = await prisma.discussionPost.findUnique({
    where: { id: postId },
    include: {
      student: { select: { id: true, name: true } },
      topic: { select: { id: true, title: true } },
      _count: { select: { comments: true, votes: true, bookmarks: true } },
    },
  });

  if (!post) return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  return NextResponse.json({ ...post, voteCount: post._count.votes, commentCount: post._count.comments, bookmarkCount: post._count.bookmarks, _count: undefined });
}
