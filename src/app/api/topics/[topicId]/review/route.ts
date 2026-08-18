import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDatabaseSchema } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ topicId: string }> }) {
  await ensureDatabaseSchema();
  const { topicId } = await params;
  const body = await request.json().catch(() => ({}));
  const reviewed = body.reviewed !== false;

  const topic = await prisma.topic.update({
    where: { id: topicId },
    data: {
      needsReview: !reviewed,
      reviewedAt: reviewed ? new Date() : null,
      reviewedBy: reviewed ? "student" : null,
    },
    select: { id: true, needsReview: true, reviewedAt: true },
  });

  return NextResponse.json(topic);
}
