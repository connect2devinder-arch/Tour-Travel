# Test Cases — Destination Cards Open the Package Page

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / AC-001 | Clicking a destination card opens its package page | High |
| TC-002 | REQ-002 / AC-002 | Save (heart) button saves without navigating | High |
| TC-003 | REQ-004 / AC-003 | "See the places in X" opens the place carousel | High |
| TC-004 | REQ-005 / AC-004 | `?destination=<id>` opens that destination's detail section | Medium |
| TC-005 | REQ-006 / AC-005 | Search result cards link to the package page too | Medium |
| TC-006 | REQ-003 | Destination without a package falls back to the detail section | Low |

## TC-001 — Clicking a destination card opens its package page
- **Type:** Positive
- **Preconditions:** Homepage is open and scrolled to the destinations section.
- **Steps:**
  1. Click the image on the Shimla destination card.
  2. Go back and click "Explore" on the Manali card.
- **Expected result:** Step 1 opens `/packages/shimla-escape` with the heading "Shimla Hill Escape"; step 2 opens `/packages/manali-valley` with the heading "Manali Valley Break".
- **Requirement coverage:** REQ-001, AC-001

## TC-002 — Save (heart) button saves without navigating
- **Type:** Alternate
- **Preconditions:** Homepage is open with the destinations section in view.
- **Steps:**
  1. Click the heart button on the first destination card.
- **Expected result:** The heart switches to the saved state (`aria-pressed="true"`) and the browser stays on the homepage — no navigation happens.
- **Requirement coverage:** REQ-002, AC-002

## TC-003 — "See the places in X" opens the place carousel
- **Type:** Positive
- **Preconditions:** A package detail page is open (for example `/packages/shimla-escape`).
- **Steps:**
  1. Click "See the places in Shimla".
- **Expected result:** The browser moves to `/?destination=shimla#destinations`, the destination detail section renders with the heading "A little more Shimla." and the place carousel caption shows the first place ("Mall Road").
- **Requirement coverage:** REQ-004, AC-003

## TC-004 — `?destination=<id>` opens that destination's detail section
- **Type:** Alternate
- **Preconditions:** None.
- **Steps:**
  1. Open `/?destination=mussoorie`.
- **Expected result:** The Mussoorie destination detail section is rendered (heading "A little more Mussoorie.") and the view scrolls to it.
- **Requirement coverage:** REQ-005, AC-004

## TC-005 — Search result cards link to the package page too
- **Type:** Positive
- **Preconditions:** Homepage is open.
- **Steps:**
  1. Type "manali" in the trip search and submit.
  2. Click the Manali result card.
- **Expected result:** Step 2 opens `/packages/manali-valley` rather than the inline destination detail section.
- **Requirement coverage:** REQ-006, AC-005

## TC-006 — Destination without a package falls back to the detail section
- **Type:** Alternate
- **Preconditions:** A destination has no packages (for example, a destination whose only package is unpublished).
- **Steps:**
  1. Click that destination's card.
- **Expected result:** The card keeps the old behaviour — the inline destination detail section opens instead of a package page, and no broken/empty package route is opened.
- **Requirement coverage:** REQ-003
