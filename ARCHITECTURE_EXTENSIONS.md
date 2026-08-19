# Architecture Extensions — Schedule, Timed Assessment, Weakness Radar & Tutor Navigator

This document extends `ARCHITECTURE_CHECKLIST.md` with detailed product contracts for the newer study-system requirements. These are architecture requirements, not optional polish.

## 1. Custom Daily Schedule Builder & Tracker

### Student inputs
- Class/grade and JEE preparation stage
- Current preparation position and completed syllabus
- JEE Main vs Main + Advanced target
- Available study hours per day
- Wake-up and sleep windows
- Breakfast, lunch, dinner and regular break windows
- School/college timetable
- Tuition/coaching timetable
- Commute/travel time
- Fixed personal commitments
- Preferred subject/time-of-day preferences
- Strong and weak subjects/topics
- Upcoming school/college/coaching exams
- Major exams with dates, priority and preparation lead time
- Weekday/weekend/holiday differences

### Schedule engine
- Hard constraints must never be violated silently.
- Soft preferences should be optimized when feasible.
- Generate daily and weekly time blocks.
- Allocate theory, revision, practice, tests and recovery/buffer blocks.
- Use mastery, due work, weak areas and upcoming exams to prioritize blocks.
- Avoid unreasonable continuous study blocks and preserve meals/rest/sleep.
- Detect and surface conflicts instead of silently overwriting fixed commitments.
- Allow manual edit, drag/reorder, replacement and lock/freeze of approved blocks.
- Regenerate future schedule without rewriting historical completed blocks.
- Support late-start/emergency recovery plans.
- Keep schedule versions so a student can inspect or roll back a major regeneration.
- Maintain local-date/timezone-safe scheduling.

## 2. Schedule AI
- Reuse the student's BYOK NVIDIA configuration.
- Accept natural-language requests such as replacing a topic, moving a block or balancing workload.
- Inspect the current timetable, student constraints and mastery data before proposing a change.
- Never directly mutate a major schedule without deterministic validation and a visible preview.
- The scheduler/rules engine is the authority; AI proposes changes.

### Mastery-gated topic removal
When a student asks to remove a topic because they already studied it:
1. Resolve the requested topic to the canonical content graph.
2. Identify prerequisite/core sub-concepts.
3. Generate a short validation test covering the important core concepts, not a single trivial question.
4. Default removal eligibility threshold: strictly above 90%.
5. Record the validation attempt, score, covered concepts and timestamp.
6. If the student fails, keep the topic in the timetable and propose targeted revision.
7. If the student passes, allow a replacement proposal.
8. Validate the replacement against prerequisites, exam dates, mastery, due tasks and workload.
9. Show a before/after schedule preview and explain the reason for the change.
10. Require student confirmation before committing a major change.
11. Do not remove prerequisite topics merely because a downstream topic was passed.
12. Re-run validation when mastery evidence is stale enough that the old result is no longer trustworthy.

## 3. Daily Task Tracker
Every planned task has explicit states:

`PLANNED → STARTED → ATTEMPTED → COMPLETED → VERIFIED`

- Checkbox interactions are fast but do not automatically imply mastery.
- Store completion timestamp and history.
- Permit partial completion and reflection/notes.
- Each learning task may require a small verification test.
- Verification questions should sample the topic's core concepts/prerequisites.
- A task reaches `VERIFIED` only after its configured validation passes.
- Failed validation can reopen/downgrade the task and generate targeted revision.
- Connect verified completion to topic mastery and spaced revision.
- Track first-pass vs repeat-pass performance.
- Prevent trivial repeated checks from inflating mastery.
- Provide missed/overdue recovery workflows.

## 4. Timed Tests & Question Timing
Every timed assessment must track:
- Test start timestamp
- Test end timestamp
- Full-test remaining time
- Section start/end timestamps and section timers where applicable
- Per-question first-view/start timestamp
- Per-question answer/submit timestamp
- Active time spent per question
- Expected solution time metadata
- Expected-time band based on JEE exam level/question type/difficulty
- Time overruns
- Question order and navigation history
- Pause/resume events where self-study mode permits them

### Required analytics
- Total test time
- Section time distribution
- Per-question actual time
- Per-question expected time
- Difference between actual and expected time
- Questions taking substantially longer than expected
- Time sinks by topic/concept
- Accuracy vs speed
- Time-per-correct and time-per-incorrect
- Correct-but-slow questions
- Incorrect-and-slow questions
- Fast-but-inaccurate questions

