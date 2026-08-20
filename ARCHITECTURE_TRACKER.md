# Architecture Tracker

This is the working gate for the platform. It intentionally spans all major systems instead of optimizing only the schedule feature.

## P0 — Core platform
- [ ] Remove legacy paths/buttons from primary UX
- [ ] Canonical routing/content graph
- [ ] Browser-side BYOK only; no persisted provider secrets
- [ ] Authentication/session reliability
- [ ] Student profile/preferences persistence
- [ ] Error/loading/empty-state UX

## AI platform
- [ ] Shared JEE tutor system prompt
- [ ] BYOK model/provider registry
- [ ] Conversation persistence
- [ ] Visible thinking/status UX without exposing private chain-of-thought
- [ ] Tutor Navigator global context
- [ ] Full tutor ↔ topic/resource deep links
- [ ] AI proposal/approval boundaries for deterministic actions

## Learning/content engine
- [ ] Subject → Book → Chapter → Topic → Concept graph
- [ ] Prerequisites/dependencies
- [ ] Resource metadata and routing
- [ ] Source/provenance + verification workflow
- [ ] Problem/question model with difficulty, expected time, JEE level
- [ ] External-source discovery catalog
- [ ] Deduplication and canonicalization

## Practice engine
- [ ] Practice session lifecycle
- [ ] Problem attempts
- [ ] Confidence + mistake taxonomy
- [ ] Time-per-question
- [ ] Correct/incorrect/skip analytics
- [ ] Verification mini-tests
- [ ] Task lifecycle: planned → started → attempted → completed → verified

## Assessment engine
- [ ] Real test builder
- [ ] Timers and section timers
- [ ] Per-question active timing
- [ ] Expected-time bands
- [ ] Recovery/autosave
- [ ] Finalization/review generation
- [ ] Question-level interventions
- [ ] Full test analytics

## Mastery + weakness
- [ ] Cross-test aggregation
- [ ] Topic/concept mastery
- [ ] Accuracy/speed/confidence/recency/difficulty signals
- [ ] Weakness Radar UX
- [ ] Trends and drill-down
- [ ] Targeted intervention queue
- [ ] Spaced revision state

## Schedule + exam planner
- [ ] Student schedule profile
- [ ] Deterministic schedule engine
- [ ] Daily/weekly schedule versions
- [ ] Fixed commitments + conflict detection
- [ ] Exam entity + syllabus persistence
- [ ] Exam-aware readiness classification
- [ ] Mastery-gated topic replacement
- [ ] Late-start/recovery plans
- [ ] Task tracking and verification
- [ ] Schedule editor/timeline UX

## Production quality gate
- [ ] Typecheck/build green
- [ ] Automated tests for scoring/timing/thresholds
- [ ] Migration safety
- [ ] Cross-device persistence
- [ ] Vercel production deployment green
- [ ] Runtime error monitoring
- [ ] Main user flow smoke test
- [ ] Legacy route audit

## Content phase gate
Bulk content population begins only after the production-quality gate above is green. Content should then populate the canonical graph that powers practice, assessments, mastery, scheduling and Tutor Navigator.
