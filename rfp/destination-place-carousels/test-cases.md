# Test Cases — Destination Place Carousels

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / AC-001 | Forward and back arrows change slides | High |
| TC-002 | REQ-002 / AC-002 | Each slide shows a place caption | High |
| TC-003 | REQ-003 / AC-003 | Each destination lists its famous places | High |
| TC-004 | REQ-004 / AC-004 | Carousel images load from Firebase Storage | High |
| TC-005 | REQ-005 / AC-005 | Keyboard navigation and dot controls | Medium |
| TC-006 | REQ-006 / AC-006 | Carousel renders responsively on mobile | Medium |
| TC-007 | REQ-001 / AC-001 | Dot navigation jumps to a specific slide | Medium |

## TC-001 — Forward and back arrows change slides

- **Type:** Positive
- **Preconditions:** A destination detail section with the carousel is open.
- **Steps:**
  1. Note the current slide caption.
  2. Activate the forward arrow.
  3. Activate the back arrow.
- **Expected result:** Forward arrow shows the next place; back arrow returns to the previous place; the caption updates each time.
- **Requirement coverage:** REQ-001, AC-001

## TC-002 — Each slide shows a place caption

- **Type:** Positive
- **Preconditions:** A destination detail carousel is open.
- **Steps:**
  1. Inspect each slide in order.
- **Expected result:** Every slide shows the place name for that destination (e.g. Shimla shows Mall Road, The Ridge, Jakhu Temple, Naldehra, Kufri).
- **Requirement coverage:** REQ-002, AC-002

## TC-003 — Each destination lists its famous places

- **Type:** Positive
- **Preconditions:** Homepage with all four destinations is available.
- **Steps:**
  1. Open each destination detail section.
  2. Count the carousel slides and read the captions.
- **Expected result:** Each destination has 5 slides with the expected famous places.
- **Requirement coverage:** REQ-003, AC-003

## TC-004 — Carousel images load from Firebase Storage

- **Type:** Positive / Integrity
- **Preconditions:** Place images are uploaded to Firebase Storage.
- **Steps:**
  1. Open a destination carousel.
  2. Inspect image sources and load state.
- **Expected result:** Images come from Firebase Storage URLs, all load, and none are broken.
- **Requirement coverage:** REQ-004, AC-004

## TC-005 — Keyboard navigation and dot controls

- **Type:** Positive / Accessibility
- **Preconditions:** A destination carousel is open.
- **Steps:**
  1. Use keyboard to focus and activate the forward arrow.
  2. Use keyboard to focus and activate a dot.
- **Expected result:** Slides change on keyboard activation; current slide is indicated with aria attributes.
- **Requirement coverage:** REQ-005, AC-005

## TC-006 — Carousel renders responsively on mobile

- **Type:** Responsive
- **Preconditions:** A destination carousel is open.
- **Steps:**
  1. View at desktop and mobile viewport sizes.
  2. Check for overflow and broken layout.
- **Expected result:** Carousel fits the viewport and does not cause horizontal overflow.
- **Requirement coverage:** REQ-006, AC-006

## TC-007 — Dot navigation jumps to a specific slide

- **Type:** Positive
- **Preconditions:** A destination carousel with multiple slides is open.
- **Steps:**
  1. Activate the dot for the last place.
- **Expected result:** The last place's image and caption are shown.
- **Requirement coverage:** REQ-001, AC-001

## Playwright CLI execution notes

- Use the project-local Playwright CLI and the OpenCode `playwright-cli` skill; do not create or run a test script.
- Save evidence for every case under `test-results/evidence/` and record PASS/FAIL/BLOCKED below.
- Unsplash search may require the real browser; place images are stored in Firebase Storage.

## Execution results

Images for each place were searched on Unsplash via Playwright, downloaded, and uploaded to Firebase Storage under `destinations/<place>/<name>.jpg` (bucket `tour-83b6c.firebasestorage.app`). Each destination detail section now shows a carousel of its famous places with back/forward arrows and dot indicators.

| Case | Result | Evidence |
| --- | --- | --- |
| TC-001 | PASS — forward/back arrows change slides | [carousel](../../test-results/evidence/place-carousels/TC-001-carousel.png), [live Jakhu slide](../../test-results/evidence/place-carousels/TC-001-live-jakhu.png) |
| TC-002 | PASS — each slide shows a place caption | [caption snapshot](../../test-results/evidence/place-carousels/TC-001-carousel.png) |
| TC-003 | PASS — all four destinations list their famous places | [Manali](../../test-results/evidence/place-carousels/TC-003-manali-places.yml), [Spiti](../../test-results/evidence/place-carousels/TC-003-spiti-places.yml), [Mussoorie](../../test-results/evidence/place-carousels/TC-003-mussoorie-places.yml) |
| TC-004 | PASS — carousel images load from Firebase Storage, 0 broken | [carousel](../../test-results/evidence/place-carousels/TC-001-carousel.png) |
| TC-005 | PASS — keyboard activation changes slides; dots have aria attributes | [carousel](../../test-results/evidence/place-carousels/TC-001-carousel.png) |
| TC-006 | PASS — 390px viewport: no overflow, no broken images | [mobile carousel](../../test-results/evidence/place-carousels/TC-006-mobile-carousel.png) |
| TC-007 | PASS — dot navigation jumps to a specific slide (Kufri, 5 of 5) | [carousel](../../test-results/evidence/place-carousels/TC-001-carousel.png) |

Live verification at `https://tour-83b6c.web.app`: destination detail carousel loads place images from Firebase Storage, arrows change slides (Mall Road → The Ridge → Jakhu Temple), and console shows 0 errors.
