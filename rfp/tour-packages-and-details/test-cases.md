# Test Cases — Tour Packages and Package Details

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / AC-001 | Package cards show the complete summary and starting price | High |
| TC-002 | REQ-002 / AC-002 | A package card opens its own detail URL | High |
| TC-003 | REQ-003 / AC-003 | Itinerary is presented day by day in order | High |
| TC-004 | REQ-004 / AC-004 | Inclusions, hotel, and transport sections are visible | High |
| TC-005 | REQ-005 / AC-005 | Package gallery and FAQs are usable | Medium |
| TC-006 | REQ-006 / AC-006 | Package enquiry preselects package and saves its reference | High |
| TC-007 | REQ-007 / AC-007 | Package detail is responsive and keyboard accessible | Medium |
| TC-008 | REQ-002 / AC-002 | Unknown package URL shows a not-found state | Medium |

## TC-001 — Package cards show the complete summary and starting price

- **Type:** Positive
- **Preconditions:** Homepage package list has mock package data.
- **Steps:**
  1. Open the homepage and navigate to Featured Packages.
  2. Inspect each package card.
- **Expected result:** Each card shows package name, destination, duration, itinerary summary, inclusions, and a `Starting from ₹...` price.
- **Requirement coverage:** REQ-001, AC-001

## TC-002 — A package card opens its own detail URL

- **Type:** Positive / Navigation
- **Preconditions:** At least one package card is visible.
- **Steps:**
  1. Select “View details” for a known package such as Shimla Hill Escape.
  2. Inspect the browser URL and page heading.
- **Expected result:** URL is `/packages/<package-id>` and the detail page title matches the chosen package.
- **Requirement coverage:** REQ-002, AC-002

## TC-003 — Itinerary is presented day by day in order

- **Type:** Positive
- **Preconditions:** A package detail page is open.
- **Steps:**
  1. Navigate to the itinerary section.
  2. Inspect the day labels and plan entries in order.
- **Expected result:** Entries are labeled consecutively from Day 1 through the package duration, with no missing or repeated days.
- **Requirement coverage:** REQ-003, AC-003

## TC-004 — Inclusions, hotel, and transport sections are visible

- **Type:** Positive
- **Preconditions:** A package detail page is open.
- **Steps:**
  1. Inspect the inclusions section.
  2. Inspect hotel/stay details.
  3. Inspect transport details.
- **Expected result:** All three sections contain the selected package's mock data and are clearly labeled.
- **Requirement coverage:** REQ-004, AC-004

## TC-005 — Package gallery and FAQs are usable

- **Type:** Positive / Accessibility
- **Preconditions:** A package detail page with photos and FAQs is open.
- **Steps:**
  1. Click the next arrow on the package photo and check the counter.
  2. Click the previous arrow on the first photo (wrap-around).
  3. Expand an FAQ, then use Space on the focused summary to toggle it closed and open again.
- **Expected result:** Only one large photo is shown at a time — no thumbnail grid — the next/previous arrows change the photo, the counter and dots follow, and the photo has meaningful alt text; FAQ answers expand/collapse by pointer and keyboard.
- **Requirement coverage:** REQ-005, AC-005

## TC-006 — Package enquiry preselects package and saves its reference

- **Type:** Positive / Firestore integration
- **Preconditions:** Firestore Security Rules are deployed and package detail page is open.
- **Steps:**
  1. Activate “Enquire about this trip”.
  2. Verify the contact form selects the current package.
  3. Fill valid contact details and submit the enquiry.
  4. Verify success feedback and the Firestore document's `packageId` and `packageName` fields.
- **Expected result:** Enquiry is saved in `contactEnquiries` with the selected package reference; form shows success and resets.
- **Requirement coverage:** REQ-006, AC-006

## TC-007 — Package detail is responsive and keyboard accessible

- **Type:** Responsive / Accessibility
- **Preconditions:** A package detail page is open.
- **Steps:**
  1. Inspect the page at desktop and mobile viewport sizes.
  2. Use Tab to focus “Enquire about this trip” and press Enter.
  3. Use the package FAQ summary with the keyboard.
