import { AIWorkspace } from "@/components/AIWorkspace";

export const dynamic = "force-dynamic";

export default function GlobalChatPage() {
  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-5">
      <section className="paper-card p-6">
        <p className="text-xs uppercase tracking-widest opacity-50">AI study desk</p>
        <h1 className="font-hand text-4xl font-bold mt-1">JEE Tutor</h1>
        <p className="mt-2 opacity-65 max-w-2xl">Your student-owned workspace for doubts, solution checking, concept explanations and JEE-level problem solving.</p>
      </section>
      <AIWorkspace />
    </main>
  );
}
