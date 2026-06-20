"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Question = {
  id: string;
  question: string;
  options: string;
  correctAnswer: string;
  difficulty: string;
  topics: { topic: { title: string } }[];
};

type Test = {
  id: string;
  type: string;
  takenAt: string | null;
  questions: Question[];
};

const difficultyColors: Record<string, string> = {
  EASY: "var(--sticky-green)",
  MEDIUM: "var(--sticky-yellow)",
  HARD: "var(--sticky-pink)",
  JEE_ADVANCED: "var(--accent-red)",
};

export default function MockTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  const [test, setTest] = useState<Test | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/mock-test/${testId}`)
      .then((r) => r.json())
      .then((data) => {
        setTest(data);
        if (data.takenAt) setSubmitted(true);
      });
  }, [testId]);

  useEffect(() => {
    if (!submitted || !test) return;
    fetch(`/api/mock-test/${testId}/analyze`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) setResultId(data.id);
      })
      .catch(() => {});
  }, [submitted, test, testId, router]);

  function selectOption(questionId: string, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  async function handleSubmit() {
    if (!test) return;
    setSubmitting(true);
    const res = await fetch(`/api/mock-test/${testId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const data = await res.json();
    if (data.mockTestId) {
      setSubmitted(true);
    }
    setSubmitting(false);
  }

  if (!test) {
    return (
      <main className="max-w-3xl mx-auto p-6 text-center" style={{ color: "var(--ink)" }}>
        <p>Loading test...</p>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="max-w-2xl mx-auto p-6 text-center" style={{ color: "var(--ink)" }}>
        <h1 className="font-hand text-3xl font-bold mb-4">Test Submitted!</h1>
        <p className="mb-6">Analyzing your performance...</p>
        {resultId ? (
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/mock-test/results/${resultId}`)}
              className="px-6 py-3 text-sm font-bold rounded-lg"
              style={{ backgroundColor: "var(--sticky-green)", color: "var(--ink)" }}
            >
              View Analysis
            </button>
            <br />
            <button
              onClick={() => router.push("/mock-test/diagnostic")}
              className="px-6 py-3 text-sm font-bold rounded-lg mt-2"
              style={{ backgroundColor: "var(--sticky-blue)", color: "var(--ink)" }}
            >
              Back to Diagnostic Hub
            </button>
          </div>
        ) : (
          <p>Computing results...</p>
        )}
      </main>
    );
  }

  const allAnswered = test.questions.length > 0 && test.questions.every((q) => answers[q.id]);
  const answeredCount = Object.keys(answers).length;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-hand text-2xl font-bold" style={{ color: "var(--ink)" }}>
          Diagnostic Test
        </h1>
        <div className="text-sm" style={{ color: "var(--ink)" }}>
          {answeredCount} / {test.questions.length} answered
        </div>
      </div>

      <div className="space-y-6">
        {test.questions.map((q, i) => {
          const options: string[] = JSON.parse(q.options);
          return (
            <div
              key={q.id}
              className="rounded-lg p-5 shadow-md"
              style={{ backgroundColor: "var(--sticky-yellow)" }}
            >
              <div className="flex items-start gap-2 mb-3">
                <span className="font-bold text-sm" style={{ color: "var(--ink)" }}>
                  Q{i + 1}.
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {q.question}
                  </p>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: difficultyColors[q.difficulty] || "#ccc",
                    color: "var(--ink)",
                  }}
                >
                  {q.difficulty}
                </span>
              </div>

              <div className="space-y-2 ml-5">
                {options.map((opt) => {
                  const selected = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => selectOption(q.id, opt)}
                      className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selected ? "var(--sticky-blue)" : "white",
                        border: `2px solid ${selected ? "var(--sticky-blue)" : "var(--grid-line)"}`,
                        color: "var(--ink)",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="px-8 py-3 text-sm font-bold rounded-lg transition-all"
          style={{
            backgroundColor: allAnswered ? "var(--sticky-green)" : "var(--grid-line)",
            color: "var(--ink)",
            cursor: allAnswered ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? "Submitting..." : allAnswered ? "Submit All Answers" : "Answer all questions to submit"}
        </button>
      </div>
    </main>
  );
}
