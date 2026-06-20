import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChatWidget } from "@/components/ChatWidget";

export const dynamic = "force-dynamic";

export default async function ChatPage({
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
    },
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

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Link
        href={`/topics/${topicId}`}
        className="text-sm mb-4 inline-block hover:underline"
        style={{ color: "var(--ink)" }}
      >
        ← Back to {topic.title}
      </Link>

      <h1
        className="font-hand text-2xl font-bold mb-4"
        style={{ color: "var(--ink)" }}
      >
        Ask a Doubt
      </h1>

      <ChatWidget
        topicId={topicId}
        topicTitle={topic.title}
        topicContext={context}
      />
    </main>
  );
}
