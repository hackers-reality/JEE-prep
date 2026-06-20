"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ResultData = {
  id: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  subjectBreakdown: string;
  weakTopicIds: string;
  strongTopicIds: string;
  focusNextTopicIds: string;
  mockTest: {
    id: string;
    type: string;
    takenAt: string;
    questions: {
      id: string;
      question: string;
      options: string;
      correctAnswer: string;
      studentAnswer: string | null;
      isCorrect: boolean | null;
      explanation: string;
      difficulty: string;
      topics: { topic: { id: string; title: string } }[];
    }[];
  };
};

export default function TestResultsPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.resultId as string;

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/mock-test/results/${resultId}`)
      .then((r) => r.json())
      .then((data) => setResult(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [resultId]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6 text-center" style={{ color: "var(--ink)" }}>
        Loading analysis...
      </main>
    );
  }

  if (!result) {
    return (
      <main className="max-w-3xl mx-auto p-6 text-center" style={{ color: "var(--ink)" }}>
        Result not found. <button onClick={() => router.push("/mock-test/diagnostic")} className="underline">Go back</button>
      </main>
    );
  }

  const pct = result.totalQuestions > 0 ? Math.round((result.correctCount / result.totalQuestions) * 100) : 0;
  const weakTopicTitles = result.mockTest.questions
    .filter((q) => q.topics.some((t) => result.weakTopicIds.includes(t.topic.id)))
    .flatMap((q) => q.topics.map((t) => t.topic.title));
  const uniqueWeak = [...new Set(weakTopicTitles)];

  return (
    <main className="max-w-3xl mx-auto p-6" style={{ color: "var(--ink)" }}>
      {/* Score card */}
      <div
        className="rounded-lg p-8 shadow-md text-center mb-6"
        style={{ backgroundColor: "var(--sticky-yellow)" }}
      >
        <h1 className="font-hand text-3xl font-bold mb-2">{result.mockTest.type === "REGULAR" ? "Practice Test" : "Diagnostic"} Results</h1>
        <div className="text-5xl font-bold my-4" style={{ color: pct >= 60 ? "var(--sticky-green)" : "var(--accent-red)" }}>
          {pct}%
        </div>
        <p className="text-sm opacity-70">
          {result.correctCount} correct · {result.incorrectCount} incorrect · {result.totalQuestions} total
        </p>
      </div>

      {/* Weak areas */}
      {uniqueWeak.length > 0 && (
        <div className="rounded-lg p-5 shadow-md mb-6" style={{ backgroundColor: "var(--sticky-pink)" }}>
          <h2 className="font-hand text-xl font-bold mb-3">Areas to Focus On</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {uniqueWeak.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Per-question review */}
      <button
        onClick={() => setShowReview(!showReview)}
        className="w-full px-4 py-3 rounded-lg text-sm font-bold mb-4"
        style={{ backgroundColor: "var(--sticky-blue)", color: "var(--ink)" }}
      >
        {showReview ? "Hide Detailed Review" : "Show Detailed Review"}
      </button>

      {showReview && (
        <div className="space-y-4">
          {result.mockTest.questions.map((q, i) => {
            const isCorrect = q.isCorrect;
            return (
              <div
                key={q.id}
                className="rounded-lg p-5 shadow-md"
                style={{
                  backgroundColor: isCorrect ? "var(--sticky-green)" : "var(--sticky-pink)",
                }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className="font-bold text-sm">Q{i + 1}.</span>
                  <p className="text-sm font-semibold flex-1">{q.question}</p>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: isCorrect ? "#2d6a4f" : "#9b2226",
                      color: "white",
                    }}
                  >
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <div className="ml-5 text-xs space-y-1">
                  <p><strong>Your answer:</strong> {q.studentAnswer ?? "(none)"}</p>
                  <p><strong>Correct answer:</strong> {q.correctAnswer}</p>
                  <p className="mt-2 opacity-80">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 text-center space-x-4">
        <button
          onClick={() => router.push(result.mockTest.type === "REGULAR" ? "/mock-test/regular" : "/mock-test/diagnostic")}
          className="px-6 py-3 text-sm font-bold rounded-lg"
          style={{ backgroundColor: "var(--sticky-blue)", color: "var(--ink)" }}
        >
          {result.mockTest.type === "REGULAR" ? "Back to Practice Tests" : "Back to Diagnostic Hub"}
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
