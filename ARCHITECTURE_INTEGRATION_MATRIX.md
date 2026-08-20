# Architecture Integration Matrix

This is the cross-system contract for the JEE platform. No major subsystem should evolve as an isolated feature.

## Core domains

| Domain | Owns | Consumes | Produces |
|---|---|---|---|
| Identity/Auth | account, session, student ownership | credentials | authenticated student context |
| Student Profile | prep stage, JEE target, preferences | onboarding | normalized student context |
| Content Graph | subject/book/chapter/topic/concept/resource | verified content | canonical IDs and mappings |
| Problem Bank | questions, difficulty, source, expected time | content graph | problem candidates |
| Practice Engine | attempts, answers, confidence, timing | problem bank | performance evidence |
| Assessment Engine | tests, sections, timers, question attempts | problem bank | assessment evidence |
| Review Engine | solutions, mistakes, interventions | assessment/practice evidence | remediation actions |
| Mastery Engine | topic state and evidence | all learning evidence | mastery/confidence/freshness |
| Weakness Radar | multi-dimensional weakness signals | mastery + attempts | ranked weaknesses/interventions |
| Schedule Engine | constraints, blocks, versions | mastery, exams, tasks, preferences | daily/weekly plan |
| Exam Planner | exam dates and syllabus scope | content graph + student evidence | exam priorities |
| Task Tracker | planned work, verification state | schedule + content | completion evidence |
| Tutor Core | JEE tutor behavior and conversations | student context + current content | explanations/actions |
| Tutor Navigator | topic/resource routing | content graph + mastery + context | deep links/resource actions |
| AI/BYOK | browser-provided model credentials and model selection | user request/context | model responses/proposals |
| Verification/Provenance | source trust, content review, audit history | source/content records | authoritative-content eligibility |
| Analytics | aggregate progress and trends | all student evidence | dashboards/trends |

## Non-negotiable flows

### Learning evidence
`Problem/Task → Attempt → Timing + Accuracy + Confidence → Mastery → Weakness → Intervention → Schedule`

### Assessment
`Test → Timed Questions → Completion → Review → Weakness → Remediation → Schedule`

### Exam readiness
`Exam Date + Scope → Canonical Topics → Student Evidence → Readiness → Priority → Schedule → Verification → Updated Readiness`

### Resource assistance
`Weakness/Question/Tutor Request → Canonical Topic → Verified Resource Router → Deep Link → Study → Practice`

### AI
`Browser BYOK → Model Selection → JEE Tutor Core Prompt → Student/Topic/Test Context → Response or Proposal`

AI must not become a second source of truth for deterministic state. AI can explain, generate proposals, summarize, classify where appropriate, or suggest actions; deterministic services decide ownership, permissions, thresholds, persistence and schedule/test state transitions.

## Cross-system invariants

1. Every student-owned record must be scoped to the authenticated student.
2. Canonical content IDs are preferred over free-text topic names whenever content exists.
3. Measured performance outranks self-reported mastery when the two conflict, while confidence remains useful evidence.
4. A checkbox does not equal mastery.
5. A test score alone does not equal mastery without considering difficulty, timing, recency and repeated evidence.
6. AI proposals require deterministic validation before mutating durable student state.
7. Major schedule changes require a visible before/after preview and student confirmation.
8. Verification thresholds are server-side and test-covered.
9. Timing survives reload/recovery and is not reconstructed from UI render time.
10. Unverified content cannot be presented as authoritative by Tutor Navigator.
11. Legacy diagnostic/mock-test paths must not become hidden dependencies of the new assessment engine.
12. Historical completed records are immutable except through explicit correction/versioning flows.
13. Browser BYOK credentials are not persisted as server-side student secrets.
14. All user-visible analytics must be explainable from stored evidence.

## Architecture completion priorities

### P0 — foundation
- [ ] auth/session reliability
- [ ] student ownership checks
- [ ] canonical content graph
- [ ] browser BYOK model configuration
- [ ] shared JEE tutor prompt
- [ ] cross-device persistence

### P1 — learning engine
- [ ] problem/question bank contract
- [ ] practice attempt persistence
- [ ] timed assessment engine
- [ ] assessment review/intervention
- [ ] mastery aggregation
- [ ] weakness radar
- [ ] task verification

### P1 — planning engine
- [ ] schedule profile
- [ ] deterministic scheduler
- [ ] exam planner + syllabus mapping
- [ ] adaptive schedule regeneration
- [ ] schedule versioning
- [ ] recovery/reschedule flows

### P1 — navigation/UX
- [ ] Tutor Navigator mini-chat
- [ ] verified resource routing
- [ ] weakness drill-down
- [ ] test review UX
- [ ] study-session tracker
- [ ] dashboard cleanup and legacy-path removal

### P2 — content operations
- [ ] source catalogue
- [ ] provenance records
- [ ] staged verification
- [ ] ingestion/deduplication
- [ ] JEE topic mapping
- [ ] content QA tooling
- [ ] source links/attribution
- [ ] bulk content population

## Release gate

The platform does not enter bulk content population merely because the individual features exist. P0 and P1 contracts must be exercised together in end-to-end tests covering a real student flow from authentication through study, assessment, weakness detection, resource navigation and adaptive scheduling.
