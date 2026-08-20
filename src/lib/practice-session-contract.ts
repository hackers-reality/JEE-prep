export type PracticeSessionMode = "PRACTICE" | "TIMED" | "EXAM_SIMULATION" | "MASTERY_CHECK";

export type PracticeQuestionTelemetry = {
  problemId: string;
  topicId: string | null;
  startedAt: string;
  submittedAt: string | null;
  timeSeconds: number;
  expectedSeconds: number;
  isCorrect: boolean | null;
  confidence: number | null;
  mistakeType: string | null;
};

export type PracticeSessionSummary = {
  answered: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  totalTimeSeconds: number;
  expectedTimeSeconds: number;
  timeRatio: number | null;
  slowQuestions: string[];
  weakTopics: string[];
};

export function summarizePracticeSession(items: PracticeQuestionTelemetry[]): PracticeSessionSummary {
  const answeredItems = items.filter((item) => item.isCorrect !== null);
  const correct = answeredItems.filter((item) => item.isCorrect === true).length;
  const incorrect = answeredItems.length - correct;
  const totalTimeSeconds = answeredItems.reduce((sum, item) => sum + Math.max(0, item.timeSeconds), 0);
  const expectedTimeSeconds = answeredItems.reduce((sum, item) => sum + Math.max(0, item.expectedSeconds), 0);
  const slowQuestions = answeredItems
    .filter((item) => item.expectedSeconds > 0 && item.timeSeconds / item.expectedSeconds >= 1.5)
    .map((item) => item.problemId);
  const weakTopicCounts = new Map<string, number>();
  for (const item of answeredItems) {
    if (!item.topicId) continue;
    const slow = item.expectedSeconds > 0 && item.timeSeconds / item.expectedSeconds >= 1.5;
    const weak = item.isCorrect === false || slow;
    if (weak) weakTopicCounts.set(item.topicId, (weakTopicCounts.get(item.topicId) ?? 0) + 1);
  }
  const weakTopics = [...weakTopicCounts.entries()].sort((a, b) => b[1] - a[1]).map(([topicId]) => topicId);
  return {
    answered: answeredItems.length,
    correct,
    incorrect,
    accuracy: answeredItems.length ? correct / answeredItems.length : 0,
    totalTimeSeconds,
    expectedTimeSeconds,
    timeRatio: expectedTimeSeconds > 0 ? totalTimeSeconds / expectedTimeSeconds : null,
    slowQuestions,
    weakTopics,
  };
}
