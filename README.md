# Elsewhere Travel

A responsive India-focused travel discovery website built with React and Vite. Sample destinations include Shimla, Manali, Lahaul & Spiti, and Mussoorie. Edit `src/mockData.js` to change the mock destinations and packages.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Use `npm run build` to create a production build.

Destination/package details, INR prices, and the newsletter are sample/demo content. Trip enquiries are saved to the `contactEnquiries` Firestore collection and queue an email notification for the team; actual email delivery, live availability, and newsletter delivery are not configured. Newsletter signups themselves are stored (see the footer). Tour packages can be managed from the admin panel, and guests can place a booking through a simulated payment step — see [Online booking](#online-booking-and-booking-status) for what is real and what is simulated.

## Tour packages

Package cards show duration, itinerary summary, inclusions, and a "Starting from" price. "View details" opens a shareable route such as `/packages/shimla-escape` with a day-by-day plan, inclusions, hotel/transport details, photos, and FAQs. The gallery shows one large photo at a time — use the on-image arrows or the dots to move through the photos. "Enquire about this trip" opens the contact form with that package preselected, and the enquiry stores the package ID/name in Firestore.

### Package photos

Each package carries its own photo set (`photos: [{ src, alt }]` on the package). Manali, Lahaul & Spiti and Mussoorie show their famous places; a package without its own photos falls back to the destination gallery.

Admins manage them in the package editor (`/admin/packages` → edit): pick from the destination's existing images, upload a new photo to Storage (`packages/<packageId>/…`), or paste an image URL — and edit the alt text of each photo.

## Destination images

Each destination has 5 drone/aerial photos sourced from Unsplash and stored in Firebase Storage under `destinations/<place>/<n>.jpg` (bucket `tour-83b6c.firebasestorage.app`). The destination cards, destination galleries, and package detail galleries all load these images. Objects are public-read so the browser can load them directly.

All site imagery is self-hosted on Firebase Storage — the hero and manifesto backgrounds live under `site/hero.jpg` and `site/manifesto.jpg`. No runtime requests go to Unsplash.

## Destination place carousels

Each destination detail section shows a carousel of its famous tourist places with back/forward arrows and dot indicators. Every slide shows the place name as a caption. Place photos are stored under `destinations/<place>/<name>.jpg` in Firebase Storage:
- Shimla: Mall Road, The Ridge, Jakhu Temple, Naldehra, Kufri
- Manali: Mall Road, Hadimba Temple, Solang Valley, Old Manali, Vashisht Hot Springs
- Lahaul & Spiti: Key Monastery, Dhankar Monastery, Chandratal Lake, Kibber Village, Tabo Monastery
- Mussoorie: Mall Road, Gun Hill, Kempty Falls, Lal Tibba, Company Garden

## Destination cards open the package

A destination card in the **Destinations** section (image and the "Explore" action) links straight to that destination's tour package page, so a guest goes from "somewhere calling?" to the bookable trip in one click. The heart button still only saves the destination — it does not navigate.

The place carousel stays reachable from the package page: **See the places in {destination}** opens the homepage with that destination's detail section, using `/?destination=<id>#destinations`. A destination with no package keeps the old behaviour and opens its detail section inline.

## Hero auto-slideshow

The hero background rotates through 5 slides with a cross-fade. It pauses while the visitor interacts with the hero and resumes after an idle delay. Slides, interval, and resume delay live in `src/heroSlides.js`. `prefers-reduced-motion` disables autoplay.

## Playwright CLI

The project includes `@playwright/cli` and an OpenCode skill at `.opencode/skills/playwright-cli/`.

```powershell
node .\node_modules\@playwright\cli\playwright-cli.js --help
node .\node_modules\@playwright\cli\playwright-cli.js open http://localhost:5173
```

CLI snapshots and logs are written to `.playwright-cli/` (git-ignored).

## Google sign-in

This app uses the Firebase Web SDK. Local Firebase web configuration is kept in ignored `.env.local`; copy `.env.example` and supply the Firebase Web App values when setting up another checkout.

Google sign-in is enabled for the deployed Firebase project. The live flow has been verified to open Google's account sign-in page. For local testing, ensure `localhost` is listed under Firebase Console → Authentication → Settings → Authorized domains.

## Contact details

Phone number, enquiry email and office address live in one place: `src/siteConfig.js`. They are shown **only in the footer** — the contact section on the page holds just the enquiry form, so nothing is duplicated.

Trip enquiries are addressed to **connect2devinder@gmail.com**. When a guest submits the contact form, the enquiry is saved in the `contactEnquiries` Firestore collection and an email notification is queued for that address with trigger `enquiry_received` — it shows up in the admin **Notifications** tab (`/admin/bookings`). Real email delivery still needs a provider and Cloud Functions; in this POC the notification is stored and can be marked as sent by hand.

## Header and footer navigation

The header carries the primary journey only: **Destinations · Packages · Journal · Contact**, plus the sign-in button and the "Plan your trip" call to action. The link for the section you are in is marked active — on the homepage it follows the scroll position, and `/journal` or `/packages/:id` light up their own link.

The footer holds a newsletter signup box (real sign-ups are stored in the `newsletter` Firestore collection and listed under **Subscribers** in the admin panel) plus the full sitemap in three columns — **Explore** (Destinations, Packages, Experiences, Journal), **Company** (About, Our way, Contact, Admin) and **Get in touch** (phone, email, address) — with the brand, copyright and "Back to top" below. Homepage-section links resolve to `#anchor` on the homepage and `/#anchor` from any other page. The mobile menu scrolls instead of clipping, so no item can hide behind the fold.

## About section

The company story and values live in `src/aboutContent.js` — edit the copy there and the About section updates. It sits between the manifesto and experiences sections and is reachable from the header and footer.

## The Journal (blog)

Public reading lives at `/journal` and `/journal/:slug`. Posts are stored in the Firestore `posts` collection and can be written in the browser at `/admin/journal`.

- **Admin login:** open `/admin` (also linked in the footer) and use the "Sign in with Google" button on that page, or the header button. The account must be in the Firestore `config/admins` document (`emails` array). After signing in, the header shows a **Write** link. The admin account is `connect2devinder@gmail.com` — it is also kept in `src/siteConfig.js` (`adminEmail`) as the client-side fallback, so the admin area still unlocks if the allowlist document cannot be read. Keep the two in sync. The footer shows a **Write** link for admins and **Admin** for everyone else.
- **Bilingual posts:** each language version is its own document linked by `translationGroup`. Use **Create Hindi/English version** in the editor to make the sibling.
- **Markdown** bodies are sanitized before rendering, so raw HTML and scripts cannot run.

Content code lives in `src/blog.js` (data layer), `src/JournalPage.jsx` (public), `src/AdminJournal.jsx` (admin editor + review queue), `src/WriteArea.jsx` (community writer area), and `src/aboutContent.js` / `src/siteConfig.js` (editable copy and contact details).

## Community blogging (any signed-in user)

Any visitor who signs in with Google can write for the journal from **`/write`** — their own posts, a simple editor, drafts, and a **Submit for review** button. A community post is never public until an admin approves it.

- **Statuses:** `draft` (author only) → `pending` (in the admin review queue) → `published` (live) or `rejected` (sent back with an admin note the author sees).
- **Ownership:** every post stores the author's `authorUid`; the rules let an author read, edit and delete only their own posts, and editing a live post sends it back to review.
- **Admin moderation:** `/admin/journal` shows a **Review queue** with *Approve & publish* and *Request changes*.
- **Public listing:** approved posts appear in the journal with the author's name.
- **Still admin-only:** packages, bookings, enquiries and notifications.

## Package management

Tour packages can be created, edited, published and deleted from the admin panel at `/admin/packages` (the **Packages** tab in the admin nav).

- **Storage:** Firestore `packages` collection — name, slug, destination, price label, numeric price amount, duration, summary, itinerary, inclusions, hotel and transport details, FAQs, status and position.
- **Public site:** published packages replace the sample packages for their destination (`src/mockData.js` is the fallback). If a destination has no published package, or Firebase is unavailable, the sample package stays visible — the public site never renders an empty catalogue.
- **Destinations:** still come from the bundled sample data. Admin-managed destinations are a separate requirement.
- Data layer: `src/packages.js`. Public state: `src/PackagesContext.jsx`.

## Online booking and booking status

A package detail page has a **Book this trip** action that opens `/book/:packageId`:

1. **Details** — name, email, phone, travel date (today or later) and 1–20 travellers. The amount is `price amount × travellers` in INR.
2. **Payment** — Razorpay Checkout integration is prepared for **Test Mode**. The Cloud Function calculates the amount from the published package price and traveller count, creates the Razorpay order, then verifies the signature and captured amount server-side before confirming the booking. **It is not live yet:** checkout stays on the previous deployed version until the account owner configures Razorpay Test Mode secrets and deploys Cloud Functions. Test Mode does not charge real money.
3. **Confirmation** — booking reference (`ELW-XXXXXX`), amount paid, payment reference and status.

Bookings live in the Firestore `bookings` collection with a status history (`pending_payment` → `confirmed` → `cancelled`/`completed`).

- **Your bookings:** `/bookings` lists the bookings made with the signed-in email; `/bookings/:reference` shows one booking and its history.
- **Admin:** `/admin/bookings` lists every booking with status filters and search, and lets the operator change a booking status.
- **Notifications:** booking created, payment received, status changed and enquiry received each queue an **email** (and, for bookings, an **SMS**) notification in the `notifications` collection, shown in the admin **Notifications** tab. Delivery is simulated - an admin can mark a notification as sent, but no provider is connected.
- **Rules:** after the Razorpay backend is activated, a booking is readable by the guest whose email it was made with (Google sign-in) or by an admin. Booking creation and payment confirmation are trusted Cloud Function operations; clients cannot create or mark a booking paid directly.
- **Backend:** `functions/index.js` contains `createRazorpayOrder`, `verifyRazorpayPayment` and the `payment.captured` webhook. Razorpay secrets must be set in Firebase Functions Secret Manager (never in the frontend or Git). Cloud Functions require the Firebase project to be on the Blaze plan.
- **Activation steps:** In Razorpay Dashboard → Test Mode → API Keys, generate a test Key ID and Key Secret. Set them using `firebase functions:secrets:set RAZORPAY_KEY_ID --project tour-83b6c` and `firebase functions:secrets:set RAZORPAY_KEY_SECRET --project tour-83b6c`. Set a random webhook secret as `RAZORPAY_WEBHOOK_SECRET`; deploy Functions, then add a Razorpay webhook for the deployed `razorpayWebhook` URL and subscribe to `payment.captured` using the same secret. Finally deploy Firestore rules and Hosting. **Never paste the Key Secret into chat or commit it to Git.**

What is still needed to activate Test Mode: owner-configured Firebase Function secrets + a Razorpay webhook, then deploy Functions, rules and Hosting. Live payments still need a separately approved switch to live keys, plus cancellation/refund policy, deposit rules and booking expiry. Actual email/SMS delivery still needs a delivery provider. See `rfp/razorpay-test-payments/requirement.md` for details.
