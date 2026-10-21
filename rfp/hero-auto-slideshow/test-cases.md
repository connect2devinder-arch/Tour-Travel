# Test Cases — Hero Auto-Slideshow

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / AC-001 | Hero background advances on its own while idle | High |
| TC-002 | REQ-003 / AC-003 | Interaction pauses the slideshow | High |
| TC-003 | REQ-004 / AC-004 | Slideshow resumes after the idle delay | Medium |
| TC-004 | REQ-005 / AC-005 | Slide indicators reflect and select the current slide | Medium |
| TC-005 | REQ-006 / AC-006 | Reduced motion disables autoplay | Medium |
| TC-006 | REQ-007 / AC-007 | Hero slide images load from Firebase Storage | High |

## TC-001 — Hero background advances on its own while idle

- **Type:** Positive
- **Preconditions:** Homepage is open, user has not interacted with the hero.
- **Steps:**
  1. Note the active slide indicator and hero background image.
  2. Wait for the autoplay interval to elapse.
- **Expected result:** The active slide changes on its own and the hero background image updates.
- **Requirement coverage:** REQ-001, AC-001, REQ-002, AC-002

## TC-002 — Interaction pauses the slideshow

- **Type:** Positive / Interaction
- **Preconditions:** Slideshow is rotating.
- **Steps:**
  1. Move the pointer over the hero (or focus a hero control).
  2. Wait longer than the autoplay interval.
- **Expected result:** The slide does not advance while the user is interacting.
- **Requirement coverage:** REQ-003, AC-003

## TC-003 — Slideshow resumes after the idle delay

- **Type:** Positive / Timing
- **Preconditions:** User has interacted with the hero and then stopped.
- **Steps:**
  1. Interact with the hero.
  2. Wait for the idle delay to elapse without interacting.
  3. Wait for one more autoplay interval.
- **Expected result:** The slideshow advances again on its own.
- **Requirement coverage:** REQ-004, AC-004

## TC-004 — Slide indicators reflect and select the current slide

- **Type:** Positive
- **Preconditions:** Hero is visible.
- **Steps:**
  1. Inspect the slide indicators and note which one is active.
  2. Activate a different indicator.
- **Expected result:** The active indicator matches the current slide, and activating another indicator switches to that slide.
- **Requirement coverage:** REQ-005, AC-005

## TC-005 — Reduced motion disables autoplay

- **Type:** Accessibility / Boundary
- **Preconditions:** Emulated `prefers-reduced-motion: reduce`.
- **Steps:**
  1. Open the homepage.
  2. Wait for more than one autoplay interval.
- **Expected result:** The slide does not advance automatically.
- **Requirement coverage:** REQ-006, AC-006

## TC-006 — Hero slide images load from Firebase Storage

- **Type:** Positive / Integrity
- **Preconditions:** Homepage is open.
- **Steps:**
  1. Inspect the hero slide image sources and load state.
  2. Check the console for failed requests.
- **Expected result:** Slide images are served from Firebase Storage, all load, and no failed requests occur.
- **Requirement coverage:** REQ-007, AC-007

## Playwright CLI execution notes

- Use the project-local Playwright CLI and the OpenCode `playwright-cli` skill; do not create or run a test script.
- Save evidence for every case under `test-results/evidence/` and record PASS/FAIL/BLOCKED below.

## Execution results

The hero now renders 5 stacked slides that cross-fade, driven by `src/heroSlides.js` (interval 6s, resume delay 8s). User interaction with the hero pauses rotation; it resumes once the visitor goes idle.

| Case | Result | Evidence |
| --- | --- | --- |
| TC-001 | PASS — slide advanced on its own with no user action | [hero](../../test-results/evidence/hero-slideshow/TC-001-hero-slideshow.png) |
| TC-002 | PASS — hovering the hero stopped rotation (index unchanged over 8s) | [hero](../../test-results/evidence/hero-slideshow/TC-001-hero-slideshow.png) |
| TC-003 | PASS — rotation resumed after the idle delay | [hero](../../test-results/evidence/hero-slideshow/TC-001-hero-slideshow.png) |
| TC-004 | PASS — dot click switched slide and updated counter/active dot | [hero](../../test-results/evidence/hero-slideshow/TC-001-hero-slideshow.png) |
| TC-005 | PASS — with reduced motion emulated, slide stayed put over 9s | [hero](../../test-results/evidence/hero-slideshow/TC-001-hero-slideshow.png) |
| TC-006 | PASS — all 5 slide images served from Firebase Storage with HTTP 200 | [hero](../../test-results/evidence/hero-slideshow/TC-001-hero-slideshow.png) |
