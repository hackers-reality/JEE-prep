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

export function buildReviewQueues(items: ReviewItem[]) {
  return {
    priority: items
      .filter((item) => item.classification === "INCORRECT_SLOW" || item.classification === "INCORRECT_FAST")
      .sort((a, b) => (b.deltaSeconds - a.deltaSeconds)),
    speed: items
      .filter((item) => item.classification === "CORRECT_SLOW")
      .sort((a, b) => b.deltaSeconds - a.deltaSeconds),
    reinforcement: items.filter((item) => item.classification === "CORRECT_FAST"),
    unattempted: items.filter((item) => item.classification === "UNATTEMPTED"),
  };
}
