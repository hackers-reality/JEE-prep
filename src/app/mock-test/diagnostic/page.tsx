"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type TestInfo = {
  id: string;
  type: string;
  takenAt: string | null;
  questions: { id: string }[];
  result: { id: string } | null;
};

export default function DiagnosticHubPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/student")
      .then((r) => r.json())
      .then((s) => {
        if (!s?.id) { router.push("/onboarding"); return; }
        setStudentId(s.id);
      });
  }, [router]);

  useEffect(() => {
    if (!studentId) return;

    // First check if diagnostic tests already exist
    fetch("/api/student/tests")
      .then((r) => r.json())
      .then((existingTests: any[]) => {
        const diag = existingTests.filter((t) => t.type === "DIAGNOSTIC");
        if (diag.length >= 3) {
          // Load full test data including questions
          return Promise.all(
            diag.slice(0, 3).map((t: { id: string }) =>
              fetch(`/api/mock-test/${t.id}`).then((r) => r.json())
            )
          ).then((fullTests) => {
            setTests(fullTests);
            setLoading(false);
          });
        }

        // No existing tests — create them
        return fetch("/api/mock-test/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.tests) setTests(data.tests);
            setLoading(false);
          });
      })
      .catch(() => setLoading(false));
  }, [studentId]);

  const subjects = ["Physics", "Chemistry", "Mathematics"];

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-lg" style={{ color: "var(--ink)" }}>Preparing your diagnostic tests...</p>
      </main>
    );
  }

  const allDone = tests.length === 3 && tests.every((t) => t.takenAt);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="font-hand text-3xl font-bold mb-2 text-center" style={{ color: "var(--ink)" }}>
        Diagnostic Assessment
      </h1>
      <p className="text-sm text-center opacity-70 mb-8" style={{ color: "var(--ink)" }}>
        Take one subject test at a time.
      </p>

      <div className="space-y-4">
        {tests.map((test, i) => {
          const done = !!test.takenAt;
          return (
            <div
              key={test.id}
              className="rounded-lg p-5 shadow-md transition-all"
              style={{
                backgroundColor: done ? "var(--sticky-green)" : "var(--sticky-yellow)",
                opacity: done ? 0.8 : 1,
                color: "var(--ink)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-hand text-xl font-bold">{subjects[i]} Diagnostic</h2>
                  <p className="text-xs opacity-70">
                    {test.questions.length} questions | {done ? "Completed" : "Not taken"}
                  </p>
                </div>
                {done ? (
                  <span className="text-sm font-bold">✓ Done</span>
                ) : (
                  <button
                    onClick={() => router.push(`/mock-test/${test.id}`)}
                    className="px-4 py-2 text-sm font-bold rounded-lg"
                    style={{ backgroundColor: "var(--sticky-blue)", color: "var(--ink)" }}
                  >
                    Start Test
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {allDone && (
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/mock-test/results/overall")}
            className="px-6 py-3 text-sm font-bold rounded-lg"
            style={{ backgroundColor: "var(--sticky-green)", color: "var(--ink)" }}
          >
            View Overall Analysis
          </button>
        </div>
      )}
    </main>
  );
}
