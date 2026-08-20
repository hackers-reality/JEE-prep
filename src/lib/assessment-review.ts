export type ReviewClassification = "CORRECT_FAST" | "CORRECT_SLOW" | "INCORRECT_FAST" | "INCORRECT_SLOW" | "UNATTEMPTED";

export type ReviewItem = {
  questionId: string;
  topicId?: string;
  classification: ReviewClassification;
  actualSeconds: number;
  expectedSeconds: number;
  deltaSeconds: number;
  confidence: number | null;
  mistakeType: string | null;
};

export function interventionForReview(item: ReviewItem) {
  switch (item.classification) {
    case "CORRECT_FAST": return "REINFORCE";
    case "CORRECT_SLOW": return "SPEED_PRACTICE";
    case "INCORRECT_FAST": return "ACCURACY_REBUILD";
    case "INCORRECT_SLOW": return "CONCEPT_REBUILD_AND_TIMED_PRACTICE";
    default: return "ATTEMPT_STRATEGY";
  }
}

function severity(item: ReviewItem) {
  const expected = Math.max(1, item.expectedSeconds);
  const timeRatio = Math.max(0, item.actualSeconds) / expected;
  const confidenceRisk = item.confidence == null ? 0.2 : (5 - Math.max(1, Math.min(5, item.confidence))) / 4;
  const mistakeBoost = item.mistakeType ? 0.15 : 0;
  const classBoost = item.classification === "INCORRECT_SLOW" ? 1 : item.classification === "INCORRECT_FAST" ? 0.75 : item.classification === "CORRECT_SLOW" ? 0.45 : 0;
  return classBoost + Math.max(0, timeRatio - 1) * 0.5 + confidenceRisk * 0.2 + mistakeBoost;
}

export function buildReviewQueues(items: ReviewItem[]) {
  return {
    priority: items
      .filter((item) => item.classification === "INCORRECT_SLOW" || item.classification === "INCORRECT_FAST")
      .sort((a, b) => severity(b) - severity(a)),
    speed: items
      .filter((item) => item.classification === "CORRECT_SLOW")
      .sort((a, b) => severity(b) - severity(a)),
    reinforcement: items
      .filter((item) => item.classification === "CORRECT_FAST")
      .sort((a, b) => severity(b) - severity(a)),
    unattempted: items.filter((item) => item.classification === "UNATTEMPTED"),
  };
}
