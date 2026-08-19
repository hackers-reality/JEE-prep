# Content Source Catalog — Future Content Phase

This file defines how the future content pipeline should use large public web catalogues as discovery and source-reference inputs without confusing web availability with ownership or verification.

## Discovery sources to evaluate

- Sarthaks
- Shaalaa
- Brainly
- ALLEN
- Vedantu
- Filo
- Other reputable JEE/CBSE question-and-solution repositories discovered during research

## Pipeline

`discover → fetch allowed material → record canonical source URL → capture source metadata → map to canonical topic → deduplicate → validate answer/solution → classify provenance/rights → review → publish/reference`

## Question records should preserve

- source name
- exact source URL
- source page title
- retrieval timestamp
- source question identifier when available
- canonical Subject / Chapter / Topic / Concept mapping
- question type
- JEE Main / Advanced applicability
- difficulty
- expected solution time
- answer and solution provenance
- content verification status
- rights/usage classification
- duplicate/near-duplicate fingerprint
- version history

## Usage modes

### Authoritative / reusable
Material with appropriate permission, licensing, public-domain status, or other established basis for redistribution can be stored and published after verification.

### Source-linked
For material that can be researched and referenced but should not be redistributed wholesale, retain source metadata and deep link while using the page for discovery/validation.

### Original derivative practice
Use discovered concepts/patterns to create genuinely original questions and solutions. Do not disguise source-derived wording as original.

## Quality requirements

- Never treat a source link alone as proof that an answer is correct.
- Validate numerical answers and solution logic independently.
- Prefer official exam/PYQ sources for official-answer claims.
- Keep source attribution visible on every imported or source-linked question.
- Preserve an audit trail for content changes.
- Do not allow an unverified item into the authoritative Tutor Navigator pool.
- Respect machine-readable crawl restrictions, site terms, access controls and applicable law while collecting automated material.
- Use rate limits, caching and deduplication so repeated retrieval does not hammer third-party sites.

## Research strategy

Large public catalogues are valuable because they dramatically improve coverage discovery. During the content phase, research should compare multiple sources for the same topic/question pattern, detect contradictions, verify the final answer, and then choose the appropriate storage mode above.

The goal is not merely to accumulate questions. The goal is to build a verified, canonicalized JEE question graph that powers tests, timing analytics, weakness detection, mastery, scheduling and Tutor Navigator.