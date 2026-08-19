# JEE Prep Architecture Checklist

## Identity & account
- [x] Username/password accounts
- [x] Session cookies and expiration
- [x] Student-owned data boundary
- [ ] Profile editing and preferences
- [ ] Account deletion/export
- [ ] Optional Google sign-in
- [ ] Student timezone/local-date handling
- [ ] Cross-device account state consistency

## AI platform
- [x] BYOK NVIDIA key flow
- [x] Central model registry
- [x] Streaming gateway
- [x] JEE-specific system prompt
- [x] Student-owned conversations
- [x] Persistent messages
- [x] Conversation list/rename/delete
- [ ] Unified global/topic AI workspace
- [ ] Topic/context retrieval layer
- [ ] Tutor modes: teach/hint/solve/check/revise/practice/plan
- [ ] Retry/cancel/generation recovery
- [ ] Usage/error telemetry without storing provider secrets
- [ ] AI action confirmation for destructive/structural study-plan changes
- [ ] AI output validation against platform rules before applying plan changes

## Study system
- [x] Student-owned tasks
- [x] Task CRUD APIs
- [x] Study-session schema/API
- [ ] Task UI
- [ ] Calendar/schedule UI
- [ ] Start/stop/pause study session
- [ ] Automatic session completion
- [ ] Recurring schedules
- [ ] Study goals and daily targets
- [ ] Cross-device sync
- [ ] Task dependencies/prerequisites
- [ ] Task rescheduling and conflict resolution
- [ ] Completion state history/audit trail

## Daily Schedule Builder & Tracker
- [ ] Dedicated daily/weekly schedule data model
- [ ] Guided schedule-builder onboarding flow
- [ ] Inputs: class/grade and preparation stage
- [ ] Inputs: available study hours
- [ ] Inputs: wake-up and sleep times
- [ ] Inputs: breakfast, lunch, dinner and fixed break windows
- [ ] Inputs: school/college hours
- [ ] Inputs: tuition/coaching hours
- [ ] Inputs: commute/travel time
- [ ] Inputs: fixed personal commitments
- [ ] Inputs: preferred subject/time-of-day preferences
- [ ] Inputs: JEE target and Main/Advanced priority
- [ ] Inputs: current preparation position / completed syllabus
- [ ] Inputs: weak/strong subjects and topics
- [ ] Inputs: upcoming school/college/coaching exams
- [ ] Inputs: major exams with dates, priority and preparation lead time
- [ ] Inputs: holidays/weekend differences
- [ ] Schedule engine with hard constraints and soft preferences
- [ ] Automatic time-block generation
- [ ] Reasonable study/rest distribution and maximum-session controls
- [ ] Topic/task allocation using current mastery and due work
- [ ] Revision blocks and spaced-repetition slots
- [ ] Practice/test blocks
- [ ] Buffer blocks for overruns and missed sessions
- [ ] Daily schedule regeneration without destroying completed history
- [ ] Manual drag/edit/reorder/custom time blocks
- [ ] Lock/freeze user-approved blocks
- [ ] Schedule conflict detection
- [ ] Exam-aware schedule weighting
- [ ] Emergency/late-start recovery plan
- [ ] Weekly review and schedule adjustment workflow
- [ ] Schedule versioning/history and rollback

## Schedule AI & mastery-gated changes
- [ ] BYOK AI assistant embedded in schedule builder/tracker
- [ ] Natural-language schedule edit requests
- [ ] AI must inspect current timetable before proposing changes
- [ ] Detect whether a requested topic is already sufficiently mastered
- [ ] Generate a short mastery-validation quiz for a requested topic before removing it
- [ ] Validation quiz covers prerequisite/core sub-concepts, not one narrow question
- [ ] Configurable mastery threshold (default: >90% for timetable removal)
- [ ] Require pass before allowing removal/replacement of a mastered topic
- [ ] Record validation attempt, score, timestamp and topics covered
- [ ] On failed validation: keep topic in plan and recommend targeted revision
- [ ] On passed validation: allow replacement with a justified alternative task/topic
- [ ] Validate replacement topic against prerequisites, exam proximity and workload
- [ ] AI may propose changes; deterministic scheduler/rules remain the final authority
- [ ] Student must see a clear before/after preview before committing major schedule changes

