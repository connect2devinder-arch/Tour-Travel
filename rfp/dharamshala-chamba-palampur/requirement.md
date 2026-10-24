# Dharamshala, Chamba and Palampur Destinations

## Overview
Add Dharamshala, Chamba and Palampur to the existing destination discovery, place carousel, package, booking and enquiry flows. Each new destination has one sample package and five self-hosted destination/place photos. Photo authorship and Creative Commons licenses are listed on `/image-credits`.

## Goal
Let visitors discover these three Himachal destinations, view their notable places and sample package, then follow the existing booking or enquiry flow.

## Actors
- **Visitor / traveller** — browses destination cards, package galleries, place carousels, booking and enquiry forms.
- **Admin** — manages packages and bookings through the existing admin area.

## Functional requirements
- **REQ-001:** Add destination IDs `dharamshala`, `chamba` and `palampur` with name, state, tags, tagline, description, card image, five gallery photos, five place-carousel entries and attractions.
- **REQ-002:** Add one sample package for each destination: `dharamshala-retreat`, `chamba-heritage-escape` and `palampur-tea-trail`.
- **REQ-003:** Each sample package includes price label, server-calculated price amount, duration, summary, itinerary, inclusions, hotel, transport, FAQs and its own five-photo gallery.
- **REQ-004:** Destination cards link to their package detail pages; package detail pages show the single-image gallery with arrows/dots and a link back to that destination's place carousel.
- **REQ-005:** New destinations appear in homepage search results, contact enquiry destination choices, blog destination choices and admin package destination choices.
- **REQ-006:** The Razorpay server-side sample package catalogue includes matching IDs and price amounts so test orders use the correct server-computed price.
- **REQ-007:** Contact enquiry Firestore validation accepts the three destination IDs.
- **REQ-008:** New photos are stored in Firebase Storage under `destinations/<id>/<slug>.jpg` and publicly readable under current storage rules.
- **REQ-009:** Third-party photo attributions and license links are shown at `/image-credits` and accessible from the footer.

## Acceptance criteria
- **AC-001 (REQ-001):** Given the homepage, when the destinations section loads, then Dharamshala, Chamba and Palampur cards appear with valid images and each links to its package.
- **AC-002 (REQ-002, REQ-003):** Given `/packages/dharamshala-retreat`, `/packages/chamba-heritage-escape` or `/packages/palampur-tea-trail`, then the matching package detail, price, itinerary and five-photo gallery appear.
- **AC-003 (REQ-004):** Given one of the new package pages, when the photo arrows/dots are used, then the correct destination photos change; the "See the places" link opens the matching destination carousel.
- **AC-004 (REQ-005, REQ-007):** Given contact form, when a user selects one of the three new destinations and submits, then Firestore validation accepts that destination value.
- **AC-005 (REQ-005):** Given the blog editor or admin package editor, when destination choices are opened, then all three new destinations are listed.
- **AC-006 (REQ-006):** Given a new sample package and two travellers, when a test order is created, then server-side price is correct: Dharamshala ₹37,998; Chamba ₹49,998; Palampur ₹35,998.
- **AC-007 (REQ-008):** Given any new destination photo URL, when opened without sign-in, then it returns an image successfully.
- **AC-008 (REQ-009):** Given the footer, when "Image credits" is opened, then each new third-party photo lists its photographer, source and license.

## Business rules and validation
- All new prices are illustrative per-traveller INR amounts: Dharamshala ₹18,999, Chamba ₹24,999, Palampur ₹17,999. Confirm final rates before any Live Mode launch.
- Package total is package price × traveller count, calculated by the Razorpay Cloud Function from its server-side sample catalogue or published Firestore package.
- New destination IDs are lowercase slugs: `dharamshala`, `chamba`, `palampur`.
- Photo paths use lowercase hyphenated place slugs.
- Third-party images are from Wikimedia Commons. Attribution and license are included in `src/destinationImageCredits.js` and exposed at `/image-credits`.

## Dependencies and constraints
- Bundled destination/package data: `src/mockData.js`; the server-side sample package catalogue is `functions/index.js`.
- Firestore rules: `firestore.rules` contact destination allowlist must stay in sync with destination IDs.
- Image bucket: `tour-83b6c.firebasestorage.app`.
- Images are sample destination/place imagery; final package inventory, accessibility and travel pricing must be confirmed before accepting live bookings.

## Open questions
- **TBD:** Should Palampur's Andretta stop be replaced with a tea-estate-specific stop in the sample itinerary?
- **TBD:** Should these sample INR prices be adjusted before Live Mode is enabled?
- **TBD:** Do the destination place captions need local language spellings in addition to English?
