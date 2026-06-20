import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NeedsReviewBadge } from "@/components/NeedsReviewBadge";

export const dynamic = "force-dynamic";

export default async function TopicsPage({
  params,
}: {
  params: Promise<{ subjectId: string; bookId: string; chapterId: string }>;
}) {
  const { subjectId, bookId, chapterId } = await params;
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      book: { include: { subject: true } },
      topics: { orderBy: { orderIndex: "asc" } },
    },
  });
  if (!chapter) notFound();

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Link
        href={`/subjects/${subjectId}/books/${bookId}`}
        className="text-sm mb-4 inline-block hover:underline"
        style={{ color: "var(--ink)" }}
      >
        ← Back to Chapters
      </Link>
      <h1 className="font-hand text-3xl font-bold mb-1" style={{ color: "var(--ink)" }}>
        {chapter.title}
      </h1>
      <p className="text-sm mb-6 opacity-70">
        {chapter.book.subject.name.charAt(0) + chapter.book.subject.name.slice(1).toLowerCase()} • {chapter.book.title}
      </p>

      <div className="space-y-4">
        {chapter.topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.id}`}
          >
            <div
              className="p-5 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: "var(--sticky-green)",
                transform: `rotate(${(Math.random() - 0.5) * 2}deg)`,
                borderRadius: "4px",
                boxShadow: "5px 5px 0 rgba(0,0,0,0.25)",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-hand text-lg font-bold">
                    {topic.orderIndex}. {topic.title}
                  </h2>
                  {topic.sourceReference && (
                    <p className="text-xs mt-1 opacity-60">{topic.sourceReference}</p>
                  )}
                </div>
                {topic.needsReview && <NeedsReviewBadge />}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
