# Test Cases — Header Active Link and Footer Newsletter Signup

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / AC-001 | Header marks the section in view | High |
| TC-002 | REQ-002 / AC-001 | Journal and package routes light their own link | High |
| TC-003 | REQ-003 / AC-002 | Hero state defaults to Destinations | Medium |
| TC-004 | REQ-005 / AC-003 | Footer signup saves a subscriber | High |
| TC-005 | REQ-007 / AC-004 | Homepage newsletter band saves a subscriber | Medium |
| TC-006 | REQ-008 / AC-005 | Invalid email is rejected by the rules | Medium |
| TC-007 | REQ-009 / AC-006 | Admin sees the subscriber list | Medium |
| TC-008 | REQ-010 / AC-007 | Unconfigured build shows an error instead of crashing | Low |

## TC-001 — Header marks the section in view
- **Type:** Positive
- **Preconditions:** Homepage is open.
- **Steps:**
  1. Scroll to the packages section.
  2. Scroll to the contact section.
- **Expected result:** At the packages section the "Packages" link is active; at the contact section the "Contact" link is active — exactly one link active at a time.
- **Requirement coverage:** REQ-001, REQ-004, AC-001

## TC-002 — Journal and package routes light their own link
- **Type:** Alternate
- **Preconditions:** None.
- **Steps:**
  1. Open `/journal`.
  2. Open `/packages/shimla-escape`.
- **Expected result:** The "Journal" link is active on the journal page and the "Packages" link is active on the package page.
- **Requirement coverage:** REQ-002, AC-001

## TC-003 — Hero state defaults to Destinations
- **Type:** Alternate
- **Preconditions:** Homepage is open at the very top.
- **Steps:**
  1. Read the active nav link.
- **Expected result:** "Destinations" is marked active while the visitor is in the hero.
- **Requirement coverage:** REQ-003, AC-002

## TC-004 — Footer signup saves a subscriber
- **Type:** Positive
- **Preconditions:** Firebase is configured.
- **Steps:**
  1. Scroll to the footer newsletter box.
  2. Enter an email and submit.
- **Expected result:** The status line reads "You're on the list — first postcard soon.", the button switches to "Subscribed ✓", and a `newsletter` document with `source: "footer"` and the lowercased email is written to Firestore.
- **Requirement coverage:** REQ-005, REQ-006, AC-003

## TC-005 — Newsletter signup exists in one place only
- **Type:** Alternate
- **Preconditions:** Homepage is open.
- **Steps:**
  1. Scroll the whole page and count the newsletter signup forms.
  2. Click the manifesto "Get to know us" link.
- **Expected result:** Only one signup form exists (in the footer) — the duplicated homepage band is gone — and the manifesto link scrolls to the footer signup input (`#footer-email`).
- **Requirement coverage:** REQ-007, AC-004

## TC-006 — Invalid email is rejected by the rules
- **Type:** Negative
- **Preconditions:** Firestore rules are deployed.
- **Steps:**
  1. Attempt to write a `newsletter` document with `email: "abc"`.
- **Expected result:** The write is denied by the Firestore rules.
- **Requirement coverage:** REQ-008, AC-005

## TC-007 — Admin sees the subscriber list
- **Type:** Positive
- **Preconditions:** An admin is signed in; at least one subscriber exists.
- **Steps:**
  1. Open `/admin/bookings`.
  2. Switch to the "Subscribers" tab.
- **Expected result:** Each subscriber is listed with their email, source and signup date, and the tab shows the total count.
- **Requirement coverage:** REQ-009, AC-006

## TC-008 — Unconfigured build shows an error instead of crashing
- **Type:** Negative
- **Preconditions:** The build has no Firebase configuration.
- **Steps:**
  1. Submit the footer newsletter form.
- **Expected result:** A visible error message appears, the app keeps running and the rest of the page is unaffected.
- **Requirement coverage:** REQ-010, AC-007
