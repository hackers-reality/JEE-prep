export type WeaknessEvent = {
  topicId: string;
  subject?: string | null;
  accuracy: number;
  actualSeconds: number;
  expectedSeconds: number;
  confidence?: number | null;
  repeatedMistake?: boolean;
  difficulty?: number;
  occurredAt?: string | number | Date;
};

export type AggregatedWeakness = {
  topicId: string;
  subject: string | null;
  attempts: number;
  accuracy: number;
  avgSeconds: number;
  expectedSeconds: number;
  confidence: number | null;
  slowRate: number;
  mistakeRate: number;
  recentWeight: number;
  risk: number;
  label: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

type WeaknessLabel = AggregatedWeakness["label"];

function recencyWeight(occurredAt?: WeaknessEvent["occurredAt"]) {
  if (!occurredAt) return 0.75;
  const ageDays = Math.max(0, (Date.now() - new Date(occurredAt).getTime()) / 86_400_000);
  return Math.exp(-ageDays / 21);
}

function riskLabel(risk: number): WeaknessLabel {
  if (risk >= 0.75) return "CRITICAL";
  if (risk >= 0.55) return "HIGH";
  if (risk >= 0.35) return "MODERATE";
  return "LOW";
}

export function aggregateWeaknessEvents(events: WeaknessEvent[]): AggregatedWeakness[] {
  const groups = new Map<string, WeaknessEvent[]>();
  for (const event of events) {
    const current = groups.get(event.topicId) ?? [];
    current.push(event);
    groups.set(event.topicId, current);
  }

  return [...groups.entries()].map(([topicId, items]) => {
    const attempts = items.length;
    const accuracy = items.reduce((sum, item) => sum + clamp(item.accuracy), 0) / attempts;
    const avgSeconds = items.reduce((sum, item) => sum + Math.max(0, item.actualSeconds), 0) / attempts;
    const expectedSeconds = items.reduce((sum, item) => sum + Math.max(1, item.expectedSeconds), 0) / attempts;
    const confidenceValues = items.map((item) => item.confidence).filter((value): value is number => typeof value === "number");
    const confidence = confidenceValues.length ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length : null;
    const slowRate = items.filter((item) => item.actualSeconds > item.expectedSeconds * 1.5).length / attempts;
    const mistakeRate = items.filter((item) => item.repeatedMistake).length / attempts;
    const recentWeight = items.reduce((sum, item) => sum + recencyWeight(item.occurredAt), 0) / attempts;
    const speedRisk = clamp((avgSeconds / expectedSeconds - 1) / 1.5);
    const accuracyRisk = 1 - accuracy;
    const confidenceRisk = confidence == null ? 0.25 : clamp(confidence / 5);
    const risk = clamp(accuracyRisk * 0.4 + speedRisk * 0.25 + slowRate * 0.1 + mistakeRate * 0.15 + (1 - recentWeight) * 0.1 + confidenceRisk * 0.05);
    const label = riskLabel(risk);
    return {
      topicId,
      subject: items.find((item) => item.subject)?.subject ?? null,
      attempts,
      accuracy,
      avgSeconds,
      expectedSeconds,
      confidence,
      slowRate,
      mistakeRate,
      recentWeight,
      risk,
      label,
    };
  }).sort((a, b) => b.risk - a.risk);
}
