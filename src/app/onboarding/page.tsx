"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setApiKey } from "@/lib/chat-store";

type PrepStage = "JUST_STARTED_11" | "MID_11" | "COMPLETED_11_STARTING_12" | "IN_12" | "DROP_YEAR_REPEAT";
type SelfLevel = "BEGINNER" | "SOME_FOUNDATION" | "CONFIDENT";
type JeeTarget = "MAIN_ONLY" | "MAIN_AND_ADVANCED";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    nvidiaKey: "",
    prepStage: "" as PrepStage | "",
    jeeTarget: "" as JeeTarget | "",
    preferredDailyHours: "",
    selfRatings: {
      PHYSICS: "" as SelfLevel | "",
      CHEMISTRY: "" as SelfLevel | "",
      MATHEMATICS: "" as SelfLevel | "",
    },
  });

  useEffect(() => {
    fetch("/api/student").then((r) => r.json()).then((data) => {
      if (data?.onboardingComplete) {
        router.push("/dashboard");
      } else if (data?.id) {
        setStudentId(data.id);
      }
    });
  }, [router]);

  const totalSteps = 5; // key, stage, ratings, target, hours

  async function completeOnboarding() {
    if (form.nvidiaKey) setApiKey(form.nvidiaKey);
    await fetch("/api/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: studentId,
        name: form.name || "Student",
        onboardingComplete: true,
        prepStage: form.prepStage,
        jeeTarget: form.jeeTarget,
        preferredDailyHours: form.preferredDailyHours || null,
        selfRatings: [
          { subject: "PHYSICS", level: form.selfRatings.PHYSICS },
          { subject: "CHEMISTRY", level: form.selfRatings.CHEMISTRY },
          { subject: "MATHEMATICS", level: form.selfRatings.MATHEMATICS },
        ],
      }),
    });
    router.push("/mock-test/diagnostic");
  }

  const canProceed = (() => {
    switch (step) {
      case 0: return form.nvidiaKey.trim().length > 0;
      case 1: return form.prepStage !== "";
      case 2: return form.selfRatings.PHYSICS !== "" && form.selfRatings.CHEMISTRY !== "" && form.selfRatings.MATHEMATICS !== "";
      case 3: return form.jeeTarget !== "";
      default: return true;
    }
  })();

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="font-hand text-3xl font-bold mb-2" style={{ color: "var(--ink)" }}>
          Welcome to JEE Prep
        </h1>
        <p className="text-sm opacity-70">Let us set up your learning plan.</p>
      </div>

      <div
        className="rounded-lg p-8 shadow-md"
        style={{
          backgroundColor: "var(--sticky-yellow)",
          borderRadius: "6px 10px 8px 12px",
        }}
      >
        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => i).map((s) => (
            <div
              key={s}
              className="w-3 h-3 rounded-full transition-colors"
              style={{
                backgroundColor: s <= step ? "var(--accent-red)" : "var(--grid-line)",
              }}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-hand text-xl font-bold">Set up NVIDIA NIM AI</h2>
            <p className="text-sm opacity-80 leading-relaxed">
              Your AI doubt-solving chatbot needs an API key from NVIDIA NIM.
              It is free and takes 2 minutes.
            </p>
            <ol className="text-xs space-y-2 bg-white/60 p-4 rounded" style={{ color: "var(--ink)" }}>
              <li><strong>1.</strong> Go to <a href="https://build.nvidia.com" target="_blank" rel="noopener" className="underline font-semibold">build.nvidia.com</a></li>
              <li><strong>2.</strong> Sign up or log in (free account)</li>
              <li><strong>3.</strong> Click on any model and select <em>&ldquo;Get API Key&rdquo;</em></li>
              <li><strong>4.</strong> Copy your key and paste it below</li>
            </ol>
            <input
              type="password"
              value={form.nvidiaKey}
              onChange={(e) => setForm({ ...form, nvidiaKey: e.target.value })}
              placeholder="nvapi-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="w-full px-3 py-2.5 text-sm rounded border font-mono"
              style={{
                borderColor: form.nvidiaKey ? "var(--sticky-green)" : "var(--grid-line)",
                backgroundColor: "white",
                color: "var(--ink)",
              }}
            />
            <p className="text-xs opacity-60">
              Your key stays in your browser. You can change it later in Settings.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-hand text-xl font-bold">What is your current stage?</h2>
            {[
              { value: "JUST_STARTED_11", label: "Just started 11th" },
              { value: "MID_11", label: "Mid-11th" },
              { value: "COMPLETED_11_STARTING_12", label: "Completed 11th, starting 12th" },
              { value: "IN_12", label: "In 12th" },
              { value: "DROP_YEAR_REPEAT", label: "Already in JEE drop year / repeat prep" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm({ ...form, prepStage: opt.value as PrepStage })}
                className="w-full text-left px-4 py-3 rounded text-sm font-semibold transition-all"
                style={{
                  backgroundColor: form.prepStage === opt.value ? "var(--sticky-green)" : "white",
                  border: `2px solid ${form.prepStage === opt.value ? "var(--sticky-green)" : "var(--grid-line)"}`,
                  color: "var(--ink)",
                  borderRadius: "4px",
                  boxShadow: "3px 3px 0 rgba(0,0,0,0.2)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-hand text-xl font-bold">Rate your knowledge per subject</h2>
            {(["PHYSICS", "CHEMISTRY", "MATHEMATICS"] as const).map((subj) => (
              <div key={subj}>
                <p className="font-semibold text-sm mb-2">
                  {subj.charAt(0) + subj.slice(1).toLowerCase()}
                </p>
                <div className="flex gap-2">
                  {[
                    { value: "BEGINNER", label: "Beginner" },
                    { value: "SOME_FOUNDATION", label: "Some Foundation" },
                    { value: "CONFIDENT", label: "Confident" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setForm({
                          ...form,
                          selfRatings: { ...form.selfRatings, [subj]: opt.value as SelfLevel },
                        })
                      }
                      className="flex-1 px-3 py-2 rounded text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: form.selfRatings[subj] === opt.value ? "var(--sticky-blue)" : "white",
                        border: `2px solid ${form.selfRatings[subj] === opt.value ? "var(--sticky-blue)" : "var(--grid-line)"}`,
                        color: "var(--ink)",
                        borderRadius: "4px",
                        boxShadow: "3px 3px 0 rgba(0,0,0,0.2)",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-hand text-xl font-bold">What is your target?</h2>
            {[
              { value: "MAIN_ONLY", label: "JEE Main only" },
              { value: "MAIN_AND_ADVANCED", label: "JEE Main + Advanced" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm({ ...form, jeeTarget: opt.value as JeeTarget })}
                className="w-full text-left px-4 py-3 rounded text-sm font-semibold transition-all"
                style={{
                  backgroundColor: form.jeeTarget === opt.value ? "var(--sticky-green)" : "white",
                  border: `2px solid ${form.jeeTarget === opt.value ? "var(--sticky-green)" : "var(--grid-line)"}`,
                  color: "var(--ink)",
                  borderRadius: "4px",
                  boxShadow: "3px 3px 0 rgba(0,0,0,0.2)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-hand text-xl font-bold">Almost done!</h2>
            <p className="text-sm opacity-70">
              How many hours can you study daily? (optional)
            </p>
            <input
              type="number"
              value={form.preferredDailyHours}
              onChange={(e) => setForm({ ...form, preferredDailyHours: e.target.value })}
              placeholder="e.g. 4"
              className="w-full px-3 py-2 text-sm rounded border"
              style={{
                borderColor: "var(--grid-line)",
                backgroundColor: "white",
                color: "var(--ink)",
                borderRadius: "4px",
              }}
            />
            <p className="text-xs opacity-60 mt-2">
              After saving, you will take 3 diagnostic mock tests to assess your current level.
            </p>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            className="px-4 py-2 text-sm rounded-lg"
            style={{
              backgroundColor: step === 0 ? "var(--grid-line)" : "white",
              color: "var(--ink)",
              visibility: step === 0 ? "hidden" : "visible",
            }}
            disabled={step === 0}
          >
            Back
          </button>
          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className="px-6 py-2 text-sm font-bold rounded-lg transition-all"
              style={{
                backgroundColor: canProceed ? "var(--sticky-blue)" : "var(--grid-line)",
                color: "var(--ink)",
              }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={completeOnboarding}
              className="px-6 py-2 text-sm font-bold rounded-lg transition-all"
              style={{
                backgroundColor: "var(--sticky-green)",
                color: "var(--ink)",
              }}
            >
              Save & Start Diagnostic
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
