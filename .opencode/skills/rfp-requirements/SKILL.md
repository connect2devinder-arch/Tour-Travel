---
name: RFP Requirements and Test Cases
description: Gather a requirement from the user, then create a requirement folder with a structured requirement.md and linked test-cases.md.
---

# RFP Requirements and Test Cases

Use this skill when the user wants to capture an RFP/product requirement and derive test cases from it.

## Workflow

1. **Gather details before editing files.** Ask the user what feature or requirement they want documented. Ask focused follow-up questions for any important missing details, such as:
   - Who will use it, and what are they trying to accomplish?
   - What is the expected behavior or main flow?
   - What acceptance criteria, validation rules, or business rules apply?
   - What error, boundary, or alternate cases should be handled?
   - Are there dependencies, permissions, platforms, or other constraints?
2. Do not invent business rules or silently turn assumptions into requirements. Record unknowns as `TBD` and ask the user to resolve them when they affect testability.
3. **Choose the output location.** Use an existing `rfp/` or `RFP/` directory at the project root if present. Otherwise use a new `rfp/` directory at the project root. If the project has an `rfp.md` file, leave it untouched; a folder cannot be created inside a Markdown file, so create the requirement folder beside it under `rfp/`.
4. **Name the requirement folder from the requirement.** Create a short, descriptive, lowercase kebab-case folder name (for example, `guest-booking-cancellation`). Check for an existing folder first; do not overwrite existing documents. If the name already exists, ask whether to update that requirement or choose a distinct name.
5. Create both files inside the new folder:
   - `requirement.md` — document the supplied requirement.
   - `test-cases.md` — create test cases that verify its acceptance criteria and important edge cases.
6. Keep the two files consistent. Give requirements stable IDs (`REQ-001`, `REQ-002`, ...) and reference those IDs from test cases (`TC-001`, `TC-002`, ...).
7. Summarize the created paths and call out any `TBD` items after writing the files.

## `requirement.md` format

Use this structure, omitting a section only when it is genuinely not applicable:

```markdown
# <Requirement title>

## Overview
<Short summary in the user's language where practical.>

## Goal
<User/business outcome>

## Actors
- <Users or systems involved, or TBD>

## Functional requirements
- **REQ-001:** <One clear, testable behavior>

## Acceptance criteria
- **AC-001 (REQ-001):** Given <context>, when <action>, then <observable result>.

## Business rules and validation
- <Rule, or TBD>

## Dependencies and constraints
- <Dependency/constraint, or None stated>

## Open questions
- <Unresolved item, or None>
```

Preserve important wording and domain terms supplied by the user. Separate confirmed requirements from assumptions and open questions.

## `test-cases.md` format

Create at least one test case for each acceptance criterion. Add negative, boundary, and alternate-flow cases where the requirement provides enough information. Do not create expected results based on unstated business rules; mark those cases as blocked by a `TBD` or ask the user first.

```markdown
# Test Cases — <Requirement title>

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / AC-001 | <Short scenario> | High |

## TC-001 — <Scenario>
- **Type:** Positive / Negative / Boundary / Alternate
- **Preconditions:** <Required setup, or None>
- **Steps:**
  1. <Action>
- **Expected result:** <Observable outcome>
- **Requirement coverage:** REQ-001, AC-001
```

Use clear, independently executable steps and observable expected results. These are test specifications, not claims that tests have been run.
