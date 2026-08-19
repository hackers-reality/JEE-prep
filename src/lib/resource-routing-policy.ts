export type ResourceVerificationState = "VERIFIED" | "REVIEW_REQUIRED" | "UNVERIFIED";

export type RoutedResource = {
  id: string;
  title: string;
  kind: string;
  topicIds: string[];
  deepLink: string;
  verification: ResourceVerificationState;
  qualityScore?: number;
  jeeMain?: boolean;
  jeeAdvanced?: boolean;
};

export function filterVerifiedResources(resources: RoutedResource[]) {
  return resources.filter((resource) => resource.verification === "VERIFIED");
}

export function selectSafeResource(resources: RoutedResource[], topicId: string) {
  const verified = filterVerifiedResources(resources).filter((resource) => resource.topicIds.includes(topicId));
  return verified.sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0))[0] ?? null;
}

export function navigationFallback(topicTitle: string) {
  return `I couldn't find a verified resource for ${topicTitle} yet, so I won't send you to a placeholder or unreviewed page.`;
}
