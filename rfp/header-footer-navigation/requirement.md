# Header and Footer Navigation Structure

## Overview
Header nav 7 items se 4 items par lauta gaya aur baaki sections footer sitemap me move kiye gaye. Saath me mobile menu ka clipping bug fix hua — pehle "Contact" aur "Our way" mobile pe dikhai hi nahi de rahe the.

## Goal
Header sirf conversion path dikhaye (destination → package → enquiry), baaki storytelling sections footer me rahein. Footer poori site ka sitemap + contact details ek jagah de.

## Actors
- **Guest / traveller** — header se primary journey, footer se poora sitemap.
- **Travel operator (admin)** — Admin link footer me.

## Functional requirements
- **REQ-001:** Header nav me sirf 4 items rahein: Destinations, Packages, Journal, Contact.
- **REQ-002:** Header actions unchanged rahein — sign-in button, admin "Write" link (sign-in ke baad) aur "Plan your trip" CTA.
- **REQ-003:** Footer me 3 link columns rahein — **Explore** (Destinations, Packages, Experiences, Journal), **Company** (About, Our way, Contact, Admin) aur **Get in touch** (phone, email, address).
- **REQ-004:** Footer ke homepage-section links har page se kaam karein — homepage pe `#anchor`, doosri pages pe `/#anchor`.
- **REQ-005:** Footer me brand + tagline + copyright + "Back to top" bhi rahe.
- **REQ-006:** Mobile menu kabhi item clip na kare — items badhne par menu scroll ho.
- **REQ-007:** Footer columns desktop par 4-column grid, tablet par 2-column, mobile par 2-column hain.

## Acceptance criteria
- **AC-001 (REQ-001):** Given any page, when header dekhi jaati hai, then nav me sirf Destinations, Packages, Journal aur Contact hote hain.
- **AC-002 (REQ-003):** Given footer, when dekhi jaati hai, then Explore/Company/Get in touch columns dikhti hain aur saare links apni jagah pahunchate hain.
- **AC-003 (REQ-004):** Given `/journal` page, when footer ka "Destinations" link click hota hai, then homepage `#destinations` anchor par khulta hai (href `/#destinations`).
- **AC-004 (REQ-006):** Given mobile viewport, when menu khola jaata hai, then saare nav items poori tarah dikhte hain — koi cut ya scroll nahi (menu scrollable ho agar items zyada ho).
- **AC-005 (REQ-005):** Given footer bottom, when dekhi jaati hai, then copyright aur "Back to top" link hote hain.

## Business rules and validation
- Header me max 4 nav items — naye section add karne se pehle koi existing item footer me jana chahiye.
- Homepage-section anchors sirf homepage pe maujood hain, isliye doosri pages se link `/#anchor` format me hota hai (full page load + anchor scroll).
- Journal aur Admin asli routes hain, unke liye anchor nahi.
- Mobile menu `max-height: 70vh` + `overflow-y: auto` — items badhne par bhi koi invisible na ho.

## Dependencies and constraints
- Header aur footer dono `src/App.jsx` me hain; footer ko `useLocation` chahiye anchor ke liye.
- Footer contact details `src/siteConfig.js` se aate hain (single source of truth).
- Homepage ke "Experiences", "About" aur "Our way" sections waise bhi scroll hote hain — footer link koi content churaya nahi karta.

## Open questions
- **TBD:** Header me active-section highlight chahiye (scroll position ke hisaab se)?
- **TBD:** Footer me newsletter signup bhi add karni hai (abhi newsletter section homepage par hai)?
- **TBD:** Journal ka header link tab bar me active dikhna chahiye?
