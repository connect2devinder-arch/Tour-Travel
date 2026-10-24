# Razorpay Test-Mode Booking Payments

## Overview
Replace the browser-only simulated card/UPI form with Razorpay Checkout in Test Mode. A Firebase Cloud Function calculates the booking amount from trusted package data, creates the Razorpay order, and verifies the payment signature and gateway payment status before the booking can be confirmed.

**Deployment status:** Test Mode secrets are in Firebase Secret Manager; Cloud Functions, Firestore rules and Hosting are deployed; the `payment.captured` Razorpay webhook is configured. Live order creation and Checkout launch have been verified. Automated payment completion was stopped by Razorpay's CAPTCHA, so a manual Test Mode capture is still needed to verify the final callback end-to-end. No Razorpay secret belongs in the frontend, `.env` committed to Git, or chat.

## Goal
Let guests complete a real Razorpay checkout in sandbox mode, while preventing client-side amount tampering or fake payment confirmation. Test mode must not charge real money.

## Actors
- **Guest / traveller** — submits booking details and completes Razorpay Checkout.
- **Razorpay** — creates order, processes the sandbox payment, and sends a signed webhook.
- **Firebase Cloud Functions** — computes authoritative amount, creates orders, verifies signatures/captured payment, updates booking and notification records.
- **Admin** — sees the resulting booking/payment status in `/admin/bookings`.

## Functional requirements
- **REQ-001:** The browser must never receive or store `RAZORPAY_KEY_SECRET` or webhook secret.
- **REQ-002:** A callable Cloud Function validates guest/package/traveller details and computes the amount server-side (`published package price × travellers`).
- **REQ-003:** Sample packages not present in Firestore are bookable using the server-side sample price catalogue; managed packages must exist and have `status: published` in Firestore.
- **REQ-004:** The server creates a Razorpay order in INR with amount in paise and a booking reference receipt.
- **REQ-005:** The server, not the browser, writes the `pending_payment` booking with order ID and queues booking-created notification records.
- **REQ-006:** The frontend opens Razorpay Checkout using only the public Key ID, order ID, amount, currency and guest prefill details.
- **REQ-007:** After Checkout returns payment ID/order ID/signature, a callable Cloud Function validates the HMAC signature, fetches payment details from Razorpay, validates order/amount/currency and confirms only a captured payment.
- **REQ-008:** Payment confirmation and status history are written by trusted server code; client Firestore rules deny direct booking create and non-admin update.
- **REQ-009:** A signed `payment.captured` webhook can confirm a booking if the guest closes the browser before the Checkout callback finishes; confirmation is idempotent.
- **REQ-010:** A second verification/webhook for an already-paid booking must not duplicate payment notifications.
- **REQ-011:** Razorpay Test Mode keys only (`rzp_test_…`) are accepted by the order function for this stage.
- **REQ-012:** Admin booking UI continues to show the existing booking, payment reference, amount and status.

## Acceptance criteria
- **AC-001 (REQ-002, REQ-004):** Given a published package priced ₹15,999 and 2 travellers, when a guest starts checkout, then the server creates a Razorpay order for ₹31,998 (3,199,800 paise), INR, regardless of any amount supplied by the browser.
- **AC-002 (REQ-003):** Given a bundled sample package without a Firestore package document, when a guest starts checkout, then its server-side sample price is used; a Firestore draft package is rejected.
- **AC-003 (REQ-005):** Given a valid checkout request, when the order is created, then Firestore has one `pending_payment` booking with the generated `ELW-XXXXXX` reference and the Razorpay order ID.
- **AC-004 (REQ-007):** Given a valid Razorpay test payment signature, when verification succeeds and Razorpay reports matching captured amount/order/currency, then booking status becomes `confirmed`, payment status `paid`, payment ID is stored, history is appended, and payment-received notifications are queued.
- **AC-005 (REQ-007, REQ-008):** Given a forged signature, wrong order ID, wrong amount, non-INR currency or uncaptured payment, when verification runs, then booking stays `pending_payment` and no paid notification is queued.
- **AC-006 (REQ-008):** Given a browser attempts a direct Firestore booking create or payment update, when the rules evaluate it, then it is denied; trusted Cloud Functions can write via Admin SDK.
- **AC-007 (REQ-009, REQ-010):** Given the valid signed `payment.captured` webhook is received twice, then the booking is confirmed once and only one email/SMS payment notification pair is created.
- **AC-008 (REQ-011):** Given a non-test Key ID, when order creation is attempted, then the function rejects it during this Test Mode phase.
- **AC-009 (REQ-001):** Given the built frontend bundle, when searched for the Razorpay Secret, webhook secret or secret-bearing Basic auth, then none is present.

## Business rules and validation
- Amount is calculated in integer rupees from server-owned data and converted to integer paise (`amount × 100`). The client-supplied amount is ignored.
- Traveller count is 1–20; guest name 2–100 chars; valid email; phone 7–30 allowed characters; travel date today or later; notes max 1,500 chars.
- Test Key ID must start with `rzp_test_` until a separately reviewed Live Mode deployment.
- Razorpay Checkout signature is HMAC-SHA256 of `order_id|payment_id` using the server-only key secret and compared with a timing-safe comparison.
- The payment details fetched from Razorpay must match order ID, expected amount in paise and INR currency; payment must be captured before confirmation.
- The webhook signature is verified against the raw HTTP request body using a separate webhook secret.
- Booking creation and payment confirmation use Firebase Admin SDK, which bypasses client Firestore rules. Client rules prohibit booking create/update.
- Notification queue records remain simulated; no email/SMS provider is part of this requirement.

## Dependencies and constraints
- Firebase Cloud Functions (2nd gen, Node.js 22), Firebase Admin SDK, Razorpay Test Mode account/API keys.
- Firebase project must use the Blaze plan for Cloud Functions and Secret Manager.
- Secrets to configure: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` via Firebase Functions Secret Manager.
- Razorpay Dashboard webhook must point to the deployed `razorpayWebhook` HTTPS endpoint and subscribe to `payment.captured`.
- The public Key ID may be sent to Checkout; the Key Secret and webhook secret must remain server-side.
- Existing sample package catalog is duplicated server-side so bundled sample packages remain bookable. Keep the server catalogue in sync with `src/mockData.js` until packages are fully managed in Firestore.
- **Live Mode is still blocked** until the owner separately approves Live keys, KYC/production readiness, refund policy and operational review.

## Open questions
- **TBD:** What refund/cancellation policy should apply before enabling Live Mode?
- **TBD:** Should an authorized (not yet captured) payment be captured automatically or wait for manual capture? Current code requests capture after authorization.
- **TBD:** When will Live Mode be enabled, and who will approve the switch from `rzp_test_` keys?
- **TBD:** Is a separate reconciliation job needed for delayed/missed webhooks?
