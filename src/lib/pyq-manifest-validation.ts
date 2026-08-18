import { OFFICIAL_PYQ_MANIFEST, type PYQSource } from "./pyq-manifest";

export function validatePYQManifest(manifest: PYQSource[] = OFFICIAL_PYQ_MANIFEST): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const source of manifest) {
    const key = [source.exam, source.year, source.paper, source.session ?? "", source.shift ?? ""].join("|");
    if (seen.has(key)) errors.push(`duplicate manifest entry: ${key}`);
    seen.add(key);
    if (source.authority !== "OFFICIAL") errors.push(`${key}: authority must be OFFICIAL`);
    if (source.verification === "VERIFIED_FINAL_KEY" && (!source.sourceUrl || !source.answerKeyUrl)) {
      errors.push(`${key}: verified sources require both paper and answer-key URLs`);
    }
    for (const [name, url] of [["sourceUrl", source.sourceUrl], ["answerKeyUrl", source.answerKeyUrl]] as const) {
      try { new URL(url); } catch { errors.push(`${key}: ${name} is not a valid URL`); }
    }
  }

  return errors;
}

export function assertValidPYQManifest(manifest: PYQSource[] = OFFICIAL_PYQ_MANIFEST) {
  const errors = validatePYQManifest(manifest);
  if (errors.length) throw new Error(`Invalid PYQ manifest:\n${errors.join("\n")}`);
  return true;
}
