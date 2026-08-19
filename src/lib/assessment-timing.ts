export type QuestionTiming = { questionId: string; startedAt: number; submittedAt: number; expectedSeconds: number; isCorrect: boolean | null };
export type TimingInsight = { questionId: string; actualSeconds: number; expectedSeconds: number; deltaSeconds: number; ratio: number; classification: "FAST_ACCURATE" | "SLOW_ACCURATE" | "FAST_INACCURATE" | "SLOW_INACCURATE" | "UNATTEMPTED" };

export function questionSeconds(timing: QuestionTiming) { return Math.max(0, Math.round((timing.submittedAt - timing.startedAt) / 1000)); }

export function classifyQuestionTiming(timing: QuestionTiming): TimingInsight {
  const actualSeconds = questionSeconds(timing);
  const ratio = actualSeconds / Math.max(1, timing.expectedSeconds);
  if (timing.isCorrect === null) return { questionId: timing.questionId, actualSeconds, expectedSeconds: timing.expectedSeconds, deltaSeconds: actualSeconds - timing.expectedSeconds, ratio, classification: "UNATTEMPTED" };
  const slow = ratio > 1.5;
  return { questionId: timing.questionId, actualSeconds, expectedSeconds: timing.expectedSeconds, deltaSeconds: actualSeconds - timing.expectedSeconds, ratio, classification: timing.isCorrect ? (slow ? "SLOW_ACCURATE" : "FAST_ACCURATE") : (slow ? "SLOW_INACCURATE" : "FAST_INACCURATE") };
}

export function summarizeTiming(timings: QuestionTiming[], testStartedAt: number, testEndedAt: number) {
  const insights = timings.map(classifyQuestionTiming);
  const totalSeconds = Math.max(0, Math.round((testEndedAt - testStartedAt) / 1000));
  const slowest = [...insights].sort((a, b) => b.ratio - a.ratio).slice(0, 5);
  const slowestCorrect = insights.filter((i) => i.classification === "SLOW_ACCURATE").sort((a, b) => b.ratio - a.ratio).slice(0, 5);
  const slowestIncorrect = insights.filter((i) => i.classification === "SLOW_INACCURATE").sort((a, b) => b.ratio - a.ratio).slice(0, 5);
  return { totalSeconds, insights, slowest, slowestCorrect, slowestIncorrect };
}