- **Expected result:** Content reflows without horizontal overflow; focus is visible, keyboard activation works, and enquiry opens the contact form with the package selected.
- **Requirement coverage:** REQ-007, AC-007

## TC-008 — Unknown package URL shows a not-found state

- **Type:** Negative / Boundary
- **Preconditions:** None.
- **Steps:**
  1. Open `/packages/not-a-real-package`.
- **Expected result:** A friendly not-found message and a link back to tour packages are shown; the page does not crash.
- **Requirement coverage:** REQ-002, AC-002

## Playwright CLI execution notes

- These cases must be run using the project-local Playwright CLI and OpenCode `playwright-cli` skill; do not create or run a test script.
- Save evidence for every case under `test-results/evidence/` and record PASS/FAIL/BLOCKED with the evidence path below.
- Sample package details are in `src/mockData.js`; all listed hotels, transport, itinerary, inclusions, FAQs, and prices are illustrative.

## Execution results

Executed manually with Playwright CLI `0.1.22` using the OpenCode `playwright-cli` skill, against the local preview and the deployed site at `https://tour-83b6c.web.app`. No test script was used. Synthetic Firestore enquiries were deleted after verification.

| Case | Result | Evidence |
| --- | --- | --- |
| TC-001 | PASS | [Package cards](../../test-results/evidence/tour-packages/TC-001-package-cards.png) |
| TC-002 | PASS | [Shimla detail route](../../test-results/evidence/tour-packages/TC-002-detail-route.png) |
| TC-003 | PASS — all four sample itineraries match their durations | [Shimla](../../test-results/evidence/tour-packages/TC-003-day-plan.png), [Manali snapshot](../../test-results/evidence/tour-packages/TC-003-manali-itinerary.yml), [Spiti snapshot](../../test-results/evidence/tour-packages/TC-003-spiti-itinerary.yml), [Mussoorie snapshot](../../test-results/evidence/tour-packages/TC-003-mussoorie-itinerary.yml), [live Manali](../../test-results/evidence/tour-packages/TC-003-live-manali-itinerary.png) |
| TC-004 | PASS | [Inclusions, hotel, transport](../../test-results/evidence/tour-packages/TC-004-inclusions-hotel-transport.png) |
| TC-005 | PASS — gallery selection and FAQ mouse/keyboard behavior | [Gallery](../../test-results/evidence/tour-packages/TC-005-photo-gallery.png), [FAQ](../../test-results/evidence/tour-packages/TC-005-faq-expanded.png), [keyboard snapshot](../../test-results/evidence/tour-packages/TC-005-faq-keyboard.yml) |
| TC-006 | PASS — package preselected and Firestore payload stored package ID/name | [Prefilled enquiry](../../test-results/evidence/tour-packages/TC-006-package-enquiry-prefill.png), [Firestore success](../../test-results/evidence/tour-packages/TC-006-firestore-package-save.png), [live prefill](../../test-results/evidence/tour-packages/TC-006-live-package-prefill.png) |
| TC-007 | PASS — 390px layout and keyboard enquiry verified | [Mobile detail](../../test-results/evidence/tour-packages/TC-007-mobile-detail.png), [layout boxes](../../test-results/evidence/tour-packages/TC-007-mobile-layout.yml), [keyboard enquiry](../../test-results/evidence/tour-packages/TC-007-keyboard-enquiry.png) |
| TC-008 | PASS | [Unknown package route](../../test-results/evidence/tour-packages/TC-008-unknown-package.png), [live unknown route](../../test-results/evidence/tour-packages/TC-008-live-unknown-package.png) |

All eight cases passed. The live package list also confirmed the updated summary, inclusions, and `Starting from ₹...` pricing on the homepage ([live cards](../../test-results/evidence/tour-packages/TC-001-live-package-cards.png)). Console showed 0 errors on the deployed build.
