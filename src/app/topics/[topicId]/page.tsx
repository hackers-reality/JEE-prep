import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NeedsReviewBadge } from "@/components/NeedsReviewBadge";
import { TheoryCard, FormulaCard, MistakeCard, ExampleCard } from "@/components/ContentCard";
import MarkdownContent from "@/components/MarkdownContent";

export const dynamic = "force-dynamic";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      chapter: {
        include: {
          book: { include: { subject: true } },
        },
      },
      formulas: { orderBy: { orderIndex: "asc" } },
      examples: { orderBy: { orderIndex: "asc" } },
      mistakes: true,
    },
  });
  if (!topic) notFound();

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Link
        href={`/subjects/${topic.chapter.book.subject.id}/books/${topic.chapter.book.id}/chapters/${topic.chapter.id}`}
        className="text-sm mb-4 inline-block hover:underline"
        style={{ color: "var(--ink)" }}
      >
        ← Back to {topic.chapter.title}
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-hand text-3xl font-bold" style={{ color: "var(--ink)" }}>
            {topic.title}
          </h1>
          <p className="text-sm mt-1 opacity-70">
            {topic.chapter.book.subject.name.charAt(0) + topic.chapter.book.subject.name.slice(1).toLowerCase()} • {topic.chapter.book.title} • {topic.chapter.title}
          </p>
        </div>
        {topic.needsReview && <NeedsReviewBadge />}
      </div>

      <div className="space-y-6">
        {topic.theory && (
          <TheoryCard><MarkdownContent content={topic.theory} /></TheoryCard>
        )}

        {topic.formulas.length > 0 && (
          <section>
            <h2 className="font-hand text-2xl font-bold mb-4" style={{ color: "var(--ink)" }}>
              Formulas
            </h2>
            <div className="space-y-4">
              {topic.formulas.map((f) => (
                <FormulaCard key={f.id}>
                  <p className="font-bold">{f.name}</p>
                  <p className="mt-2 text-base font-mono">{f.expression}</p>
                  {f.derivation && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs font-semibold hover:underline">
                        Show derivation
                      </summary>
                      <div className="mt-2 text-sm"><MarkdownContent content={f.derivation} /></div>
                    </details>
                  )}
                </FormulaCard>
              ))}
            </div>
          </section>
        )}

        {topic.examples.length > 0 && (
          <section>
            <h2 className="font-hand text-2xl font-bold mb-4" style={{ color: "var(--ink)" }}>
              Solved Examples
            </h2>
            <div className="space-y-4">
              {topic.examples.map((ex) => (
                <ExampleCard key={ex.id} difficulty={ex.difficulty}>
                  <p className="font-semibold">Q: {ex.question}</p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-semibold hover:underline">
                      Show solution
                    </summary>
                    <div className="mt-2"><MarkdownContent content={ex.solution} /></div>
                  </details>
                </ExampleCard>
              ))}
            </div>
          </section>
        )}

        {topic.mistakes.length > 0 && (
          <section>
            <h2 className="font-hand text-2xl font-bold mb-4" style={{ color: "var(--ink)" }}>
              Common Mistakes
            </h2>
            <div className="space-y-4">
              {topic.mistakes.map((m) => (
                <MistakeCard key={m.id}>
                  <MarkdownContent content={m.description} />
                </MistakeCard>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link
          href={`/chat/${topic.id}`}
          className="inline-block px-6 py-3 text-base font-hand font-bold transition-all duration-200 hover:-translate-y-0.5"
          style={{
            backgroundColor: "var(--sticky-yellow)",
            color: "var(--ink)",
            borderRadius: "4px",
            boxShadow: "5px 5px 0 rgba(0,0,0,0.25)",
          }}
        >
          Ask a doubt about this topic
        </Link>
      </div>
    </main>
  );
}
