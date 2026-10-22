# Elsewhere Travel

A responsive India-focused travel discovery website built with React and Vite. Sample destinations include Shimla, Manali, Lahaul & Spiti, and Mussoorie. Edit `src/mockData.js` to change the mock destinations and packages.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Use `npm run build` to create a production build.

Destination/package details, INR prices, and the newsletter are sample/demo content. Trip enquiries are saved to the `contactEnquiries` Firestore collection and queue an email notification for the team; actual email delivery, live availability, and newsletter delivery are not configured. Tour packages can be managed from the admin panel, and guests can place a booking through a simulated payment step — see [Online booking](#online-booking-and-booking-status) for what is real and what is simulated.

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

## About section

The company story and values live in `src/aboutContent.js` — edit the copy there and the About section updates. It sits between the manifesto and experiences sections and is reachable from the header and footer.

## The Journal (blog)

Public reading lives at `/journal` and `/journal/:slug`. Posts are stored in the Firestore `posts` collection and can be written in the browser at `/admin/journal`.

- **Admin login:** open `/admin` (also linked in the footer) and use the "Sign in with Google" button on that page, or the header button. The account must be in the Firestore `config/admins` document (`emails` array). After signing in, the header shows a **Write** link.
- **Bilingual posts:** each language version is its own document linked by `translationGroup`. Use **Create Hindi/English version** in the editor to make the sibling.
- **Security:** `firestore.rules` and `storage.rules` gate writes to admins. Published posts are public; drafts are not.
- **Markdown** bodies are sanitized before rendering, so raw HTML and scripts cannot run.

Content code lives in `src/blog.js` (data layer), `src/JournalPage.jsx` (public), `src/AdminJournal.jsx` (editor), and `src/aboutContent.js` / `src/siteConfig.js` (editable copy and contact details).

## Package management

Tour packages can be created, edited, published and deleted from the admin panel at `/admin/packages` (the **Packages** tab in the admin nav).

- **Storage:** Firestore `packages` collection — name, slug, destination, price label, numeric price amount, duration, summary, itinerary, inclusions, hotel and transport details, FAQs, status and position.
- **Public site:** published packages replace the sample packages for their destination (`src/mockData.js` is the fallback). If a destination has no published package, or Firebase is unavailable, the sample package stays visible — the public site never renders an empty catalogue.
- **Destinations:** still come from the bundled sample data. Admin-managed destinations are a separate requirement.
- Data layer: `src/packages.js`. Public state: `src/PackagesContext.jsx`.

## Online booking and booking status

A package detail page has a **Book this trip** action that opens `/book/:packageId`:

1. **Details** — name, email, phone, travel date (today or later) and 1–20 travellers. The amount is `price amount × travellers` in INR.
2. **Payment** — a simulated gateway. No money moves and no gateway keys are configured. Use card `4000 0000 0000 0001` to succeed or `4000 0000 0000 0002` to see a decline; a UPI id containing `fail` declines too.
3. **Confirmation** — booking reference (`ELW-XXXXXX`), amount paid, payment reference and status.

Bookings live in the Firestore `bookings` collection with a status history (`pending_payment` → `confirmed` → `cancelled`/`completed`).

- **Your bookings:** `/bookings` lists the bookings made with the signed-in email; `/bookings/:reference` shows one booking and its history.
- **Admin:** `/admin/bookings` lists every booking with status filters and search, and lets the operator change a booking status.
- **Notifications:** booking created, payment received, status changed and enquiry received each queue an **email** (and, for bookings, an **SMS**) notification in the `notifications` collection, shown in the admin **Notifications** tab. Delivery is simulated - an admin can mark a notification as sent, but no provider is connected.
- **Rules:** `firestore.rules` gates the new collections. A booking is readable by the guest whose email it was made with (Google sign-in) or by an admin; a guest may only move their own booking from `pending_payment` to `confirmed`.

What is still missing for production: a real payment gateway (and server-side amount verification), a real email/SMS provider (Cloud Functions), cancellation/refund policy, deposit rules and booking expiry. These are tracked as open questions in `rfp/package-management-and-booking/requirement.md`.
