# Exam-Aware Adaptive Scheduling Contract

Upcoming exams are first-class schedule constraints, not just calendar events.

## Exam intake
For every exam, collect:
- exam name and type
- date/time and priority
- included subjects
- syllabus/chapters/topics for each subject
- optional core concepts/subtopics
- paper format and duration when known
- student-supplied confidence estimate (secondary to measured evidence)

## Canonical mapping
Map the supplied syllabus to the canonical Subject → Book → Chapter → Topic/Concept graph. Unresolved mappings must be surfaced for clarification; the system must never invent coverage.

## Evidence-aware planning
Use, in priority order:
1. recent measured assessment/problem performance
2. verification-test results
3. topic mastery and freshness
4. timing and repeated-mistake data
5. completed/verified schedule work
6. self-reported confidence

Do not automatically repeat full theory for a topic with strong, recent mastery evidence. Prefer retrieval, practice, revision or mixed problems unless the system detects decay, a prerequisite gap, or a new required scope.

For weak, stale, or prerequisite-deficient topics, schedule deeper learning blocks before practice.

## Exam countdown
For each exam calculate:
- total syllabus scope
- mapped scope
- mastered scope
- weak/stale scope
- untouched scope
- remaining study capacity before the exam
- required theory/practice/revision/test workload
- completion buffer before exam day

The scheduler should aim to finish first-pass coverage before the buffer, then reserve the remaining time for revision and timed simulation.

As the exam approaches, increase retrieval/revision and exam-style practice while preventing unrealistic over-scheduling.

## Scope changes
When the student edits an exam syllabus or moves the exam date:
- diff old vs new scope
- show affected future schedule blocks
- preserve historical completed blocks
- reprioritize newly added or newly urgent topics
- regenerate only the affected future schedule
- require confirmation for major changes

## Avoiding unnecessary repetition
A topic should be considered sufficiently covered for scheduling purposes only when evidence is recent enough and strong enough for the intended exam level.

Use a freshness-aware state such as:
- UNSEEN
- LEARNING
- PRACTICING
- RECENTLY_MASTERED
- MASTERED_BUT_STALE
- WEAK
- PREREQUISITE_GAP

RECENTLY_MASTERED topics may be scheduled mainly for spaced retrieval. MASTERED_BUT_STALE topics require a refresher/verification rather than a complete theory restart.

## Required schedule outputs
The exam plan must explain:
- what will be completed and by when
- what is already covered and therefore deprioritized
- what is weak/stale and needs attention
- what remains untouched
- how much practice and timed testing is reserved
- what happens if the student misses planned blocks

## Core principle
The timetable must optimize for exam readiness and learning outcomes, not for filling every available hour. A student who already knows a topic should not be forced through the same full theory again merely because it appears in the exam syllabus; the system should use evidence to decide whether to revise, verify, practice, or relearn it.
