# JEE Prep Architecture Checklist

## Identity & account
- [x] Username/password accounts
- [x] Session cookies and expiration
- [x] Student-owned data boundary
- [ ] Profile editing and preferences
- [ ] Account deletion/export
- [ ] Optional Google sign-in

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

## Canonical content architecture
- [ ] Subject → Book → Chapter → Topic canonical hierarchy
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

## UX/UI quality
- [ ] Remove dead buttons and placeholder routes
- [ ] Unified navigation
- [ ] Responsive/mobile pass
- [ ] Empty/loading/error states for every feature
- [ ] Keyboard/accessibility pass
- [ ] Consistent design system
- [ ] Fast page transitions
- [ ] Clear destructive actions

## Production & quality
- [ ] Automated unit tests
- [ ] API integration tests
- [ ] Auth/ownership tests
- [ ] AI gateway tests
- [ ] Content validation tests
- [ ] Database migration strategy
- [ ] Vercel production smoke tests
- [ ] Runtime error monitoring
- [ ] Security/privacy review
- [ ] Backup/recovery plan

## Content phase gate
Do **not** begin bulk content population until the architecture checklist above is complete enough for production. Content ingestion should then run as a separate, long-running phase with provenance, validation, review, and incremental deployment.
