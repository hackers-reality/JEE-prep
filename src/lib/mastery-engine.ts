export type MasteryEvidence = {
  accuracy: number;
  recentAccuracy: number;
  avgSeconds: number | null;
  expectedSeconds: number | null;
  confidence: number | null;
  repeatedMistakes: number;
  attempts: number;
  lastSeenDays: number | null;
};

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

/**
 * Evidence-based mastery score. This is deliberately not a raw correct/seen ratio:
 * recent performance, speed, error recurrence, confidence and evidence volume all matter.
 */
export function scoreMastery(evidence: MasteryEvidence) {
  const volume = clamp(evidence.attempts / 10);
  const accuracy = clamp(evidence.accuracy);
  const recency = clamp(evidence.recentAccuracy);
  const speed = evidence.avgSeconds == null || evidence.expectedSeconds == null
    ? 0.5
    : clamp(evidence.expectedSeconds / Math.max(1, evidence.avgSeconds));
  const confidence = evidence.confidence == null ? 0.5 : clamp(evidence.confidence / 5);
  const errorPenalty = clamp(evidence.repeatedMistakes / Math.max(1, evidence.attempts));
  const freshness = evidence.lastSeenDays == null ? 0 : clamp(1 - evidence.lastSeenDays / 30);

  const raw =
    accuracy * 0.34 +
    recency * 0.24 +
    speed * 0.14 +
    confidence * 0.08 +
    freshness * 0.08 +
    volume * 0.12 -
    errorPenalty * 0.2;

  return Math.round(clamp(raw) * 100) / 100;
}

export function masteryState(score: number) {
  if (score >= 0.85) return "MASTERED" as const;
  if (score >= 0.65) return "DEVELOPING" as const;
  if (score >= 0.4) return "WEAK" as const;
  return "UNSEEN" as const;
}

export function shouldRequireVerification(score: number, attempts: number) {
  return attempts < 3 || score < 0.65;
}
