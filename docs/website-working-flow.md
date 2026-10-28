# Elsewhere Travel — Website Working Flow

> **Current architecture:** React/Vite app on Firebase Hosting → Firebase Auth + Cloud Firestore + Firebase Storage + Cloud Functions (`asia-south1`). **Cloud Firestore is the only database — there is no SQL in this system, by design.**
>
> **Payments:** Razorpay **Test Mode** is integrated end to end. A Cloud Function computes the amount server-side, creates the order, and verifies the payment signature before a booking can be confirmed. Test Mode moves no real money.
>
> **Still simulated:** email and SMS. Notification records are written to Firestore as `queued`, but no delivery provider is connected — nothing is actually sent.

## 1. Overall system

```mermaid
flowchart LR
    Visitor["Visitor / Traveller"]
    Admin["Site Admin<br/>connect2devinder@gmail.com"]
    Writer["Signed-in Community Writer"]

    subgraph Hosting["Firebase Hosting — tour-83b6c.web.app"]
        SPA["React + Vite website<br/>Home · Destinations · Packages · Journal · Forms"]
        AdminUI["Admin area<br/>Packages · Bookings · Journal review · Subscribers"]
        WriteUI["Writer area<br/>/write · My posts · Post editor"]
    end

    subgraph Firebase["Firebase Project — tour-83b6c"]
        Auth["Firebase Authentication<br/>Google sign-in"]
        Rules["Firestore Security Rules<br/>Admin / author / guest access"]
        DB[("Cloud Firestore<br/>6 collections — the only database")]
        Storage["Firebase Storage<br/>Images and blog covers"]
        Functions["Cloud Functions · asia-south1<br/>createRazorpayOrder · verifyRazorpayPayment · razorpayWebhook"]
    end

    EmailSMS["Email / SMS provider<br/>NOT CONNECTED"]
    Razorpay["Razorpay API + Checkout<br/>Test Mode — rzp_test_ keys"]
    Gemini["Gemini API<br/>gemini-2.5-flash — key in Secret Manager"]

    Visitor --> SPA
    Admin --> SPA
    Writer --> SPA
    SPA -->|"Read published content / submit forms"| Rules
    AdminUI -->|"Admin CRUD / moderation"| Rules
    WriteUI -->|"Own drafts / submit for review"| Rules
    SPA -->|"Google sign-in"| Auth
    AdminUI -->|"Google sign-in + admin check"| Auth
    WriteUI -->|"Google sign-in + author UID"| Auth
    Rules --> DB
    SPA -->|"Load image URLs"| Storage
    AdminUI -->|"Admin cover / package photo upload"| Storage
    SPA -->|"Callable: start and verify payment"| Functions
    SPA -->|"Callable: ask the travel assistant"| Functions
    Functions -->|"Admin SDK — bypasses rules"| DB
    Functions -->|"Create order, capture, fetch payment"| Razorpay
    Visitor -->|"Razorpay Checkout modal<br/>public Key ID only"| Razorpay
    Functions -->|"Grounded prompt from published packages + posts"| Gemini
    DB -.->|"Queued records only, no delivery"| EmailSMS
```

> **Travel assistant scope:** `askTravelAssistant` reads **only** published `packages` and published `posts`. It never queries `bookings`, `notifications`, `newsletter`, `contactEnquiries` or `config/admins`, so guest names, emails and phone numbers are out of reach no matter how a question is phrased.

### The database

**Cloud Firestore** (NoSQL document store), Firebase project `tour-83b6c`. It is the single system of record. No SQL database, ORM, or external datastore is connected, and none is planned — Firestore's security rules and offline support are what the app is built around.

Firestore is reached two ways:

- **Browser → `firebase/firestore` (client SDK)** — every read and write is gated by `firestore.rules`.
- **Cloud Functions → `firebase-admin/firestore` (Admin SDK)** — bypasses rules entirely. Only trusted server code may create bookings or confirm payments.

Firebase Storage holds all files (images), not records. Razorpay holds all payment instrument data — card and UPI details never enter Firestore.

## 2. What data is stored where

