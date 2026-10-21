# Hero Auto-Slideshow

## Overview

Homepage ke hero banner ka background image ab automatically rotate hoga jab user idle ho. User ke interact karne par slideshow ruk jayega, aur kuch idle time baad dobara chalne lagega.

## Goal

Bored visitors ke liye hero visually alive rakhte hue, lekin user ko apni browse chhediye bina — koi manual action force nahi hoga.

## Actors

- Visitor landing on the homepage.

## Functional requirements

- **REQ-001 — Auto-rotating hero:** Hero background mein 4–5 images set ho; ek interval ke baad next image fade hoke aaye.
- **REQ-002 — Idle trigger:** Slideshow tab chale jab user ne kuch recent interaction nahi kiya ho.
- **REQ-003 — Pause on interaction:** User ke hero par pointer, keyboard focus, click/touch, ya keypress karne par slideshow turant pause ho.
- **REQ-004 — Resume after idle:** Interaction ke kuch seconds baad slideshow apne aap resume ho.
- **REQ-005 — Slide indicators:** Hero mein chhote dots/indicators dikhaye jayen jo current slide batayein aur click karne par seedha slide par jaayein.
- **REQ-006 — Reduced motion:** `prefers-reduced-motion` user ke liye autoplay off rahe.
- **REQ-007 — Self-hosted assets:** Saari hero slide images Firebase Storage se aayein.

## Acceptance criteria

- **AC-001 (REQ-001):** Given homepage load hai aur user idle hai, when interval complete hota hai, then background image badal jata hai aur current slide indicator update hota hai.
- **AC-002 (REQ-002):** Given user idle hai, when slideshow chal raha hai, then slides automatically change hoti rehti hain bina user action ke.
- **AC-003 (REQ-003):** Given slideshow chal raha hai, when user hero par interact karta hai, then rotation ruk jati hai aur current slide par hi rehti hai.
- **AC-004 (REQ-004):** Given user ne interact kiya tha, when idle timeout expire hota hai, then slideshow dobara rotate karne lagti hai.
- **AC-005 (REQ-005):** Given hero visible hai, when visitor dekhta hai, then har slide ka ek indicator dikhta hai aur active indicator current slide ke saath align karta hai.
- **AC-006 (REQ-006):** Given user ne reduced motion prefer kiya hai, when homepage load hota hai, then slides auto-advance nahi hoti.
- **AC-007 (REQ-007):** Given hero slide images render hoti hain, when network requests dekhe jayen, then sab Firebase Storage URLs se aayein aur koi failed request na ho.

## Business rules and validation

- Autoplay interval ~6 seconds.
- Idle resume delay ~8 seconds after the last interaction.
- Slide images Firebase Storage par hain (`site/` aur `destinations/` folders).
- Reduced motion preference mein autoplay disabled, sirf manual slide selection.

## Dependencies and constraints

- Hero images already Firebase Storage mein hain.
- Existing `.hero-image` gradient overlay styling retain rahegi.

## Open questions

- Kya autoplay tab bhi chale jab user page ke dusre section mein scroll kar chuka ho? Abhi hero visible hone par hi chalega.
