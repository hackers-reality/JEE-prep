import type { ReviewItem } from "./assessment-review";

export type AssessmentAnalytics = {
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  totalActualSeconds: number;
  totalExpectedSeconds: number;
  timeRatio: number | null;
  averageActualSeconds: number;
  averageExpectedSeconds: number;
  slowQuestions: number;
  criticalSlowQuestions: number;
  byTopic: Array<{
    topicId: string;
    attempted: number;
    correct: number;
    accuracy: number;
    actualSeconds: number;
    expectedSeconds: number;
    timeRatio: number | null;
    incorrectCount: number;
    slowCount: number;
  }>;
};

export function buildAssessmentAnalytics(items: ReviewItem[]): AssessmentAnalytics {
  const attemptedItems = items.filter((item) => item.classification !== "UNATTEMPTED");
  const correct = attemptedItems.filter((item) => item.classification === "CORRECT_FAST" || item.classification === "CORRECT_SLOW").length;
  const incorrect = attemptedItems.length - correct;
  const totalActualSeconds = attemptedItems.reduce((sum, item) => sum + Math.max(0, item.actualSeconds), 0);
  const totalExpectedSeconds = attemptedItems.reduce((sum, item) => sum + Math.max(0, item.expectedSeconds), 0);
  const slowQuestions = attemptedItems.filter((item) => item.expectedSeconds > 0 && item.actualSeconds > item.expectedSeconds).length;
  const criticalSlowQuestions = attemptedItems.filter((item) => item.expectedSeconds > 0 && item.actualSeconds > item.expectedSeconds * 1.5).length;

  const topicMap = new Map<string, { attempted: number; correct: number; actualSeconds: number; expectedSeconds: number; incorrectCount: number; slowCount: number }>();
  for (const item of attemptedItems) {
    const topicId = item.topicId ?? "UNMAPPED";
    const entry = topicMap.get(topicId) ?? { attempted: 0, correct: 0, actualSeconds: 0, expectedSeconds: 0, incorrectCount: 0, slowCount: 0 };
    entry.attempted += 1;
    entry.correct += item.classification === "CORRECT_FAST" || item.classification === "CORRECT_SLOW" ? 1 : 0;
    entry.actualSeconds += Math.max(0, item.actualSeconds);
    entry.expectedSeconds += Math.max(0, item.expectedSeconds);
    entry.incorrectCount += item.classification === "INCORRECT_FAST" || item.classification === "INCORRECT_SLOW" ? 1 : 0;
    entry.slowCount += item.expectedSeconds > 0 && item.actualSeconds > item.expectedSeconds ? 1 : 0;
    topicMap.set(topicId, entry);
  }

  const byTopic = Array.from(topicMap, ([topicId, entry]) => ({
    topicId,
    ...entry,
    accuracy: entry.attempted ? entry.correct / entry.attempted : 0,
    timeRatio: entry.expectedSeconds > 0 ? entry.actualSeconds / entry.expectedSeconds : null,
  })).sort((a, b) => {
    const accuracyGap = (1 - b.accuracy) - (1 - a.accuracy);
    if (Math.abs(accuracyGap) > 0.05) return accuracyGap;
    return (b.timeRatio ?? 0) - (a.timeRatio ?? 0);
  });

  return {
    totalQuestions: items.length,
    attempted: attemptedItems.length,
    correct,
    incorrect,
    accuracy: attemptedItems.length ? correct / attemptedItems.length : 0,
    totalActualSeconds,
    totalExpectedSeconds,
    timeRatio: totalExpectedSeconds > 0 ? totalActualSeconds / totalExpectedSeconds : null,
    averageActualSeconds: attemptedItems.length ? totalActualSeconds / attemptedItems.length : 0,
    averageExpectedSeconds: attemptedItems.length ? totalExpectedSeconds / attemptedItems.length : 0,
    slowQuestions,
    criticalSlowQuestions,
    byTopic,
  };
}
