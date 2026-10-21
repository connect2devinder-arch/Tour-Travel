# About Section

## Overview

Website par ek dedicated About section add hoga jo company ki story, roots, aur kaam ka tarika explain karega. Section mein ek hero image, company narrative, aur core values ka row hoga. Header navigation mein bhi "About" link add hoga.

## Goal

Visitor ko yeh samajhna chahiye ki Elsewhere kya hai, kahan se aaya hai, aur travel kyun aur kaise karwata hai — enquiry form bharnay se pehle trust build karna.

## Actors

- Prospective traveler / website visitor.

## Functional requirements

- **REQ-001 — About section:** Homepage par ek `About` section ho jisme company ka introduction, narrative copy, aur ek image ho.
- **REQ-002 — Narrative copy:** Section mein company ki story ke 2–3 paragraphs hon — Shimla roots, local team, aur travel approach.
- **REQ-003 — Core values:** Section mein 3 value cards hon (local knowledge, slow by design, honest by default), har ek short description ke saath.
- **REQ-004 — Image:** About image Firebase Storage se load ho, meaningful alt text ke saath, aur caption/note ho.
- **REQ-005 — Navigation:** Header nav mein "About" link add ho jo section par scroll kare; footer se bhi link accessible ho.
- **REQ-006 — Responsive and accessible:** Section mobile par stack ho, images load hon, aur content keyboard-accessible ho.

## Acceptance criteria

- **AC-001 (REQ-001):** Given homepage load hua hai, when visitor About section tak scroll karta hai, then company introduction, narrative, image, aur values row visible hon.
- **AC-002 (REQ-002):** Given About section visible hai, when visitor copy padhta hai, then 2–3 readable paragraphs aur ek closing line ho jo company approach explain kare.
- **AC-003 (REQ-003):** Given About section visible hai, when visitor dekhta hai, then exactly 3 value cards visible hon with title aur description.
- **AC-004 (REQ-004):** Given About section visible hai, when image render hoti hai, then Firebase Storage URL se load hoti hai, alt text meaningful hai, aur koi broken image nahi hoti.
- **AC-005 (REQ-005):** Given visitor header par hai, when "About" link activate karta hai, then About section viewport mein aa jata hai; footer mein bhi About link ho.
- **AC-006 (REQ-006):** Given mobile viewport, when About section render hota hai, then content single column mein stack ho, horizontal overflow na ho, aur images load hon.

## Business rules and validation

- About copy abhi brand/editorial content hai; claims (jaise "no hidden charges") website ki positioning ke mutabiq hain.
- Values sirf 3 hain, fixed order mein.
- Image existing Firebase Storage asset use karta hai; naya upload is requirement ke liye zaroori nahi.
- Content `src/aboutContent.js` mein rakha jayega taaki copy badalna easy ho.

## Dependencies and constraints

- Firebase Storage images already available hain (`destinations/shimla/1.jpg`).
- Existing design system (eyebrow, serif heading with coral emphasis, bordered cards) reuse hoga.

## Open questions

- Kya company history (founding year, team size) explicitly add karni hai? Abhi generic narrative rakha gaya hai.
- Kya About section ke liye alag image chahiye (jaise team photo)?
