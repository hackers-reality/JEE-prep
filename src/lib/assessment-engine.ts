export type AttemptStatus = "UNATTEMPTED" | "ANSWERED" | "SUBMITTED";
export type MistakeType = "CONCEPT" | "CALCULATION" | "READING" | "TIME" | "GUESS" | "NONE";

export type QuestionAttempt = {
  questionId: string;
  topicId?: string;
  startedAt?: number;
  submittedAt?: number;
  expectedSeconds?: number;
  isCorrect: boolean | null;
  confidence?: number;
  mistakeType?: MistakeType;
  status: AttemptStatus;
};

export type TestAssessment = {
  totalSeconds: number;
  remainingSeconds: number;
  questionAttempts: QuestionAttempt[];
};

export function activeSeconds(attempt: QuestionAttempt): number {
  if (!attempt.startedAt || !attempt.submittedAt) return 0;
  return Math.max(0, Math.round((attempt.submittedAt - attempt.startedAt) / 1000));
}

export function classifyAttempt(attempt: QuestionAttempt) {
  if (attempt.isCorrect === null) return "UNATTEMPTED" as const;
  const actual = activeSeconds(attempt);
  const expected = Math.max(1, attempt.expectedSeconds ?? 120);
  const slow = actual > expected * 1.5;
  return attempt.isCorrect ? (slow ? "SLOW_ACCURATE" : "FAST_ACCURATE") : (slow ? "SLOW_INACCURATE" : "FAST_INACCURATE");
}

export function buildAssessmentInsights(assessment: TestAssessment) {
  const insights = assessment.questionAttempts.map((attempt) => ({
    questionId: attempt.questionId,
    topicId: attempt.topicId,
    actualSeconds: activeSeconds(attempt),
    expectedSeconds: Math.max(1, attempt.expectedSeconds ?? 120),
    classification: classifyAttempt(attempt),
    confidence: attempt.confidence ?? null,
    mistakeType: attempt.mistakeType ?? null,
  }));

  const timeSinks = insights
    .filter((item) => item.actualSeconds > item.expectedSeconds)
    .sort((a, b) => b.actualSeconds / b.expectedSeconds - a.actualSeconds / a.expectedSeconds);

  const counts = insights.reduce<Record<string, number>>((acc, item) => {
    acc[item.classification] = (acc[item.classification] ?? 0) + 1;
    return acc;
  }, {});

  return { totalSeconds: assessment.totalSeconds, remainingSeconds: Math.max(0, assessment.remainingSeconds), insights, timeSinks, counts };
}

export function shouldFlagForWeakness(attempt: QuestionAttempt): boolean {
  const classification = classifyAttempt(attempt);
  return classification === "SLOW_INACCURATE" || classification === "FAST_INACCURATE" || Boolean(attempt.mistakeType && attempt.mistakeType !== "NONE");
}
