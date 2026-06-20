import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BooksPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: { books: { orderBy: { title: "asc" } } },
  });
  if (!subject) notFound();

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Link
        href="/subjects"
        className="text-sm mb-4 inline-block hover:underline"
        style={{ color: "var(--ink)" }}
      >
        ← Back to Subjects
      </Link>
      <h1 className="font-hand text-3xl font-bold mb-2" style={{ color: "var(--ink)" }}>
        {subject.name.charAt(0) + subject.name.slice(1).toLowerCase()}
      </h1>
      <p className="text-sm mb-6 opacity-70">Select a book to start learning</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {subject.books.map((book) => (
          <Link key={book.id} href={`/subjects/${subjectId}/books/${book.id}`}>
            <div
              className="p-6 transition-all duration-200 hover:-translate-y-1"
              style={{
                backgroundColor: "var(--sticky-blue)",
                transform: `rotate(${(Math.random() - 0.5) * 3}deg)`,
                borderRadius: "4px",
                boxShadow: "5px 5px 0 rgba(0,0,0,0.25)",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <h2 className="font-hand text-lg font-bold">{book.title}</h2>
              <p className="text-xs mt-1 opacity-60">
                {book.classLevel.replace(/_/g, " ")}
                {book.isPrimary ? " • Primary" : ""}
              </p>
              {book.referenceNote && (
                <p className="text-xs mt-2 opacity-70">{book.referenceNote}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
