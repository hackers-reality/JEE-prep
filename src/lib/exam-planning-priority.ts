export type ExamTopicEvidence = {
  topicId: string;
  status: "UNSEEN" | "WEAK" | "STALE" | "MASTERED";
  mastery: number;
  recencyDays: number | null;
  timeRatio: number | null;
  examDaysRemaining: number;
};

export type ExamTopicPriority = ExamTopicEvidence & {
  priority: number;
  action: "LEARN" | "REPAIR" | "REFRESH" | "RETRIEVE";
};

export function rankExamTopics(items: ExamTopicEvidence[]): ExamTopicPriority[] {
  return items
    .map((item): ExamTopicPriority => {
      const urgency = item.examDaysRemaining <= 3 ? 1 : item.examDaysRemaining <= 7 ? 0.8 : item.examDaysRemaining <= 14 ? 0.6 : 0.35;
      const masteryGap = Math.max(0, 1 - item.mastery);
      const staleBoost = item.status === "STALE" ? 0.3 : 0;
      const weakBoost = item.status === "WEAK" ? 0.45 : item.status === "UNSEEN" ? 0.65 : 0;
      const speedPenalty = item.timeRatio !== null && item.timeRatio > 1.5 ? 0.25 : 0;
      const priority = urgency + masteryGap + staleBoost + weakBoost + speedPenalty;
      const action: ExamTopicPriority["action"] = item.status === "UNSEEN" ? "LEARN" : item.status === "WEAK" ? "REPAIR" : item.status === "STALE" ? "REFRESH" : "RETRIEVE";
      return { ...item, priority, action };
    })
    .sort((a, b) => b.priority - a.priority);
}