Timing data must survive test recovery and must not be corrupted by reloads, navigation, retries or answer edits.

## 5. Test Review & Intervention
After a test, each question gets an intervention classification:
- Correct + fast → reinforce
- Correct + slow → speed improvement
- Incorrect + fast → concept/accuracy issue
- Incorrect + slow → highest-priority weakness
- Unattempted → attempt strategy / knowledge gap

For relevant questions, show:
- What went wrong
- The first incorrect reasoning/step when identifiable
- Expected approach
- Full solution
- Faster valid method/trick when one exists
- Why the faster method works
- Expected time and actual time
- A targeted practice action
- A revision action
- An `Ask Tutor AI` action
- An `Add to schedule` action
- An `Open best resource` action

All review outcomes feed the weakness radar, mastery engine and revision queue.

## 6. Weakness Radar
Weakness is multi-dimensional, not just percentage accuracy.

Inputs include:
- Accuracy
- Speed
- Consistency
- Confidence
- Recency/freshness
- Difficulty
- Repeated mistake pattern
- Time overruns
- Attempt frequency

The radar must identify patterns such as:
- High error + high time cost
- High error + low time cost
- Low error + high time cost
- High confidence + low accuracy
- Low confidence + high accuracy
- Repeated mistake type on the same concept

### UX requirements
- Strong visual hierarchy
- Fast scan of top weaknesses
- Subject → topic → concept drill-down
- Trend over time
- Before/after intervention comparison
- Clear severity and reason indicators
- Non-color-only accessibility cues
- Responsive mobile/table/list/radar views
- Direct links from weakness → exact problem/topic/resource
- `Ask Tutor AI` escalation from any weakness

## 7. Tutor Navigator + Mini AI
A persistent bottom-right Tutor Navigator is part of the global study architecture.

### UI behavior
- Fixed bottom-right entry point
- Click opens a compact mini-chat panel anchored to that location
- Does not navigate away from the current page just to ask a question
- Preserves current page/topic/problem context
- Can expand into the full AI workspace
- Does not obstruct active test/timer controls
- Keyboard and screen-reader accessible

### Capabilities
The student can say:

> "I'm having trouble with kinematics."

The Tutor Navigator then:
1. Detects/resolves the requested topic.
2. Maps it to canonical Subject → Book → Chapter → Topic.
3. Uses student JEE target, mastery and resource metadata to rank resources.
4. Selects the preferred/highest-value populated resource.
5. Deep-links/navigates to the exact chapter/topic.
6. Responds with a friendly confirmation such as: "No worries, I got you — I opened the Kinematics resource for you. Review it there, and ask me here whenever you're stuck."
7. Keeps the mini-chat context available where practical.
8. Offers `Open full tutor`, `Show another resource`, and `Help me study this` actions.

The tutor must never fabricate a book/resource that is not present in the populated content graph. If the preferred resource has not yet been populated, it must explain the fallback and offer the nearest valid resource.

## 8. Resource Preference & Routing
Each content resource should eventually carry metadata enabling intelligent routing:
- JEE Main/Advanced applicability
- Difficulty
- Student target suitability
- Subject/topic coverage
- Depth level
- Prerequisites
- Student mastery compatibility
- Resource type (textbook, solved examples, problems, PYQ, revision, etc.)
- Provenance and verification status

Resource routing is therefore a content-graph feature, not a hardcoded list of links.

## 9. End-to-End Feedback Loop

`Schedule → Task → Study → Verification → Attempt → Timing + Accuracy → Weakness Radar → Mastery → Revision → Schedule`

The Tutor Navigator and Test Review are entry points into the same loop, not isolated features.

## 10. Architecture Completion Gate
Before bulk content population begins, these systems must have production-ready contracts:
- Schedule builder
- Deterministic schedule engine
- Schedule AI proposal/validation flow
- Mastery-gated schedule changes
- Task verification
- Timed test engine
- Question timing analytics
- Test review/intervention
- Weakness radar
- Tutor Navigator
- Resource routing/deep links
- Cross-device persistence
- Automated tests for all threshold and timing rules

Bulk content then populates the canonical graph that powers all of the above. Do not build thousands of content records against unstable route-level or page-specific structures.
