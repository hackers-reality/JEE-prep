import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ChaptersPage({
  params,
}: {
  params: Promise<{ subjectId: string; bookId: string }>;
}) {
  const { subjectId, bookId } = await params;
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      subject: true,
      chapters: { orderBy: { orderIndex: "asc" } },
    },
  });
  if (!book) notFound();

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Link
        href={`/subjects/${subjectId}`}
        className="text-sm mb-4 inline-block hover:underline"
        style={{ color: "var(--ink)" }}
      >
        ← Back to Books
      </Link>
      <h1 className="font-hand text-3xl font-bold mb-2" style={{ color: "var(--ink)" }}>
        {book.title}
      </h1>
      <p className="text-sm mb-6 opacity-70">
        {book.subject.name.charAt(0) + book.subject.name.slice(1).toLowerCase()} • {book.classLevel.replace(/_/g, " ")}
      </p>
      <div className="space-y-4">
        {book.chapters.map((chapter, i) => (
          <Link
            key={chapter.id}
            href={`/subjects/${subjectId}/books/${bookId}/chapters/${chapter.id}`}
          >
            <div
              className="p-5 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: "var(--sticky-yellow)",
                transform: `rotate(${(Math.random() - 0.5) * 2}deg)`,
                borderRadius: "4px",
                boxShadow: "5px 5px 0 rgba(0,0,0,0.25)",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <h2 className="font-hand text-lg font-bold">
                {chapter.orderIndex}. {chapter.title}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
