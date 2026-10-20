# Test Cases — Premium Destination Images and Storage

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / AC-001 | Each destination finds 4–5 drone/aerial candidates | High |
| TC-002 | REQ-002 / AC-002 | Images upload to Firebase Storage and are publicly readable | High |
| TC-003 | REQ-003 / AC-003 | Destination cards and gallery use Storage images | High |
| TC-004 | REQ-004 / AC-004 | Package detail gallery uses Storage images | High |
| TC-005 | REQ-005 / AC-005 | No broken images and alt text present | High |
| TC-006 | REQ-006 / AC-006 | Images render responsively on mobile and desktop | Medium |

## TC-001 — Each destination finds 4–5 drone/aerial candidates

- **Type:** Positive / Search
- **Preconditions:** Playwright CLI and browser available; Unsplash reachable.
- **Steps:**
  1. For each destination (Shimla, Manali, Lahaul & Spiti, Mussoorie), search Unsplash for drone/aerial photos.
  2. Collect candidate image URLs.
- **Expected result:** At least 4 candidate images are found for each destination.
- **Requirement coverage:** REQ-001, AC-001

## TC-002 — Images upload to Firebase Storage and are publicly readable

- **Type:** Positive / Storage
- **Preconditions:** Firebase Storage bucket `tour-83b6c.firebasestorage.app` is active.
- **Steps:**
  1. Upload the selected images to the bucket under destination folders.
  2. Fetch each public URL in a browser.
- **Expected result:** Each image is stored and returns a successful HTTP response without authentication.
- **Requirement coverage:** REQ-002, AC-002

## TC-003 — Destination cards and gallery use Storage images

- **Type:** Positive / UI
- **Preconditions:** Homepage is available with updated mock data.
- **Steps:**
  1. Open the homepage and inspect destination cards.
  2. Open a destination detail gallery.
- **Expected result:** Images are served from Firebase Storage URLs and render correctly.
- **Requirement coverage:** REQ-003, AC-003

## TC-004 — Package detail gallery uses Storage images

- **Type:** Positive / UI
- **Preconditions:** A package detail page is available.
- **Steps:**
  1. Open `/packages/shimla-escape`.
  2. Inspect the package gallery images.
- **Expected result:** Gallery images are Firebase Storage URLs and render correctly.
- **Requirement coverage:** REQ-004, AC-004

## TC-005 — No broken images and alt text present

- **Type:** Positive / Integrity
- **Preconditions:** Homepage and package detail pages are available.
- **Steps:**
  1. Load homepage and each package detail page.
  2. Check browser console for failed image requests.
  3. Inspect image alt attributes.
- **Expected result:** No failed image requests; meaningful alt text is present.
- **Requirement coverage:** REQ-005, AC-005

## TC-006 — Images render responsively on mobile and desktop

- **Type:** Responsive
- **Preconditions:** Homepage and package detail pages are available.
- **Steps:**
  1. Inspect destination/package images at desktop and mobile viewport sizes.
  2. Check for horizontal overflow.
- **Expected result:** Images scale correctly and layout does not break.
- **Requirement coverage:** REQ-006, AC-006

## Playwright CLI execution notes

- Use the project-local Playwright CLI and the OpenCode `playwright-cli` skill; do not create or run a test script.
- Save evidence for every case under `test-results/evidence/` and record PASS/FAIL/BLOCKED below.
- Source is Unsplash; drone/aerial is preferred but best available aerial/landscape is acceptable.

## Execution results

Images were searched on Unsplash via Playwright (headless was blocked, so the real Chrome browser was used), downloaded, uploaded to Firebase Storage `destinations/<place>/<n>.jpg`, and integrated into `src/mockData.js`.

| Case | Result | Evidence |
| --- | --- | --- |
| TC-001 | PASS — 5 candidates per destination found on Unsplash | `test-results/evidence/destination-images/` (all four destination sets) |
| TC-002 | PASS — 20 images uploaded; public URL returned HTTP 200 `image/jpeg` | `test-results/evidence/destination-images/TC-002-storage-public.png` |
| TC-003 | PASS — destination cards and gallery use Storage URLs, all loaded | [cards](../../test-results/evidence/destination-images/TC-003-destination-cards.png), [gallery](../../test-results/evidence/destination-images/TC-003-destination-gallery.png) |
| TC-004 | PASS — package gallery uses Storage URLs, all loaded | [local](../../test-results/evidence/destination-images/TC-004-package-gallery.png), [live](../../test-results/evidence/destination-images/TC-004-live-package-gallery.png) |
| TC-005 | PASS — 0 broken images, 0 console errors, alt text present | [live mobile](../../test-results/evidence/destination-images/TC-006-mobile-package.png) |
| TC-006 | PASS — 390px viewport: no overflow, all images load | [mobile](../../test-results/evidence/destination-images/TC-006-mobile-package.png) |

Live verification at `https://tour-83b6c.web.app`: 8 destination images all from `firebasestorage.googleapis.com`, all loaded, 0 broken, 0 console errors.
