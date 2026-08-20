# Architecture E2E Test Matrix

The platform is not architecture-complete until these end-to-end flows work across real persisted data.

## Student lifecycle
- Register -> login -> profile -> onboarding -> dashboard.
- Logout -> protected routes reject access -> login restores access.
- Cross-device/session refresh preserves student-owned state.

## AI/BYOK
- Browser-provided BYOK key is used without persistence on the server.
- JEE tutor prompt is shared across AI entry points.
- AI proposal cannot directly mutate deterministic schedule/mastery state.
- AI failure leaves deterministic data unchanged.

## Practice
- Open problem -> start timing -> answer -> submit -> attempt persisted.
- Correct/incorrect + active time + confidence + mistake type reach mastery.
- Repeated attempts do not duplicate or corrupt history.

## Timed assessment
- Start timed assessment -> timer -> navigation -> autosave -> reload recovery.
- Finish -> freeze attempt -> generate per-question review.
- Review contains actual time, expected time, classification and intervention.
- Completed assessment contributes to cross-assessment weakness.

## Weakness/mastery
- Practice and tests both contribute evidence.
- Accuracy, speed, confidence, recency and repeated mistakes produce topic signals.
- Weakness intervention can create practice/revision/schedule actions.
- Mastery updates do not erase historical evidence.

## Schedule
- Student profile -> constraints -> deterministic schedule generation.
- Fixed commitments never get silently overwritten.
- Exam date + syllabus -> canonical topic mapping -> readiness -> priority -> schedule.
- Mastery-gated topic removal requires validation threshold >90%.
- Major AI schedule change shows preview and requires confirmation.
- Completed historical blocks remain unchanged during future regeneration.

## Tutor Navigator
- Student asks about a topic from any supported page.
- Topic resolves to canonical graph.
- Navigator only recommends populated/verified resources.
- Deep link preserves relevant context.
- Missing resource produces an honest fallback rather than a fabricated link.

## Content
- Source provenance survives ingestion.
- Content verification stages cannot be skipped.
- Unverified content cannot be routed as authoritative.
- External source links remain attached to imported/discovered questions.

## Legacy cleanup
- Main dashboard does not route into obsolete diagnostic tests.
- Empty/dead content routes are not presented as functional features.
- New architecture does not depend on old route-level content implementations.

## Release gate
1. Typecheck/build passes.
2. Automated unit/integration tests pass.
3. E2E matrix passes for critical flows.
4. Database schema/runtime schema remain compatible.
5. Vercel production deployment is READY.
6. Production smoke test passes.
7. No new legacy dependency is introduced.
