import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChatWidget } from "@/components/ChatWidget";

export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { chapter: { include: { book: { include: { subject: true } } } } },
  });
  if (!topic) notFound();

  const context = [
    `Topic: ${topic.title}`,
    `Subject: ${topic.chapter.book.subject.name}`,
    `Chapter: ${topic.chapter.title}`,
    "",
    "--- Topic Content ---",
    topic.theory,
  ].join("\n");

  const backHref = `/subjects/${topic.chapter.book.subjectId}/books/${topic.chapter.bookId}/chapters/${topic.chapterId}`;

  return (
    <main className="max-w-5xl mx-auto p-5 sm:p-6 space-y-5">
      <Link href={backHref} className="text-sm hover:underline" style={{ color: "var(--ink)" }}>← Back to {topic.title}</Link>
      <section className="paper-card p-6">
        <p className="text-xs uppercase tracking-widest opacity-50">Topic tutor</p>
        <h1 className="font-hand text-3xl font-bold mt-1">Ask a doubt — {topic.title}</h1>
        <p className="text-sm opacity-60 mt-2">The tutor is grounded in this topic's material and the conversation stays focused on JEE preparation.</p>
      </section>
      <ChatWidget topicId={topicId} topicTitle={topic.title} topicContext={context} />
    </main>
  );
}
