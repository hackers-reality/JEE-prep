"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type QuestionReview = {
  id: string;
  question: string;
  options: string;
  correctAnswer: string;
  studentAnswer: string | null;
  isCorrect: boolean | null;
  explanation: string;
  difficulty: string;
  topics: { topic: { id: string; title: string } }[];
};

type TestResult = {
  id: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  subjectBreakdown: string;
  weakTopicIds: string;
  strongTopicIds: string;
  mockTest: {
    type: string;
    questions: QuestionReview[];
  };
};

export default function OverallResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const student = await fetch("/api/student").then((r) => r.json());
      if (!student?.id) return;
      const tests = await fetch("/api/student/tests").then((r) => r.json());
      if (!cancelled && tests?.length) {
        const full = await Promise.all(
          tests
            .filter((t: { resultId: string | null }) => t.resultId)
            .map((t: { resultId: string }) =>
              fetch(`/api/mock-test/results/${t.resultId}`).then((r) => r.json())
            )
        );
        if (!cancelled) setResults(full);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6 text-center" style={{ color: "var(--ink)" }}>
        Loading overall analysis...
      </main>
    );
  }

  if (results.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-6 text-center" style={{ color: "var(--ink)" }}>
        No completed tests found.
        <br />
        <button onClick={() => router.push("/mock-test/diagnostic")} className="underline mt-2">
          Take diagnostic tests
        </button>
      </main>
    );
  }

  const totalQ = results.reduce((s, r) => s + r.totalQuestions, 0);
  const totalC = results.reduce((s, r) => s + r.correctCount, 0);
  const overallPct = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;

  const allWeakTitles = results.flatMap((r) =>
    r.mockTest.questions
      .filter((q) => q.topics.some((t) => r.weakTopicIds.includes(t.topic.id)))
      .flatMap((q) => q.topics.map((t) => t.topic.title))
  );
  const uniqueWeak = [...new Set(allWeakTitles)];

  return (
    <main className="max-w-3xl mx-auto p-6" style={{ color: "var(--ink)" }}>
      <div
        className="rounded-lg p-8 shadow-md text-center mb-6"
        style={{ backgroundColor: "var(--sticky-yellow)" }}
      >
        <h1 className="font-hand text-3xl font-bold mb-2">Overall Diagnostic Analysis</h1>
        <div
          className="text-5xl font-bold my-4"
          style={{ color: overallPct >= 60 ? "var(--sticky-green)" : "var(--accent-red)" }}
        >
          {overallPct}%
        </div>
        <p className="text-sm opacity-70">
          {totalC} / {totalQ} correct across all subjects
        </p>
      </div>

      {/* Per-subject breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {results.map((r, i) => {
          const pct = r.totalQuestions > 0 ? Math.round((r.correctCount / r.totalQuestions) * 100) : 0;
          const subjects = ["Physics", "Chemistry", "Mathematics"];
          return (
            <div
              key={r.id}
              className="rounded-lg p-4 shadow-md text-center"
              style={{ backgroundColor: "var(--sticky-blue)" }}
            >
              <h3 className="font-hand text-lg font-bold">{subjects[i] || "Subject"}</h3>
              <div className="text-2xl font-bold my-1">{pct}%</div>
              <p className="text-xs opacity-70">
                {r.correctCount}/{r.totalQuestions}
              </p>
            </div>
          );
        })}
      </div>

      {uniqueWeak.length > 0 && (
        <div className="rounded-lg p-5 shadow-md mb-6" style={{ backgroundColor: "var(--sticky-pink)" }}>
          <h2 className="font-hand text-xl font-bold mb-3">Focus Areas</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {uniqueWeak.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 text-center space-x-4">
        <button
          onClick={() => router.push("/mock-test/diagnostic")}
          className="px-6 py-3 text-sm font-bold rounded-lg"
          style={{ backgroundColor: "var(--sticky-blue)", color: "var(--ink)" }}
        >
          Diagnostic Hub
        </button>
        <button
          onClick={() => router.push("/subjects")}
          className="px-6 py-3 text-sm font-bold rounded-lg"
          style={{ backgroundColor: "var(--sticky-green)", color: "var(--ink)" }}
        >
          Start Learning
        </button>
      </div>
    </main>
  );
}
