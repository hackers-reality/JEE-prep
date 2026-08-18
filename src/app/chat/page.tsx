import { ChatWidget } from "@/components/ChatWidget";

export const dynamic = "force-dynamic";

export default function GlobalChatPage() {
  const context = `You are operating in the global JEE Prep tutor. No single topic is selected. Use the student's question to identify the relevant JEE Main/Advanced subject and concept. Prefer the official JEE syllabus and the learning material available in the platform when context is provided. If the question requires a specific textbook or official answer key that is not present, say so rather than inventing it.`;

  return (
    <main className="max-w-5xl mx-auto p-5 sm:p-6 space-y-5">
      <section className="paper-card p-6">
        <p className="text-xs uppercase tracking-widest opacity-50">AI study desk</p>
        <h1 className="font-hand text-4xl font-bold mt-1">Ask the JEE Tutor</h1>
        <p className="mt-2 opacity-65 max-w-2xl">A general-purpose study tutor for doubts, solution checking, concept explanations and JEE-level problem solving.</p>
      </section>
      <ChatWidget topicId="global" topicTitle="General JEE" topicContext={context} />
    </main>
  );
}
