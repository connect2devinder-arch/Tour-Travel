# Test Cases — Razorpay Test-Mode Booking Payments

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-002, REQ-004 / AC-001 | Server creates order using price × travellers | High |
| TC-002 | REQ-003 / AC-002 | Sample package fallback works; draft managed package is blocked | High |
| TC-003 | REQ-005 / AC-003 | Booking and booking-created notifications are server-created | High |
| TC-004 | REQ-007 / AC-004 | Valid captured Razorpay payment confirms booking | High |
| TC-005 | REQ-007 / AC-005 | Invalid signature or payment details do not confirm booking | High |
| TC-006 | REQ-008 / AC-006 | Client cannot create or mark bookings paid directly | High |
| TC-007 | REQ-009, REQ-010 / AC-007 | Duplicate webhook is idempotent | High |
| TC-008 | REQ-011 / AC-008 | Live Key ID is rejected in Test Mode deployment | High |
| TC-009 | REQ-001 / AC-009 | Secret values never ship in frontend bundle | High |

## TC-001 — Server creates order using price × travellers
- **Type:** Positive / Security
- **Preconditions:** Cloud Functions deployed with Razorpay Test Mode secrets; published package `shimla-escape` is available at ₹15,999 per traveller.
- **Steps:**
  1. Submit a valid order request for `shimla-escape`, 2 travellers.
  2. Inspect the Razorpay test order and the returned amount.
- **Expected result:** Razorpay order amount is 3,199,800 paise (₹31,998), INR. A forged client `amount` field is ignored.
- **Requirement coverage:** REQ-002, REQ-004, AC-001

## TC-002 — Sample fallback works; draft managed package is blocked
- **Type:** Alternate / Negative
- **Preconditions:** Test Mode Functions are deployed.
- **Steps:**
  1. Request an order for bundled sample package `manali-valley` when no matching Firestore package exists.
  2. Create a Firestore package document with `status: draft`, then request its order.
- **Expected result:** Step 1 uses the server-side sample price; step 2 returns a failed-precondition error and creates no Razorpay order.
- **Requirement coverage:** REQ-003, AC-002

## TC-003 — Booking and booking-created notifications are server-created
- **Type:** Positive
- **Preconditions:** Test Mode Functions are deployed.
- **Steps:**
  1. Submit valid booking details to `createRazorpayOrder`.
  2. Inspect Firestore `bookings` and `notifications`.
- **Expected result:** A `pending_payment` booking with an `ELW-XXXXXX` reference and Razorpay order ID exists; email and SMS notification records are queued. The browser does not create the booking document.
- **Requirement coverage:** REQ-005, AC-003

## TC-004 — Valid captured payment confirms booking
- **Type:** Positive
- **Preconditions:** A pending booking and valid Razorpay test order exist; the test payment is captured.
- **Steps:**
  1. Complete Razorpay Checkout.
  2. Let the Checkout handler call `verifyRazorpayPayment` with the returned payment ID, order ID and signature.
- **Expected result:** The function verifies signature, order ID, amount and currency; booking becomes `confirmed`, payment becomes `paid`, payment ID and history are saved, and payment-received notification records are queued.
- **Requirement coverage:** REQ-007, AC-004

## TC-005 — Invalid signature/payment details never confirm booking
- **Type:** Negative
- **Preconditions:** A booking is `pending_payment`.
- **Steps:**
  1. Call verification with a forged signature.
  2. Repeat with a valid signature but mismatched order ID, amount or currency.
  3. Repeat when gateway payment is not captured.
- **Expected result:** Each attempt is rejected; booking remains `pending_payment`, payment is not `paid`, and no payment-received notification is queued.
- **Requirement coverage:** REQ-007, AC-005

## TC-006 — Client cannot create or mark bookings paid directly
- **Type:** Negative / Security
- **Preconditions:** Updated Firestore rules are deployed; a guest ID token is available.
- **Steps:**
  1. Attempt direct client SDK create under `bookings`.
  2. Attempt direct update from `pending_payment` to `confirmed`/`paid`.
- **Expected result:** Both client writes are denied. Cloud Functions using Admin SDK can create/update the booking.
- **Requirement coverage:** REQ-008, AC-006

## TC-007 — Duplicate payment webhook is idempotent
- **Type:** Positive / Boundary
- **Preconditions:** One valid `payment.captured` webhook has been processed.
- **Steps:**
  1. Send the same correctly signed webhook a second time.
- **Expected result:** Booking remains confirmed; no duplicate history entry or second payment-received email/SMS pair is added.
- **Requirement coverage:** REQ-009, REQ-010, AC-007

## TC-008 — Live Key ID is rejected in Test Mode
- **Type:** Negative
- **Preconditions:** Test Mode function is deployed.
- **Steps:**
  1. Configure a non-test Key ID in the function secret and invoke order creation.
- **Expected result:** Order creation is rejected because this integration stage requires a Key ID beginning `rzp_test_`.
- **Requirement coverage:** REQ-011, AC-008

## TC-009 — Secret values never ship in frontend bundle
- **Type:** Security
- **Preconditions:** Frontend production build exists.
- **Steps:**
  1. Search built browser JavaScript for the Razorpay Key Secret, webhook secret and Basic-auth header value.
- **Expected result:** None of those secret values appear in built assets; only the public Test Key ID is returned at checkout runtime.
- **Requirement coverage:** REQ-001, AC-009

## Deployment gate

End-to-end Razorpay execution requires the account owner to set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` in Firebase Secret Manager and configure the Razorpay webhook. Do not paste secrets into chat or commit them to Git.
