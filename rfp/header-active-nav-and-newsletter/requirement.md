# Header Active Link and Footer Newsletter Signup

## Overview
Header ab scroll-position ke hisaab se active link dikhata hai (section ya route ke hisaab se), aur footer me newsletter signup box aaya hai — jo pehle homepage ka section demo-only tha. Ab signup Firestore me `newsletter` collection me save hota hai, aur admin panel me "Subscribers" tab me list dikhti hai.

## Goal
Guest ko pata chale wo site ke kaun se section me hai, aur footer se bhi newsletter sign-up ho sake — bina scroll kare — aur travel team ko subscribers ki list mile.

## Actors
- **Guest / traveller** — header me active state dekhta hai, footer/homepage se subscribe karta hai.
- **Travel operator (admin)** — admin panel ke "Subscribers" tab me list dekhta hai.

## Functional requirements
- **REQ-001:** Header ka current section active dikhe — homepage par scroll ke hisaab se (Destinations / Packages / Contact).
- **REQ-002:** `/journal` par "Journal" link aur `/packages/:id` par "Packages" link active ho.
- **REQ-003:** Hero (sabse upar, koi section nahi) par default active "Destinations" ho.
- **REQ-004:** Active link ko alag colour + coral underline se mark kiya jaye.
- **REQ-005:** Footer me newsletter signup box ho — email input + submit button + status message.
- **REQ-006:** Signup Firestore `newsletter` collection me save ho: `email` (lowercase), `source` (`footer` / `homepage`), `status: "subscribed"`, timestamps.
- **REQ-007:** Newsletter signup ek hi jagah ho — homepage ka duplicate band hata diya gaya, signup sirf footer me hai. Manifesto ka "Get to know us" CTA footer signup par jaaye.
- **REQ-008:** Firebase rules: `newsletter` me public create (validated email), read/update/delete admin-only.
- **REQ-009:** Admin panel me "Subscribers" tab ho jisme email, source aur signup date dikhe.
- **REQ-010:** Firebase configured na ho to signup button fail na ho — clear error message dikhe.

## Acceptance criteria
- **AC-001 (REQ-001, REQ-002):** Given homepage, when user `#packages` section tak scroll karta hai, then "Packages" link active ho; `#contact` par "Contact"; `/journal` par "Journal"; `/packages/shimla-escape` par "Packages".
- **AC-002 (REQ-003):** Given page top (hero), when header dekhi jaati hai, then "Destinations" active hota hai.
- **AC-003 (REQ-005, REQ-006):** Given footer, when visitor email daal kar submit karta hai, then success message "You’re on the list" dikhta hai aur Firestore me `newsletter` document banta hai (`source: "footer"`).
- **AC-004 (REQ-007):** Given homepage, when page dekhi jaati hai, then sirf ek newsletter signup hota hai (footer wala) aur manifesto ka "Get to know us" link usi input par jaata hai (`#footer-email`).
- **AC-005 (REQ-008):** Given anonymous visitor, when `newsletter` me invalid email (jaise "abc") likhta hai, then Firestore rules write reject karte hain.
- **AC-006 (REQ-009):** Given admin, when `/admin/bookings` → "Subscribers" tab kholta hai, then har subscriber ka email, source aur date list me dikhta hai.
- **AC-007 (REQ-010):** Given Firebase unconfigured build, when visitor subscribe karta hai, then error message dikhta hai aur app crash nahi karta.

## Business rules and validation
- Email lowercase me store hoti hai; format check `^[^ @]+@[^ @]+[.][^ @]+$`, 5–254 characters.
- `source` sirf `footer` ya `homepage` (max 60 characters).
- `status` hamesha `subscribed` (unsubscribe/bounce ke liye alag status rakhne ka scope baad me).
- Duplicate signup abhi block nahi hota (auto-ID document) — admin list me email dekh kar clean-up kiya ja sakta hai.
- Footer signup box homepage ke newsletter band se same helper use karta hai.

## Dependencies and constraints
- Firestore `newsletter` collection — naya rules block, deploy kiya gaya.
- Data layer: `src/newsletter.js` (`subscribeToNewsletter`, `listSubscribers`).
- Newsletter delivery (actual email) integrate nahi hai — subscribers sirf list me hain; bhejne ke liye provider chahiye (TBD).

## Open questions
- **TBD:** Unsubscribe link har newsletter email me chahiye?
- **TBD:** Double signup par "already on the list" message chahiye (unique email index chahiye)?
- **TBD:** Subscribers ko admin panel me export (CSV) karna hai?
- **TBD:** Homepage newsletter band ko bhi footer wale style me consolidate karna hai?