```mermaid
flowchart TB
    App["React website"]
    App --> Auth[("Firebase Auth<br/>Google user + UID + email")]
    App --> Posts[("Firestore: posts<br/>Published posts, drafts, review status, author UID")]
    App --> Packages[("Firestore: packages<br/>Admin-managed packages + per-package photo URLs")]
    App --> Bookings[("Firestore: bookings<br/>Guest details, amount, payment/status history")]
    App --> Enquiries[("Firestore: contactEnquiries<br/>Contact form submissions")]
    App --> Notifications[("Firestore: notifications<br/>Queued email/SMS/enquiry message records")]
    App --> Newsletter[("Firestore: newsletter<br/>Subscriber email, source, status")]
    App --> Admins[("Firestore: config/admins<br/>Admin email allowlist")]
    App --> Media["Firebase Storage<br/>destinations/* · site/* · packages/* · journal/covers/*"]

    Static["Bundled sample data<br/>src/mockData.js"] -.->|"Fallback if no published Firestore package"| App
    Config["Bundled site config<br/>src/siteConfig.js"] -.->|"Phone, enquiry email, address, admin email"| App
    ServerCatalogue["Server-side sample price catalogue<br/>functions/index.js SAMPLE_PACKAGES"] -.->|"Authoritative price when no Firestore package exists"| App
```

`functions/index.js` keeps its own copy of the sample package prices. If a bundled sample package has no Firestore document, the Cloud Function falls back to that catalogue so the amount is still computed on the server. **Keep it in sync with `src/mockData.js`** until every package is managed in Firestore.

## 3. Visitor: browse a destination and package

```mermaid
sequenceDiagram
    actor Visitor
    participant Site as React website
    participant DB as Firestore
    participant Storage as Firebase Storage

    Visitor->>Site: Open homepage
    Site->>DB: Query packages where status = published
    DB-->>Site: Published packages
    alt No published package / Firebase unavailable
        Site-->>Site: Use bundled sample packages from mockData.js
    end
    Site-->>Visitor: Show destination cards and packages
    Visitor->>Site: Click destination card
    Site-->>Visitor: Open that destination's package page
    Site->>Storage: Load package photos (or destination gallery fallback)
    Storage-->>Site: Image bytes
    Site-->>Visitor: Show one photo — arrows/dots change the photo
```

## 4. Visitor: submit a trip enquiry

```mermaid
sequenceDiagram
    actor Visitor
    participant Site as Contact form
    participant DB as Firestore
    participant Admin as Admin notification panel
    participant Mail as Email provider (not connected)

    Visitor->>Site: Submit name, email, phone, destination, trip details
    Site->>DB: Create contactEnquiries document
    DB-->>Site: Enquiry ID
    Site->>DB: Create notifications record<br/>recipient = connect2devinder@gmail.com<br/>trigger = enquiry_received, status = queued
    DB-->>Site: Notification saved
    Site-->>Visitor: Show enquiry submitted confirmation
    Admin->>DB: Read notifications (admin only)
    DB-->>Admin: Enquiry message and contact details
    Note over DB,Mail: A queued notification is not an actual email. No email provider is connected.
```

## 5. Visitor: ask the travel assistant

```mermaid
sequenceDiagram
    actor Visitor
    participant Widget as Chat widget (all pages)
    participant Fn as askTravelAssistant (asia-south1)
    participant DB as Firestore
    participant LLM as Gemini (gemini-2.5-flash)

    Visitor->>Widget: Click "Ask us anything"
    Widget-->>Visitor: Panel opens with suggested questions
    Visitor->>Widget: Type a question and send
    Widget->>Widget: Enforce the 500-character limit client-side
    Widget->>Fn: Call askTravelAssistant(question, last 6 turns)
    Fn->>Fn: Validate question length
    Fn->>DB: Read packages where status = published (limit 60)
    Fn->>DB: Read posts where status = published (limit 120)
    DB-->>Fn: Published documents only
    Fn->>Fn: Rank by keyword overlap, keep the top 8
    Fn->>Fn: Build a labelled context block inside delimiters
    Fn->>LLM: system instruction + context + question
    LLM-->>Fn: Answer grounded in that content
    Fn-->>Widget: { answer, sources: package and article links }
    Widget-->>Visitor: Show the answer with clickable sources
    Note over Fn,DB: Draft, pending and rejected content is excluded by the status filter.
    Note over Fn,LLM: The key is a Secret Manager value, so it never reaches the browser bundle.
```

