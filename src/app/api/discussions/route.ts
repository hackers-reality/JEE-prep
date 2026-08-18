import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth";

const categories = new Set(["GENERAL", "PHYSICS", "CHEMISTRY", "MATHEMATICS", "DOUBT", "SOLUTION"]);
const subjects = new Set(["PHYSICS", "CHEMISTRY", "MATHEMATICS"]);

export async function GET(req: NextRequest) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const category = url.searchParams.get("category")?.toUpperCase();
  const q = url.searchParams.get("q")?.trim();
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 20), 1), 50);

  const posts = await prisma.discussionPost.findMany({
    where: {
      ...(category && categories.has(category) ? { category } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { body: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      student: { select: { id: true, name: true } },
      topic: { select: { id: true, title: true } },
      _count: { select: { comments: true, votes: true, bookmarks: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(
    posts.map((post) => ({
      ...post,
      voteCount: post._count.votes,
      commentCount: post._count.comments,
      bookmarkCount: post._count.bookmarks,
      _count: undefined,
    }))
  );
}

export async function POST(req: NextRequest) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const content = typeof body?.body === "string" ? body.body.trim() : "";
    const category = typeof body?.category === "string" ? body.category.toUpperCase() : "GENERAL";
    const subject = typeof body?.subject === "string" ? body.subject.toUpperCase() : null;
    const topicId = typeof body?.topicId === "string" && body.topicId.trim() ? body.topicId.trim() : null;
    const imageUrl = typeof body?.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : null;

    if (title.length < 4 || title.length > 180) {
      return NextResponse.json({ error: "Title must be 4–180 characters." }, { status: 400 });
    }
    if (content.length < 2 || content.length > 10000) {
      return NextResponse.json({ error: "Post body must be 2–10,000 characters." }, { status: 400 });
    }
    if (!categories.has(category)) return NextResponse.json({ error: "Invalid discussion category." }, { status: 400 });
    if (subject && !subjects.has(subject)) return NextResponse.json({ error: "Invalid subject." }, { status: 400 });

    if (topicId) {
      const topic = await prisma.topic.findUnique({ where: { id: topicId }, select: { id: true } });
      if (!topic) return NextResponse.json({ error: "Topic not found." }, { status: 400 });
    }

    const post = await prisma.discussionPost.create({
      data: {
        studentId: student.id,
        topicId,
        subject: subject as "PHYSICS" | "CHEMISTRY" | "MATHEMATICS" | null,
        title,
        body: content,
        imageUrl,
        category,
      },
      include: {
        student: { select: { id: true, name: true } },
        topic: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("discussions POST error:", error);
    return NextResponse.json({ error: "Failed to create discussion." }, { status: 500 });
  }
}
