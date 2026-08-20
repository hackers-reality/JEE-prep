export type ArchitectureGateStatus = "BLOCKED" | "READY";

export type ArchitectureGateResult = {
  status: ArchitectureGateStatus;
  blockers: string[];
};

/**
 * Content population is intentionally blocked until the platform engines
 * and their cross-system contracts are production-ready.
 */
export function evaluateArchitectureGate(checks: {
  buildPassing: boolean;
  automatedTestsPassing: boolean;
  e2ePassing: boolean;
  migrationsCompatible: boolean;
  productionReady: boolean;
  smokeTestPassing: boolean;
  legacyDependenciesClear: boolean;
}): ArchitectureGateResult {
  const blockers: string[] = [];
  if (!checks.buildPassing) blockers.push("BUILD");
  if (!checks.automatedTestsPassing) blockers.push("AUTOMATED_TESTS");
  if (!checks.e2ePassing) blockers.push("E2E_TESTS");
  if (!checks.migrationsCompatible) blockers.push("DATABASE_COMPATIBILITY");
  if (!checks.productionReady) blockers.push("PRODUCTION_DEPLOYMENT");
  if (!checks.smokeTestPassing) blockers.push("PRODUCTION_SMOKE_TEST");
  if (!checks.legacyDependenciesClear) blockers.push("LEGACY_DEPENDENCIES");

  return {
    status: blockers.length === 0 ? "READY" : "BLOCKED",
    blockers,
  };
}
