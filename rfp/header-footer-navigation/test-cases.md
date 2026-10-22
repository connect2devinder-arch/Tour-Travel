# Test Cases — Header and Footer Navigation Structure

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / AC-001 | Header shows only the four primary nav items | High |
| TC-002 | REQ-003 / AC-002 | Footer shows the three sitemap columns | High |
| TC-003 | REQ-004 / AC-003 | Footer section links work from another page | High |
| TC-004 | REQ-006 / AC-004 | Mobile menu shows every item without clipping | High |
| TC-005 | REQ-005 / AC-005 | Footer keeps the brand, copyright and back-to-top | Medium |
| TC-006 | REQ-002 | Header actions (sign-in and CTA) still work | Medium |

## TC-001 — Header shows only the four primary nav items
- **Type:** Positive
- **Preconditions:** Any page is open.
- **Steps:**
  1. Read the main navigation links.
- **Expected result:** Exactly four links: Destinations, Packages, Journal and Contact. Experiences, About and Our way are not in the header.
- **Requirement coverage:** REQ-001, AC-001

## TC-002 — Footer shows the three sitemap columns
- **Type:** Positive
- **Preconditions:** Any page is open.
- **Steps:**
  1. Scroll to the footer.
  2. Read the three columns.
- **Expected result:** "Explore" lists Destinations, Packages, Experiences, Journal; "Company" lists About, Our way, Contact, Admin; "Get in touch" lists the phone, the enquiry email and the office address.
- **Requirement coverage:** REQ-003, AC-002

## TC-003 — Footer section links work from another page
- **Type:** Alternate
- **Preconditions:** The journal page `/journal` is open.
- **Steps:**
  1. Read the href of the footer "Destinations" link.
  2. Click it.
- **Expected result:** The href is `/#destinations` and clicking it lands on the homepage scrolled to the destinations section.
- **Requirement coverage:** REQ-004, AC-003

## TC-004 — Mobile menu shows every item without clipping
- **Type:** Negative / Regression
- **Preconditions:** The viewport is 390px wide.
- **Steps:**
  1. Open the menu toggle.
  2. Compare the nav's scroll height with its client height.
- **Expected result:** The nav is not clipped (`scrollHeight <= clientHeight`); every nav item is visible and tappable. If more items are added later the menu scrolls instead of hiding items.
- **Requirement coverage:** REQ-006, AC-004

## TC-005 — Footer keeps the brand, copyright and back-to-top
- **Type:** Positive
- **Preconditions:** Any page is open.
- **Steps:**
  1. Scroll to the footer bottom.
- **Expected result:** The brand, the tagline, the copyright line and a "Back to top" link are present.
- **Requirement coverage:** REQ-005, AC-005

## TC-006 — Header actions still work
- **Type:** Positive
- **Preconditions:** A visitor (not signed in) is on the homepage.
- **Steps:**
  1. Read the header action area.
- **Expected result:** The "Sign in with Google" button and the "Plan your trip" call to action are present and unchanged.
- **Requirement coverage:** REQ-002
