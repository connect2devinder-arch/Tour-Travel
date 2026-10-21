# Test Cases — Package Management, Online Booking & Booking Notifications

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / AC-001 | Admin package list shows published + draft packages | High |
| TC-002 | REQ-002 / AC-002 | Create a package and publish it | High |
| TC-003 | REQ-002 / AC-003 | Edit a published package and see the change on the public detail page | High |
| TC-004 | REQ-002 / AC-004 | Unpublish (back to draft) hides the package from the public site | High |
| TC-005 | REQ-002 / AC-005 | Delete a package from the admin panel | Medium |
| TC-006 | REQ-003 / AC-006 | Public site falls back to sample packages when Firestore is empty/unavailable | High |
| TC-007 | REQ-004 / AC-007 | "Book this trip" opens the booking form for the right package | High |
| TC-008 | REQ-005 / AC-008 | Booking form validation rejects missing/invalid/past-date input | High |
| TC-009 | REQ-006 / AC-009 | Submitting a valid booking creates a booking + email/SMS notifications | High |
| TC-010 | REQ-007 / AC-010, REQ-015 / AC-019 | Payment step shows the correct amount (price × travellers) | High |
| TC-011 | REQ-008 / AC-011 | Successful demo payment confirms the booking | High |
| TC-012 | REQ-008 / AC-012 | Declined demo payment leaves the booking unpaid | High |
| TC-013 | REQ-009 / AC-013 | Booking keeps a status history | Medium |
| TC-014 | REQ-010 / AC-014 | Admin bookings list filters and search | Medium |
| TC-015 | REQ-011 / AC-015 | Admin status change updates status, history and notifications | High |
| TC-016 | REQ-012 / AC-016 | Notifications panel lists notifications and can mark one sent | Medium |
| TC-017 | REQ-013 / AC-017 | A signed-in guest only sees their own bookings | High |
| TC-018 | REQ-014 / AC-018 | Unconfigured Firebase shows a clear notice instead of failing | Medium |

## TC-001 — Admin package list shows published + draft packages
- **Type:** Positive
- **Preconditions:** Admin account signed in and present in `config/admins`; at least one published and one draft package exists.
- **Steps:**
  1. Open `/admin/packages`.
  2. Read the package list.
- **Expected result:** Every package is listed with its name, destination, price and a status pill reading "Published" or "Draft".
- **Requirement coverage:** REQ-001, AC-001

## TC-002 — Create a package and publish it
- **Type:** Positive
- **Preconditions:** Admin signed in.
- **Steps:**
  1. Open `/admin/packages/new`.
  2. Fill name, destination, price label, price amount, duration, summary, itinerary, inclusions, hotel and transport details.
  3. Click "Publish".
- **Expected result:** A success message is shown, the editor shows the saved package, the package appears in `/admin/packages` with a "Published" pill, and the package is readable in Firestore `packages` with `status: "published"`.
- **Requirement coverage:** REQ-002, AC-002

## TC-003 — Edit a published package and see the change on the public detail page
- **Type:** Positive
- **Preconditions:** A published package exists and is visible publicly.
- **Steps:**
  1. Open `/admin/packages`, click the package, change the price label and summary.
  2. Click "Update".
  3. Open the package's public detail page.
- **Expected result:** The public page shows the new price label and summary; the old values are gone.
- **Requirement coverage:** REQ-002, REQ-003, AC-003

## TC-004 — Unpublish hides the package from the public site
- **Type:** Alternate
- **Preconditions:** A published package exists.
- **Steps:**
  1. Open the package in `/admin/packages` and set status to "Draft", then save.
  2. Reload the homepage and the package's public detail URL.
- **Expected result:** The package no longer appears in the public package list, and the public detail URL shows the "trip not found" state. The package is still listed in the admin panel as a draft.
- **Requirement coverage:** REQ-002, REQ-003, AC-004

## TC-005 — Delete a package
- **Type:** Alternate
- **Preconditions:** A draft package exists in the admin panel.
- **Steps:**
  1. Click "Delete" on the package.
  2. Confirm the browser confirmation dialog.
- **Expected result:** The package is removed from the admin list and no longer exists in Firestore `packages`.
- **Requirement coverage:** REQ-002, AC-005

## TC-006 — Public site falls back to sample packages
- **Type:** Alternate
- **Preconditions:** Either Firestore has no published packages, or Firebase is not configured for the build.
- **Steps:**
  1. Open the homepage.
  2. Open a known sample package URL such as `/packages/shimla-escape`.
- **Expected result:** Sample package cards render with their price and duration, and the sample package detail page loads. The page never renders an empty package area.
- **Requirement coverage:** REQ-003, REQ-014, AC-006

## TC-007 — "Book this trip" opens the booking form
- **Type:** Positive
- **Preconditions:** A package detail page is open.
- **Steps:**
  1. Click "Book this trip".
- **Expected result:** The booking page opens for that package and shows the package name, duration, destination and the amount to be paid.
- **Requirement coverage:** REQ-004, AC-007

## TC-008 — Booking form validation
- **Type:** Negative
- **Preconditions:** The booking form is open.
- **Steps:**
  1. Submit with every field empty.
  2. Enter an invalid email (`not-an-email`) and a short phone number, submit.
  3. Select a travel date in the past, submit.
- **Expected result:** Each invalid submission shows an inline error next to the offending field, no booking record is written to Firestore, and the form stays on the details step.
- **Requirement coverage:** REQ-005, AC-008

