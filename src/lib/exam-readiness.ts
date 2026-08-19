export type EvidenceState = "UNSEEN" | "WEAK" | "STALE" | "MASTERED";

export type ExamTopicEvidence = {
  topicId: string;
  state: EvidenceState;
  mastery: number;
  lastSeenAt?: string | null;
  attempts: number;
  recentAccuracy?: number | null;
  avgSeconds?: number | null;
  expectedSeconds?: number | null;
  repeatedMistakes?: number;
};

export type ExamPlanningCandidate = ExamTopicEvidence & {
  urgency: number;
  priority: number;
  recommendedMode: "LEARN" | "REPAIR" | "REFRESH" | "PRACTICE" | "TIMED_PRACTICE";
};

export function classifyEvidence(evidence: ExamTopicEvidence, now = Date.now()): EvidenceState {
  if (evidence.attempts <= 0) return "UNSEEN";
  const staleDays = evidence.lastSeenAt ? (now - new Date(evidence.lastSeenAt).getTime()) / 86_400_000 : Infinity;
  if (evidence.mastery < 0.6) return "WEAK";
  if (staleDays > 30) return "STALE";
  if ((evidence.repeatedMistakes ?? 0) > 0 && (evidence.recentAccuracy ?? 1) < 0.8) return "WEAK";
  return "MASTERED";
}

export function rankExamTopic(evidence: ExamTopicEvidence, daysUntilExam: number, now = Date.now()): ExamPlanningCandidate {
  const state = classifyEvidence(evidence, now);
  const masteryGap = Math.max(0, 1 - evidence.mastery);
  const timePressure = Math.max(0, 1 - daysUntilExam / 30);
  const urgency = Math.min(1, timePressure * 0.65 + masteryGap * 0.35);
  let priority = urgency;
  let recommendedMode: ExamPlanningCandidate["recommendedMode"] = "PRACTICE";

  if (state === "UNSEEN") { priority += 1; recommendedMode = "LEARN"; }
  else if (state === "WEAK") { priority += 0.85; recommendedMode = evidence.expectedSeconds && evidence.avgSeconds && evidence.avgSeconds > evidence.expectedSeconds * 1.5 ? "REPAIR" : "REPAIR"; }
  else if (state === "STALE") { priority += 0.45; recommendedMode = "REFRESH"; }
  else if (evidence.avgSeconds && evidence.expectedSeconds && evidence.avgSeconds > evidence.expectedSeconds * 1.5) { priority += 0.35; recommendedMode = "TIMED_PRACTICE"; }

  return { ...evidence, state, urgency, priority, recommendedMode };
}

export function rankExamTopics(evidence: ExamTopicEvidence[], daysUntilExam: number, now = Date.now()) {
  return evidence.map((item) => rankExamTopic(item, daysUntilExam, now)).sort((a, b) => b.priority - a.priority);
}

export function shouldAllocateFullTheory(candidate: ExamPlanningCandidate) {
  return candidate.state === "UNSEEN" || candidate.state === "WEAK";
}

export function planningNote(candidate: ExamPlanningCandidate) {
  switch (candidate.state) {
    case "UNSEEN": return "New coverage required before this exam.";
    case "WEAK": return "Weak evidence: allocate learning/repair before heavy practice.";
    case "STALE": return "Previously learned but stale: refresh and verify rather than reteach by default.";
    default: return "Recent strong evidence: prioritize retrieval/practice unless new evidence shows decay.";
  }
}
