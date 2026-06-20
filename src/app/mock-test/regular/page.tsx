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

export default function RegularMockTestPage() {
  const router = useRouter();
  const [allTests, setAllTests] = useState<TestInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
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
    fetch("/api/student/tests")
      .then((r) => r.json())
      .then((existingTests: TestInfo[]) => {
        const regular = existingTests.filter((t) => t.type === "REGULAR");
        if (regular.length > 0) {
          return Promise.all(
            regular.map((t: { id: string }) =>
              fetch(`/api/mock-test/${t.id}`).then((r) => r.json())
            )
          ).then((full) => {
            setAllTests(full);
            setLoading(false);
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [studentId]);

  async function createNewTest() {
    if (!studentId) return;
    setCreating(true);
    const res = await fetch("/api/mock-test/regular/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    const data = await res.json();
    if (data?.test) {
      setAllTests((prev) => [data.test, ...prev]);
    }
    setCreating(false);
  }

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto p-6 text-center" style={{ color: "var(--ink)" }}>
        <p className="text-lg">Loading...</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="font-hand text-3xl font-bold mb-2 text-center" style={{ color: "var(--ink)" }}>
        Practice Tests
      </h1>
      <p className="text-sm text-center opacity-70 mb-8" style={{ color: "var(--ink)" }}>
        Full-syllabus mock tests with questions from all subjects.
      </p>

      <div className="text-center mb-8">
        <button
          onClick={createNewTest}
          disabled={creating}
          className="px-6 py-3 text-sm font-bold rounded-lg transition-all"
          style={{
            backgroundColor: "var(--sticky-blue)",
            color: "var(--ink)",
            opacity: creating ? 0.6 : 1,
          }}
        >
          {creating ? "Creating..." : "Start New Practice Test"}
        </button>
      </div>

      <div className="space-y-4">
        {allTests.length === 0 && (
          <p className="text-center text-sm opacity-60" style={{ color: "var(--ink)" }}>
            No practice tests yet. Click the button above to begin.
          </p>
        )}
        {allTests.map((test) => {
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
                  <h2 className="font-hand text-lg font-bold">Practice Test</h2>
                  <p className="text-xs opacity-70">
                    {test.questions.length} questions | {done ? "Completed" : "Not taken"}
                  </p>
                </div>
                {done ? (
                  <button
                    onClick={() => {
                      if (test.result?.id) router.push(`/mock-test/results/${test.result.id}`);
                    }}
                    className="px-4 py-2 text-sm font-bold rounded-lg"
                    style={{ backgroundColor: "var(--sticky-blue)", color: "var(--ink)" }}
                  >
                    View Results
                  </button>
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

      <div className="mt-10 text-center">
        <button
          onClick={() => router.push("/mock-test/diagnostic")}
          className="px-4 py-2 text-sm font-bold rounded-lg"
          style={{ backgroundColor: "var(--sticky-pink)", color: "var(--ink)" }}
        >
          Back to Diagnostic Hub
        </button>
      </div>
    </main>
  );
}