## TC-009 — Submitting a valid booking creates a booking and notifications
- **Type:** Positive
- **Preconditions:** Firebase is configured; the booking form is open with valid data.
- **Steps:**
  1. Fill guest name, email, phone, travel date (today or later) and travellers.
  2. Submit the form.
- **Expected result:** A booking is written to Firestore `bookings` with a reference like `ELW-7QK4M2`, status `pending_payment`, and a `history` entry for `pending_payment`. Two notification records are written to `notifications` (one `email`, one `sms`) with trigger `booking_created`. The UI moves to the payment step.
- **Requirement coverage:** REQ-006, REQ-009, AC-009

## TC-010 — Payment step shows the correct amount
- **Type:** Boundary
- **Preconditions:** A booking for 3 travellers on a package with price amount ₹15,999 exists and the payment step is open.
- **Steps:**
  1. Read the amount shown on the payment step.
  2. Repeat with 1 traveller and with 20 travellers.
- **Expected result:** The amount shown is `₹47,997` for 3 travellers, `₹15,999` for 1 traveller and `₹319,980` for 20 travellers; the currency is INR.
- **Requirement coverage:** REQ-007, REQ-015, AC-010, AC-019

## TC-011 — Successful demo payment confirms the booking
- **Type:** Positive
- **Preconditions:** The payment step is open for a booking in `pending_payment`.
- **Steps:**
  1. Choose the demo card method and enter `4000 0000 0000 0001` with any name, expiry and CVV.
  2. Click "Pay".
- **Expected result:** A payment reference is generated, the booking becomes `confirmed` with payment `paid`, a `history` entry for `confirmed` is added, notifications with trigger `payment_received` are written, and the confirmation screen shows the reference, amount and status.
- **Requirement coverage:** REQ-007, REQ-008, REQ-009, AC-011

## TC-012 — Declined demo payment leaves the booking unpaid
- **Type:** Negative
- **Preconditions:** The payment step is open for a booking in `pending_payment`.
- **Steps:**
  1. Enter the demo decline card `4000 0000 0000 0002`.
  2. Click "Pay".
- **Expected result:** A decline message is shown, the booking stays `pending_payment` with payment not `paid`, and the payment step stays open so the guest can retry.
- **Requirement coverage:** REQ-008, AC-012

## TC-013 — Booking keeps a status history
- **Type:** Positive
- **Preconditions:** A booking exists that has been created and then paid.
- **Steps:**
  1. Open the booking in the admin bookings panel and read the history.
- **Expected result:** The history lists `pending_payment` and `confirmed`, each with a timestamp, in order.
- **Requirement coverage:** REQ-009, AC-013

## TC-014 — Admin bookings list filters and search
- **Type:** Positive
- **Preconditions:** At least three bookings exist with different statuses.
- **Steps:**
  1. Open `/admin/bookings`.
  2. Apply the "confirmed" status filter.
  3. Clear the filter and type part of a booking reference in the search box.
- **Expected result:** The list shows only confirmed bookings after filtering, and only the matching booking after searching; the visible count matches the list.
- **Requirement coverage:** REQ-010, AC-014

## TC-015 — Admin status change updates status, history and notifications
- **Type:** Positive
- **Preconditions:** A confirmed booking exists; the admin is signed in.
- **Steps:**
  1. Open `/admin/bookings`.
  2. Change the booking status to "cancelled" and confirm.
- **Expected result:** The booking status becomes `cancelled`, the history gains a `cancelled` entry, and two new notifications (email + sms) with trigger `status_changed` are written.
- **Requirement coverage:** REQ-011, AC-015

## TC-016 — Notifications panel lists notifications and marks one sent
- **Type:** Positive
- **Preconditions:** At least one notification exists for a booking.
- **Steps:**
  1. Open the notifications view in `/admin/bookings`.
  2. Read a notification entry.
  3. Click "Mark sent" on it.
- **Expected result:** Each entry shows channel, recipient, trigger, body and a `Queued` state; after "Mark sent" the state reads `Sent` and is stored in Firestore.
- **Requirement coverage:** REQ-012, AC-016

## TC-017 — A signed-in guest only sees their own bookings
- **Type:** Negative
- **Preconditions:** Two guests have bookings with different email addresses; one guest is signed in with Google.
- **Steps:**
  1. Open `/bookings` while signed in as guest A.
  2. Try to open guest B's booking by its reference in the URL.
- **Expected result:** Guest A's list contains only guest A's bookings, and guest B's booking is not readable (access denied / not found state).
- **Requirement coverage:** REQ-013, AC-017

## TC-018 — Unconfigured Firebase shows a clear notice
- **Type:** Negative
- **Preconditions:** The build has no Firebase configuration (`.env.local` missing or empty).
- **Steps:**
  1. Open a package detail page and click "Book this trip".
  2. Try to submit the booking form.
- **Expected result:** A visible notice states that online booking is not configured for this build, the submit action stays disabled, the app does not crash, and the rest of the site keeps working with sample packages.
- **Requirement coverage:** REQ-014, AC-006, AC-018

## Known POC limitation — server-side amount verification
- **Type:** Alternate
- **Preconditions:** A booking form is open.
- **Steps:**
  1. Change the amount sent to Firestore from the browser console before submitting.
- **Expected result:** **Blocked by open question.** The POC computes the amount in the browser, so a tampered amount is not currently detected. Verifying the amount server-side is part of the TBD payment-gateway decision (see `requirement.md` → Open questions) and is not asserted as passing behaviour in this POC.
- **Requirement coverage:** REQ-015
