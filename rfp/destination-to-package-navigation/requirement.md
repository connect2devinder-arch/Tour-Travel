# Destination Cards Open the Package Page

## Overview
Homepage ke "Destinations" section me destination card click karne par ab seedha us destination ke tour package page pe navigation hoti hai — pehle wahi click ek inline "destination detail" section kholta tha.

## Goal
Guest ko "koi jagah achi lagi" se "us trip ki booking" tak ek click me le jaaye, aur saath hi tourist places wala carousel (destination detail) bhi reachable bana rahe.

## Actors
- **Guest / traveller** — destinations browse karta hai, package detail dekhta hai, booking karta hai.
- **Travel operator (admin)** — is change se koi asar nahi padta.

## Functional requirements
- **REQ-001:** Destinations section ki har card (image aur "Explore" action) us destination ke tour package page ko link karti hai.
- **REQ-002:** Card ka save (heart) button click karne par navigation nahi hoti — save action card link ko trigger nahi karta.
- **REQ-003:** Jis destination ke paas koi package nahi hai, uska card purana behaviour follow karta hai — click karne par destination detail section khulta hai.
- **REQ-004:** Package detail page par "See the places in {destination}" link destination ka place-carousel section kholta hai (`/?destination=<id>#destinations`).
- **REQ-005:** Homepage `?destination=<id>` query param par us destination ka detail section khulta hai aur usi par scroll hota hai.
- **REQ-006:** Search results me bhi destination cards wahi link behaviour follow karti hain.

## Acceptance criteria
- **AC-001 (REQ-001):** Given homepage ka destinations section, when guest Shimla card ka image ya "Explore" click karta hai, then `/packages/shimla-escape` package page khulta hai.
- **AC-002 (REQ-002):** Given destination card, when guest heart button click karta hai, then card saved state me jaati hai aur page wahi rehta hai (koi navigation nahi).
- **AC-003 (REQ-004):** Given package detail page, when guest "See the places in Shimla" link click karta hai, then homepage ka destination section khulta hai jisme place carousel (pehla place "Mall Road") dikhta hai.
- **AC-004 (REQ-005):** Given `/?destination=mussoorie`, when page load hota hai, then Mussoorie ka destination detail section khulta hai.
- **AC-005 (REQ-006):** Given search results, when guest result card click karta hai, then us destination ka package page khulta hai.

## Business rules and validation
- Card apne destination ke **pehle** package ko link karti hai (published packages position/slug order me).
- `?destination=` me unknown destination id ho to kuch nahi khulta — page normally render hota hai.
- Sirf tab card link banti hai jab destination ka package available ho; warna card purane behaviour (detail section) par fallback karta hai.
- Heart button card link ke upar hai — uska click navigation trigger nahi karta.

## Dependencies and constraints
- Sample packages `src/mockData.js` me hain (har destination ka ek package); Firestore se aane wale packages bhi `PackagesContext` ke through wahi link behaviour follow karte hain.
- Place carousel ek inline homepage section hai, alag route nahi — isliye usse `?destination=` query param se kholna padta hai.
- Package page ka "Book this trip" aur "Enquire about this trip" action pehle se wahi rehte hain.

## Open questions
- **TBD:** Multiple packages hone par destination card kaunsa package kholega — pehla, featured, ya sabse sasta?
- **TBD:** "See all places" section link bhi har destination card par alag action banaye?
- **TBD:** Destination detail section ka apna direct URL chahiye (alag route), ya `?destination=` param enough hai?
