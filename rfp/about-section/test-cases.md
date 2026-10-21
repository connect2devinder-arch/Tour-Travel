# Test Cases — About Section

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / AC-001 | About section renders with intro, narrative, image, and values | High |
| TC-002 | REQ-002 / AC-002 | Narrative copy is present and readable | Medium |
| TC-003 | REQ-003 / AC-003 | Exactly three core value cards are shown | High |
| TC-004 | REQ-004 / AC-004 | About image loads from Firebase Storage with alt text | High |
| TC-005 | REQ-005 / AC-005 | Header and footer About links navigate to the section | High |
| TC-006 | REQ-006 / AC-006 | About section is responsive on mobile | Medium |

## TC-001 — About section renders with intro, narrative, image, and values

- **Type:** Positive
- **Preconditions:** Homepage is available.
- **Steps:**
  1. Open the homepage.
  2. Navigate to the About section.
  3. Inspect the section contents.
- **Expected result:** About heading, narrative paragraphs, an image, and a values row are all visible.
- **Requirement coverage:** REQ-001, AC-001

## TC-002 — Narrative copy is present and readable

- **Type:** Positive
- **Preconditions:** About section is visible.
- **Steps:**
  1. Inspect the narrative paragraphs and closing line.
- **Expected result:** At least two narrative paragraphs plus a closing line are present with readable text.
- **Requirement coverage:** REQ-002, AC-002

## TC-003 — Exactly three core value cards are shown

- **Type:** Positive
- **Preconditions:** About section is visible.
- **Steps:**
  1. Inspect the values row.
- **Expected result:** Three value cards are shown, each with a title and a short description.
- **Requirement coverage:** REQ-003, AC-003

## TC-004 — About image loads from Firebase Storage with alt text

- **Type:** Positive / Integrity
- **Preconditions:** About section is visible.
- **Steps:**
  1. Inspect the About image source, alt text, and load state.
- **Expected result:** Image is served from Firebase Storage, has meaningful alt text, and loads without error.
- **Requirement coverage:** REQ-004, AC-004

## TC-005 — Header and footer About links navigate to the section

- **Type:** Positive / Navigation
- **Preconditions:** Homepage is available.
- **Steps:**
  1. Activate the header "About" link.
  2. Verify the About section is in view.
  3. Confirm a footer "About" link also exists.
- **Expected result:** The About link scrolls to the section, and a footer About link is present.
- **Requirement coverage:** REQ-005, AC-005

## TC-006 — About section is responsive on mobile

- **Type:** Responsive
- **Preconditions:** Homepage is available.
- **Steps:**
  1. View the About section at a mobile viewport size.
  2. Check for horizontal overflow and broken images.
- **Expected result:** Content stacks into a single column, no horizontal overflow, and images load.
- **Requirement coverage:** REQ-006, AC-006

## Playwright CLI execution notes

- Use the project-local Playwright CLI and the OpenCode `playwright-cli` skill; do not create or run a test script.
- Save evidence for every case under `test-results/evidence/` and record PASS/FAIL/BLOCKED below.

## Execution results

The About section was added between the manifesto and experiences sections, with copy in `src/aboutContent.js` and the hero image served from Firebase Storage.

| Case | Result | Evidence |
| --- | --- | --- |
| TC-001 | PASS — heading, narrative, image, and values row all render | [section](../../test-results/evidence/about-section/TC-001-about-section.png) |
| TC-002 | PASS — 3 narrative paragraphs plus closing line | [content snapshot](../../test-results/evidence/about-section/TC-002-about-content.yml) |
| TC-003 | PASS — exactly 3 value cards with title and description | [content snapshot](../../test-results/evidence/about-section/TC-002-about-content.yml) |
| TC-004 | PASS — image served from Firebase Storage with meaningful alt text | [section](../../test-results/evidence/about-section/TC-001-about-section.png) |
| TC-005 | PASS — header link scrolls the section into view; footer link present | [section](../../test-results/evidence/about-section/TC-001-about-section.png) |
| TC-006 | PASS — 390px: single column, 0 broken images, no horizontal overflow | [mobile](../../test-results/evidence/about-section/TC-006-about-mobile.png) |
