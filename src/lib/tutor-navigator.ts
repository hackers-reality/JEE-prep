export type NavigatorRequest = {
  text: string;
  currentSubject?: string | null;
  currentTopicId?: string | null;
  currentPath?: string | null;
};

export type NavigatorTarget = {
  topicId: string;
  reason: string;
  route: string;
  preferredResource?: string | null;
};

const TOPIC_ALIASES: Record<string, string> = {
  kinematics: "kinematics",
  "motion in a straight line": "kinematics",
  "motion in a plane": "kinematics",
  vectors: "vectors",
  "newton laws": "laws of motion",
  "newton's laws": "laws of motion",
  mechanics: "mechanics",
  thermodynamics: "thermodynamics",
  electrostatics: "electrostatics",
  "current electricity": "current electricity",
  rotation: "rotational motion",
  "rotational motion": "rotational motion",
  mole: "mole concept",
  "mole concept": "mole concept",
  goc: "general organic chemistry",
  "general organic chemistry": "general organic chemistry",
  calculus: "calculus",
  limits: "limits and continuity",
  differentiation: "differentiation",
  integration: "integration",
};

export function extractTopicHint(text: string): string | null {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s']/g, " ").replace(/\s+/g, " ").trim();
  const match = Object.keys(TOPIC_ALIASES)
    .sort((a, b) => b.length - a.length)
    .find((alias) => normalized.includes(alias));
  return match ? TOPIC_ALIASES[match] : null;
}

export function buildNavigatorTarget(request: NavigatorRequest): NavigatorTarget | null {
  const topicId = request.currentTopicId ?? extractTopicHint(request.text);
  if (!topicId) return null;
  const route = `/topics/${encodeURIComponent(topicId)}`;
  return {
    topicId,
    route,
    preferredResource: null,
    reason: request.currentTopicId ? "Keeping you on the topic you are currently studying." : `Opened the JEE topic that best matches “${topicId}”.`,
  };
}
