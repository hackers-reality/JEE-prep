# Content Source & Question Ingestion Policy

The content phase may use external educational websites as **discovery, provenance, validation and linking sources**, but the platform must not bulk-copy protected questions, solutions, explanations, or page content merely because it is publicly accessible.

## Source classes

### 1. First-party / official sources
Examples: NTA/JEE official material, NCERT, official board publications, official exam papers, publisher material where rights permit.

Preferred for authoritative facts, syllabus, official PYQs and source-of-truth metadata.

### 2. Licensed / explicitly permitted sources
Content may be imported only when the project has the applicable permission/license/terms needed for storage, transformation and redistribution.

Record license/permission evidence in provenance metadata.

### 3. External discovery sources
Educational sites such as Sarthaks, Shaalaa, Brainly, Allen, Vedantu, Filo and similar services can be used to discover question patterns, topic coverage, alternate explanations, URLs and validation targets. Sarthaks and Shaalaa publicly describe large question/answer and question-bank resources, while ALLEN provides JEE CBT/test material. These sites remain third-party sources and their individual content rights must be respected.

For discovery-only material, prefer storing:
- source URL
- source title
- source/platform
- topic mapping
- question fingerprint/hash
- observed metadata
- rights status
- optional short factual notes

Do not store full third-party question/solution text unless redistribution rights are established.

## Question ingestion workflow

`DISCOVER → IDENTIFY → RIGHTS_CHECK → CLASSIFY → MAP → VALIDATE → REVIEW → PUBLISH`

For every candidate question:
1. Identify the original source and exact URL/location.
2. Determine whether it is an official question, licensed content, user contribution, publisher content, or third-party discovery item.
3. Check whether storage, adaptation, and redistribution are permitted.
4. Deduplicate using normalized text/fingerprint where legally and technically appropriate.
5. Map to canonical Subject → Chapter → Topic → Concept IDs.
6. Record JEE Main/Advanced relevance, estimated difficulty, expected time, question type and prerequisites.
7. Validate answer correctness independently.
8. Validate timing expectations separately from correctness.
9. Review solution quality.
10. Assign a verification state and provenance record.

## Preferred publication strategies

When rights are unavailable, prefer one of:
- link-out to the original source
- cite the source as a reference/discovery record
- create an original problem inspired by the underlying concept without copying protected expression
- use official/public-domain material where applicable
- obtain a license before storing redistributable copies

## Original question generation

Original questions should be independently authored. The system may use external sources to identify:
- concepts that need practice
- common misconceptions
- difficulty patterns
- exam-style structure
- topic coverage gaps

Original questions must not be superficial rewrites of a protected question. Store an internal provenance note describing inspiration at the concept level when useful.

## Verification

A question is not `VERIFIED` merely because an external site provides an answer.

Verification should include, as appropriate:
- source/provenance check
- answer-key agreement
- independent derivation/solution check
- units/dimensions and algebra checks
- edge-case/case analysis
- JEE-level relevance
- expected-time calibration
- solution review
- duplicate/near-duplicate review

## External source snapshots

If metadata is retained from an external site, store retrieval timestamp and source version/location where possible. Do not imply that the external source endorses JEE Prep or that third-party content is owned by JEE Prep.

## Content graph integration

Every published question should eventually resolve to:

`Subject → Chapter → Topic → Concept(s) → Question`

and carry:
- source/provenance record
- rights status
- verification status
- difficulty
- expected time
- JEE applicability
- syllabus version
- solution availability
- content version

This metadata powers scheduling, timed assessment analytics, weakness radar, mastery, Tutor Navigator and search.
