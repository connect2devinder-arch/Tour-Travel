# Elsewhere Travel — Website Working Flow

> **Current architecture:** React/Vite app on Firebase Hosting → Firebase Auth + Firestore + Firebase Storage. **SQL is not connected yet.**
>
> **POC limitations:** payment is simulated in the browser; email/SMS notifications are saved as `queued` records in Firestore, but no delivery provider is connected.

## 1. Overall system

```mermaid
flowchart LR
    Visitor[Visitor / Traveller]
    Admin[Site Admin\nconnect2devinder@gmail.com]
    Writer[Signed-in Community Writer]

    subgraph Hosting[Firebase Hosting — tour-83b6c.web.app]
        SPA[React + Vite website\nHome · Destinations · Packages · Journal · Forms]
        AdminUI[Admin area\nPackages · Bookings · Journal review · Subscribers]
        WriteUI[Writer area\n/write · My posts · Post editor]
    end

    subgraph Firebase[Firebase Project — tour-83b6c]
        Auth[Firebase Authentication\nGoogle sign-in]
        Rules[Firestore Security Rules\nAdmin / author / guest access]
        DB[(Cloud Firestore)]
        Storage[(Firebase Storage\nImages and blog covers)]
    end

    EmailSMS[Email / SMS provider\nNOT CONNECTED]
    Payment[Payment gateway\nNOT CONNECTED — demo only]
    SQL[(SQL database\nNOT CONNECTED)]

    Visitor --> SPA
    Admin --> SPA
    Writer --> SPA
    SPA -->|Read published content / submit forms| Rules
    AdminUI -->|Admin CRUD / moderation| Rules
    WriteUI -->|Own drafts / submit for review| Rules
    SPA -->|Google sign-in| Auth
    AdminUI -->|Google sign-in + admin check| Auth
    WriteUI -->|Google sign-in + author UID| Auth
    Rules --> DB
    SPA -->|Load image URLs| Storage
    AdminUI -->|Admin cover / package photo upload| Storage
    DB -.->|Queued records only; no delivery| EmailSMS
    SPA -.->|Simulated card / UPI flow; no charge| Payment
    SPA -.->|No connection yet| SQL
```

## 2. What data is stored where

```mermaid
flowchart TB
    App[React website]
    App --> Auth[(Firebase Auth\nGoogle user + UID + email)]
    App --> Posts[(Firestore: posts\nPublished posts, drafts, review status, author UID)]
    App --> Packages[(Firestore: packages\nAdmin-managed packages + per-package photo URLs)]
    App --> Bookings[(Firestore: bookings\nGuest details, amount, payment/status history)]
    App --> Enquiries[(Firestore: contactEnquiries\nContact form submissions)]
    App --> Notifications[(Firestore: notifications\nQueued email/SMS/enquiry message records)]
    App --> Newsletter[(Firestore: newsletter\nSubscriber email, source, status)]
    App --> Admins[(Firestore: config/admins\nAdmin email allowlist)]
    App --> Media[(Firebase Storage\ndestinations/* · site/* · packages/* · journal/covers/*)]

    Static[Bundled sample data\nsrc/mockData.js] -.->|Fallback if no published Firestore package| App
    Config[Bundled site config\nsrc/siteConfig.js] -.->|Phone, enquiry email, address, admin email| App
```

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
    Site-->>Visitor: Show one photo; arrows/dots change the photo
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
    Site->>DB: Create notifications record\nrecipient = connect2devinder@gmail.com\ntrigger = enquiry_received, status = queued
    DB-->>Site: Notification saved
    Site-->>Visitor: Show enquiry submitted confirmation
    Admin->>DB: Read notifications (admin only)
    DB-->>Admin: Enquiry message and contact details
    Note over DB,Mail: A queued notification is not an actual email. No email provider is connected.
```

## 5. Visitor: booking and demo payment

```mermaid
sequenceDiagram
    actor Visitor
    participant Site as Booking pages
    participant DB as Firestore
    participant Admin as Admin bookings panel
    participant Gateway as Payment gateway (not connected)
    participant Notify as Email/SMS provider (not connected)

    Visitor->>Site: Open /book/:packageId and fill booking form
    Site->>Site: Validate fields; calculate price × travellers in browser
    Site->>DB: Create booking (pending_payment) + initial history
    Site->>DB: Queue booking_created email + SMS notification records
    DB-->>Site: Booking reference ELW-XXXXXX
    Visitor->>Site: Complete demo card/UPI payment
    Site->>Site: Simulate payment result (no money moves)
    Site->>DB: Mark booking confirmed + payment paid + add history
    Site->>DB: Queue payment_received email + SMS records
    Site-->>Visitor: Show confirmation and booking reference
    Admin->>DB: Read/update booking status
    Admin->>DB: Add status history + queue status_changed notifications
    DB-->>Admin: Booking and notification records
    Note over Site,Gateway: No real gateway, server-side payment verification, refund, or charge exists yet.
    Note over DB,Notify: Notification records are queued only; no real email/SMS is sent.
```

### Booking access

- Guest bookings can be read by the matching signed-in email or by an admin.
- Admin can search/filter bookings and update their status.
- Payment amount is currently computed client-side; production needs server-side calculation and gateway verification.

## 6. Community writer: submit a blog post for approval

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
    Note over Writer,DB: Writer can only read/edit/delete their own posts; writer cannot publish.
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

## 7. Admin: sign-in and content management

```mermaid
flowchart LR
    Admin[Admin signs in with Google] --> Auth[Firebase Auth returns UID/email]
    Auth --> Check{Email in config/admins?}
    Check -->|Yes| AdminUI[Show Write / Admin tools]
    Check -->|No| GuestUI[Admin gate: show access denied]
    AdminUI --> Packages[Create/edit/publish packages]
    AdminUI --> Review[Approve or request changes on community posts]
    AdminUI --> Bookings[Search bookings / update status]
    AdminUI --> Notifications[Review queued notification records]
    AdminUI --> Subscribers[View newsletter subscribers]
    Packages --> DB[(Firestore)]
    Review --> DB
    Bookings --> DB
    Notifications --> DB
    Subscribers --> DB
    AdminUI --> Storage[(Firebase Storage)]
```

## 8. Real vs. simulated — important

| Feature | Current behaviour |
|---|---|
| Google sign-in | Real Firebase Authentication |
| Firestore reads/writes | Real database, protected by Firestore rules |
| Images | Real Firebase Storage URLs |
| Contact enquiry | Saved in Firestore; notification record queued for the team |
| Newsletter signup | Saved in Firestore; admin can view subscribers |
| Booking | Saved in Firestore; guest/admin access rules apply |
| Payment | **Simulated**; no card/UPI charge or payment gateway |
| Email / SMS | **Simulated**; records are queued in Firestore, no message delivered |
| SQL | **Not connected**; current system of record is Firestore |

## 9. Access rules at a glance

| Data | Visitor | Signed-in author | Admin |
|---|---|---|---|
| Published packages | Read | Read | Read/write |
| Published blog posts | Read | Read | Read/write + moderation |
| Own draft/pending blog posts | No | Read/write own only | Read/write all |
| Other user's draft/pending post | No | No | Read/write |
| Own booking | Matching email only | Matching email only | Read/update all |
| Contact enquiries | Submit only | Submit only | Notification record visible; enquiry collection itself is not readable from client |
| Newsletter subscribers | Subscribe only | Subscribe only | Read list |
| Storage images | Public read | Public read | Admin upload under allowed paths |