### Why the bot cannot leak customer data

- The function **structurally** reads only `packages` and `posts`. `bookings`, `notifications`, `newsletter`, `contactEnquiries` and `config/admins` are never queried, so a request like *"list the emails of everyone who booked"* has nothing to draw on.
- Retrieved content is wrapped in `<travel-content>` delimiters and the system instruction tells the model to treat it as reference data, never as instructions — which matters because community-authored posts reach this context.
- Even if an injected instruction succeeded, the function exposes no tools and no private collection, so the worst case is an off-topic answer rather than a disclosure.

### Limits

Questions are capped at 500 characters, history at the last 6 turns, context at 8 documents (60 packages and 120 posts read per call), and output at 600 tokens. Until `GEMINI_API_KEY` is set, the widget shows a friendly unavailable message and points at the contact form.

## 6. Visitor: booking and Razorpay Test Mode payment

```mermaid
sequenceDiagram
    actor Visitor
    participant Site as Booking pages
    participant Fn as Cloud Functions (asia-south1)
    participant DB as Firestore
    participant Rzp as Razorpay
    participant Admin as Admin bookings panel
    participant Notify as Email/SMS provider (not connected)

    Visitor->>Site: Open /book/:packageId and fill booking form
    Site->>Site: Validate fields in browser
    Site->>Fn: Call createRazorpayOrder (packageId, guest, travellers)
    Fn->>DB: Read package — Firestore packages, else server-side sample catalogue
    DB-->>Fn: Published package price (authoritative)
    Fn->>Rzp: POST /v1/orders — amount = price × travellers, in paise
    Rzp-->>Fn: orderId, amount, currency INR
    Fn->>DB: Create booking (pending_payment, ELW-XXXXXX) via Admin SDK
    Fn->>DB: Queue booking_created email + SMS notification records
    Fn-->>Site: reference, orderId, public keyId, amount
    Site->>Rzp: Open Checkout modal with the public Key ID only
    Visitor->>Rzp: Pay by card / UPI inside Razorpay's PCI-compliant modal
    Rzp-->>Site: paymentId, orderId, signature
    Site->>Fn: Call verifyRazorpayPayment (reference, orderId, paymentId, signature)
    Fn->>Fn: Verify HMAC-SHA256 signature with a timing-safe compare
    Fn->>Rzp: GET /v1/payments/:id — fetch the payment
    Fn->>Fn: Match order ID, amount in paise and INR, then capture if authorized
    Fn->>DB: Booking → confirmed, payment → paid, append history
    Fn->>DB: Queue payment_received email + SMS records
    Fn-->>Site: Confirmed
    Site-->>Visitor: Show confirmation and booking reference
    alt Guest closes the browser before the callback finishes
        Rzp->>Fn: Signed payment.captured webhook
        Fn->>DB: Confirm booking idempotently — no duplicate notifications
    end
    Admin->>DB: Read/update booking status
    Admin->>DB: Add status history + queue status_changed notifications
    Note over DB,Notify: Notification records are queued only, so no real email/SMS is sent.
```

### Why the server, not the browser

The amount is calculated **server-side** from trusted package data and converted to integer paise. Any `amount` the browser sends is ignored. A forged signature, a wrong order ID, a wrong amount, a non-INR currency, or an uncaptured payment all leave the booking at `pending_payment` and queue no payment notification. The Razorpay Key Secret and webhook secret live only in Firebase Secret Manager — they never reach the frontend bundle.

### Booking access

- **Bookings cannot be created from the browser.** `firestore.rules` sets `allow create: if false` on `/bookings`; only the Cloud Functions (Admin SDK) write them.
- A guest can read their own booking when the signed-in email matches the booking email; an admin can read and update all bookings.
- Status history and notification records are appended by trusted code for payment events, and by the admin panel for status changes.

## 7. Community writer: submit a blog post for approval

