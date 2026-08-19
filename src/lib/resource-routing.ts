export type ResourceCandidate = {
  id: string;
  title: string;
  kind: "BOOK" | "CHAPTER" | "TOPIC" | "EXAMPLE" | "PRACTICE" | "PYQ";
  topicIds: string[];
  subject?: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS";
  classLevel?: "CLASS_11" | "CLASS_12" | "JEE_ADVANCED_ONLY";
  jeeMain: boolean;
  jeeAdvanced: boolean;
  difficulty?: "FOUNDATION" | "MAIN" | "ADVANCED";
  deepLink: string;
  qualityScore?: number;
};

export type ResourceRoutingContext = {
  topicId: string;
  target: "MAIN" | "ADVANCED" | "MAIN_AND_ADVANCED";
  difficulty?: "FOUNDATION" | "MAIN" | "ADVANCED";
  preferredSubject?: ResourceCandidate["subject"];
};

function targetAllowed(resource: ResourceCandidate, target: ResourceRoutingContext["target"]) {
  if (target === "MAIN") return resource.jeeMain;
  if (target === "ADVANCED") return resource.jeeAdvanced;
  return resource.jeeMain || resource.jeeAdvanced;
}

function difficultyFit(resource: ResourceCandidate, requested?: ResourceRoutingContext["difficulty"]) {
  if (!requested || !resource.difficulty) return 0;
  const order = { FOUNDATION: 0, MAIN: 1, ADVANCED: 2 } as const;
  return 1 - Math.min(2, Math.abs(order[resource.difficulty] - order[requested])) / 2;
}

export function rankResources(candidates: ResourceCandidate[], context: ResourceRoutingContext) {
  return candidates
    .filter((resource) => resource.topicIds.includes(context.topicId))
    .filter((resource) => targetAllowed(resource, context.target))
    .filter((resource) => !context.preferredSubject || !resource.subject || resource.subject === context.preferredSubject)
    .map((resource) => ({
      resource,
      score:
        (resource.qualityScore ?? 0.5) * 0.45 +
        difficultyFit(resource, context.difficulty) * 0.25 +
        (resource.kind === "TOPIC" ? 0.1 : resource.kind === "CHAPTER" ? 0.08 : 0.05) +
        (resource.jeeAdvanced && context.target !== "MAIN" ? 0.1 : 0),
    }))
    .sort((a, b) => b.score - a.score);
}

export function chooseBestResource(candidates: ResourceCandidate[], context: ResourceRoutingContext) {
  return rankResources(candidates, context)[0]?.resource ?? null;
}

export function buildTutorNavigation(resource: ResourceCandidate | null, topicTitle: string) {
  if (!resource) {
    return {
      kind: "NO_RESOURCE" as const,
      message: `I couldn't find a verified resource for ${topicTitle} yet. Stay with me here and we'll work through the concept directly.`,
    };
  }
  return {
    kind: "OPEN_RESOURCE" as const,
    title: resource.title,
    deepLink: resource.deepLink,
    message: `No worries, I got you. I opened ${resource.title} for ${topicTitle}. Review it there, and ask me anything here while you study.`,
  };
}