## Daily Task Tracker & Completion Verification
- [ ] Daily task checklist UI
- [ ] One-tap check/uncheck with optimistic UI and sync
- [ ] Task completion timestamp and completion history
- [ ] Distinguish started / attempted / completed / verified
- [ ] Optional notes and reflection per task
- [ ] Automatic verification mini-tests for topic-learning tasks
- [ ] Verification question selection from core concepts/prerequisites
- [ ] Verification threshold per task type
- [ ] A task is marked "verified complete" only after the required validation passes
- [ ] Failed verification reopens or downgrades the task appropriately
- [ ] Track first-pass vs repeated-pass performance
- [ ] Prevent trivial re-checks from falsely inflating mastery
- [ ] Connect verified task completion to TopicMastery and revision logic
- [ ] Completion streaks and consistency metrics
- [ ] Recovery flow for missed tasks

## Assessment & adaptive engine
- [ ] Problem attempt model
- [ ] Test attempt/result model
- [ ] Time spent + confidence + mistake type
- [ ] Topic mastery updates
- [ ] Difficulty calibration
- [ ] Weakness detection
- [ ] Spaced-revision scheduler
- [ ] Daily recommendation engine
- [ ] Predictive analytics
- [ ] Mastery decay / freshness model
- [ ] Prerequisite-aware mastery propagation
- [ ] Confidence vs accuracy discrepancy detection
- [ ] Topic readiness score for schedule decisions
- [ ] Exam-readiness score by subject/topic

## Canonical content architecture
- [ ] Subject → Book → Chapter → Topic canonical hierarchy
- [ ] Concept/prerequisite graph beneath Topic
- [ ] Remove remaining legacy topic routes/links
- [ ] Content provenance model
- [ ] Reference-book mapping model
- [ ] Original learning-content model
- [ ] Problem/question bank model
- [ ] PYQ source/session/shift metadata
- [ ] Verification workflow
- [ ] Duplicate detection
- [ ] Content versioning
- [ ] Search/indexing
- [ ] Content difficulty/calibration metadata
- [ ] Main vs Advanced applicability metadata
- [ ] Syllabus-version metadata

## Resources/content scope
- [ ] JEE Main syllabus coverage
- [ ] JEE Advanced syllabus coverage
- [ ] NCERT Physics/Chemistry/Maths
- [ ] State-board alignment where relevant
- [ ] H.C. Verma mapping
- [ ] D.C. Pandey mapping
- [ ] Cengage mapping
- [ ] Arihant material mapping
- [ ] N. Awasthi / M.S. Chouhan / relevant chemistry references
- [ ] Coordinate/Black Book/Irodov-style advanced mapping where appropriate
- [ ] Official JEE Main PYQs
- [ ] Official JEE Advanced PYQs
- [ ] Original practice sets

## Community / discussion system
- [ ] Student discussion posts
- [ ] Answers/comments
- [ ] Voting/bookmarks
- [ ] Best-answer/resolution state
- [ ] Topic-linked discussions
- [ ] Search/filter/sort
- [ ] Moderation/reporting/abuse controls
- [ ] AI-assisted doubt summarization where appropriate

## UX/UI quality
- [ ] Remove dead buttons and placeholder routes
- [ ] Unified navigation
- [ ] Responsive/mobile pass
- [ ] Empty/loading/error states for every feature
- [ ] Keyboard/accessibility pass
- [ ] Consistent design system
- [ ] Fast page transitions
- [ ] Clear destructive actions
- [ ] Schedule builder usability pass
- [ ] Calendar/timetable mobile usability pass
- [ ] Visual distinction between planned / active / completed / verified tasks
- [ ] No misleading empty-state affordances

## Production & quality
- [ ] Automated unit tests
- [ ] API integration tests
- [ ] Auth/ownership tests
- [ ] AI gateway tests
- [ ] Schedule constraint tests
- [ ] Mastery-validation threshold tests
- [ ] Task verification tests
- [ ] Content validation tests
- [ ] Database migration strategy
- [ ] Vercel production smoke tests
- [ ] Runtime error monitoring
- [ ] Security/privacy review
- [ ] Backup/recovery plan
- [ ] Performance/load testing for large content sets
- [ ] Search/index performance testing

## Content phase gate
Do **not** begin bulk content population until the architecture checklist above is complete enough for production. Content ingestion should then run as a separate, long-running phase with provenance, validation, review, and incremental deployment.

## Content phase operating model
- [ ] Content ingestion pipeline
- [ ] Source licensing/rights/provenance policy
- [ ] Human review queues
- [ ] AI-assisted extraction only with validation
- [ ] Chapter/topic coverage matrix
- [ ] Reference-book crosswalk matrix
- [ ] PYQ ingestion and metadata validation
- [ ] Duplicate/near-duplicate detection
- [ ] Content QA sampling
- [ ] Incremental release process
- [ ] Rollback for bad content batches
- [ ] Coverage dashboards