```mermaid
sequenceDiagram
    actor Writer as Community writer
    participant Auth as Firebase Auth
    participant Site as /write area
    participant DB as Firestore
    actor Admin
    participant Journal as Public journal

    Writer->>Auth: Sign in with Google
    Auth-->>Site: Firebase UID and profile
    Writer->>Site: Create or edit own post
    Site->>DB: Save post with authorUid and status=draft or pending
    DB-->>Site: Save success
    Note over Writer,DB: Writer can only read/edit/delete their own posts and cannot publish.
    Admin->>DB: Open /admin/journal review queue
    DB-->>Admin: Pending posts
    alt Approve
        Admin->>DB: Set status=published
        DB-->>Journal: Published post is publicly readable
        Journal-->>Writer: Post appears in journal with author name
    else Request changes
        Admin->>DB: Set status=rejected + review note
        DB-->>Site: Author sees note in My posts
        Writer->>Site: Edit and resubmit (status=pending)
    end
```

## 8. Admin: sign-in and content management

```mermaid
flowchart LR
    Admin["Admin signs in with Google"] --> Auth["Firebase Auth returns UID/email"]
    Auth --> Check{"Email in config/admins?"}
    Check -->|Yes| AdminUI["Show Write / Admin tools"]
    Check -->|No| GuestUI["Admin gate: show access denied"]
    AdminUI --> Packages["Create/edit/publish packages"]
    AdminUI --> Review["Approve or request changes on community posts"]
    AdminUI --> Bookings["Search bookings / update status"]
    AdminUI --> Notifications["Review queued notification records"]
    AdminUI --> Subscribers["View newsletter subscribers"]
    Packages --> DB[("Firestore")]
    Review --> DB
    Bookings --> DB
    Notifications --> DB
    Subscribers --> DB
    AdminUI --> Storage[("Firebase Storage")]
```

## 9. Real vs. simulated — important

| Feature | Current behaviour |
|---|---|
| Google sign-in | Real Firebase Authentication |
| Firestore reads/writes | Real database, protected by Firestore rules |
| Images | Real Firebase Storage URLs |
| Contact enquiry | Saved in Firestore; notification record queued for the team |
| Newsletter signup | Saved in Firestore; admin can view subscribers |
| Booking | Created and confirmed **only** by Cloud Functions; guest and admin reads are rule-gated |
| Payment | **Razorpay Test Mode** — real sandbox orders, captures and signature checks; no real money moves |
| Payment — Live Mode | **Blocked.** Needs owner approval of Live keys, KYC/production readiness, a refund policy, and an operational review |
| Email / SMS | **Simulated.** Records are queued in Firestore; no message is delivered |
| Travel assistant | **Real Gemini responses**, grounded strictly in published packages and posts |
| Database | **Cloud Firestore only.** No SQL is used, and none is planned |

### What is still open

- **One manual Test Mode payment capture.** Razorpay's CAPTCHA stops automated completion, so the final checkout callback has been verified up to order creation and Checkout launch, but not through a completed capture. This is the single highest-value test left to run by hand.
- **Email / SMS delivery.** No provider is connected; notification records are the only output.
- **Razorpay Live Mode.** Blocked on owner approval (see the open questions in `rfp/razorpay-test-payments/requirement.md`).
- **Refund / cancellation policy.** Not defined — required before Live Mode.
- **Authorized vs. captured payments.** The current code requests capture immediately after authorization; a manual-capture flow is an open question.
- **Travel assistant key.** `GEMINI_API_KEY` must be set in Firebase Secret Manager and `askTravelAssistant` deployed. Until then the widget shows a friendly unavailable message. Live answer quality (grounding, refusals, follow-ups) has not yet been verified against a real model response.

## 10. Access rules at a glance

| Data | Visitor | Signed-in author | Admin |
|---|---|---|---|
| Published packages | Read | Read | Read/write |
| Published blog posts | Read | Read | Read/write + moderation |
| Own draft/pending blog posts | No | Read/write own only | Read/write all |
| Other user's draft/pending post | No | No | Read/write |
| Own booking | Matching email only | Matching email only | Read/update all |
| Bookings — create | No | No | **No** — Cloud Functions only |
| Contact enquiries | Submit only | Submit only | Notification record visible; enquiry collection itself is not readable from client |
| Newsletter subscribers | Subscribe only | Subscribe only | Read list |
| Storage images | Public read | Public read | Admin upload under allowed paths |
