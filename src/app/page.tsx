"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "seeding" | "ready" | "failed">("loading");

  useEffect(() => {
    (async () => {
      try {
        // Check if student exists and onboarding is done
        const student = await fetch("/api/student").then((r) => r.json());
        if (student?.onboardingComplete) {
          setStatus("ready");
          return;
        }
        if (student?.id && !student.onboardingComplete) {
          router.push("/onboarding");
          return;
        }
      } catch {}

      // No student — check DB setup
      try {
        const setup = await fetch("/api/setup").then((r) => r.json());
        if (setup.status === "seeding") {
          setStatus("seeding");
          // Poll until done
          const poll = setInterval(async () => {
            const s = await fetch("/api/setup").then((r) => r.json());
            if (s.status === "done") {
              clearInterval(poll);
              router.push("/onboarding");
            }
          }, 2000);
        } else if (setup.status === "done") {
          router.push("/onboarding");
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    })();
  }, [router]);

  if (status === "loading" || status === "seeding") {
    return (
      <main className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="font-hand text-4xl font-bold mb-4" style={{ color: "var(--ink)" }}>
          JEE Prep
        </h1>
        <div className="text-sm" style={{ color: "var(--ink)" }}>
          {status === "seeding" ? (
            <span className="animate-pulse">Setting up your content for the first time...</span>
          ) : (
            "Loading..."
          )}
        </div>
        {status === "seeding" && (
          <div className="mt-6 w-64 text-xs text-center opacity-60" style={{ color: "var(--ink)" }}>
            <div>This happens once. Please wait a moment.</div>
            <div className="mt-2 flex justify-center gap-1">
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--sticky-yellow)", animationDelay: "0s" }} />
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--sticky-blue)", animationDelay: "0.2s" }} />
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--sticky-green)", animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
      </main>
    );
  }

  if (status === "failed") {
    return (
      <main className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="font-hand text-4xl font-bold mb-4" style={{ color: "var(--ink)" }}>
          JEE Prep
        </h1>
        <p className="text-sm mb-6 opacity-70">Could not set up the database automatically.</p>
        <button
          onClick={() => { setStatus("loading"); fetch("/api/setup").then(r => r.json()).then(d => { if (d.status === "done") { setStatus("ready"); router.push("/onboarding"); } else if (d.status === "seeding") { setStatus("seeding"); const poll = setInterval(async () => { const s = await fetch("/api/setup").then(r => r.json()); if (s.status === "done") { clearInterval(poll); router.push("/onboarding"); } }, 2000); } else { setStatus("failed"); } }); }}
          className="px-6 py-3 text-sm font-bold transition-all duration-200"
          style={{
            backgroundColor: "var(--sticky-yellow)",
            color: "var(--ink)",
            borderRadius: "4px",
            boxShadow: "5px 5px 0 rgba(0,0,0,0.25)",
          }}
        >
          Retry Setup
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[80vh]">
      <h1
        className="font-hand text-5xl font-bold mb-4 text-center"
        style={{ color: "var(--ink)" }}
      >
        JEE Prep
      </h1>
      <p className="text-lg mb-8 text-center opacity-70 font-body">
        Physics • Chemistry • Mathematics
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/subjects"
          className="inline-block px-8 py-4 text-lg font-hand font-bold transition-all duration-200 hover:-translate-y-1"
          style={{
            backgroundColor: "var(--sticky-yellow)",
            color: "var(--ink)",
            borderRadius: "4px",
            boxShadow: "5px 5px 0 rgba(0,0,0,0.25)",
          }}
        >
          Start Learning
        </Link>
        <Link
          href="/settings"
          className="inline-block px-8 py-4 text-lg font-hand font-bold transition-all duration-200 hover:-translate-y-1"
          style={{
            backgroundColor: "var(--sticky-blue)",
            color: "var(--ink)",
            borderRadius: "4px",
            boxShadow: "5px 5px 0 rgba(0,0,0,0.25)",
          }}
        >
          Settings
        </Link>
      </div>
    </main>
  );
}
