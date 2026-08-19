export type PerformanceSignal = {
  topicId: string;
  accuracy: number;
  avgSeconds: number;
  expectedSeconds: number;
  confidence: number | null;
  difficulty: number;
  recentAttempts: number;
  repeatedMistakes: number;
};

export type WeaknessScore = PerformanceSignal & {
  speedRisk: number;
  accuracyRisk: number;
  confidenceRisk: number;
  consistencyRisk: number;
  freshnessRisk: number;
  overallRisk: number;
  label: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
};

function clamp(value: number) { return Math.max(0, Math.min(1, value)); }

export function scoreWeakness(signal: PerformanceSignal): WeaknessScore {
  const speedRisk = clamp((signal.avgSeconds / Math.max(1, signal.expectedSeconds) - 1) / 1.5);
  const accuracyRisk = clamp(1 - signal.accuracy);
  const confidenceRisk = signal.confidence == null ? 0.25 : clamp(signal.confidence / 5);
  const consistencyRisk = clamp(signal.repeatedMistakes / Math.max(1, signal.recentAttempts));
  const freshnessRisk = clamp(1 - Math.min(signal.recentAttempts / 8, 1));
  const overallRisk = clamp(
    accuracyRisk * 0.35 + speedRisk * 0.25 + consistencyRisk * 0.2 + confidenceRisk * 0.1 + freshnessRisk * 0.1,
  );
  const label = overallRisk >= 0.75 ? "CRITICAL" : overallRisk >= 0.55 ? "HIGH" : overallRisk >= 0.35 ? "MODERATE" : "LOW";
  return { ...signal, speedRisk, accuracyRisk, confidenceRisk, consistencyRisk, freshnessRisk, overallRisk, label };
}

export function rankWeaknesses(signals: PerformanceSignal[]) {
  return signals.map(scoreWeakness).sort((a, b) => b.overallRisk - a.overallRisk);
}

export function interventionForWeakness(score: WeaknessScore) {
  if (score.accuracyRisk > 0.55 && score.speedRisk > 0.45) return "CONCEPT_REBUILD";
  if (score.accuracyRisk > 0.55) return "TARGETED_PRACTICE";
  if (score.speedRisk > 0.45) return "TIMED_PRACTICE";
  if (score.consistencyRisk > 0.4) return "ERROR_PATTERN_REVIEW";
  if (score.freshnessRisk > 0.5) return "REVISION";
  return "REINFORCE";
}
