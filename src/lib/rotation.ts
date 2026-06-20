// Deterministic rotation based on string seed, for hydration-safe styling
export function deterministicRotation(seed: string, magnitude = 3): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return ((hash % 100) / 100 - 0.5) * magnitude;
}
