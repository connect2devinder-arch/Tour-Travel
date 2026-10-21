# Destination Place Carousels

## Overview

Har destination (Shimla, Manali, Lahaul & Spiti, Mussoorie) ki detail section mein ek image carousel hoga jisme us destination ke famous tourist places ke photos back/forward arrows se browse ho sakenge. Har slide ke neeche place ka naam caption hoga. Ye existing destination gallery ko jagah leta hai.

## Goal

Visitor ko destination ke andar ke specific places explore karne ka visual way dena, taaki woh destination ke baare mein behtar feel le sake.

## Actors

- Prospective traveler / website visitor.

## Functional requirements

- **REQ-001 — Place carousel:** Destination detail section mein carousel with back/forward arrows aur dot indicators; slide change karne par image aur caption update hon.
- **REQ-002 — Place captions:** Har slide ke neeche us place ka naam dikhe (jaise "Mall Road", "Jakhu Temple").
- **REQ-003 — Place data:** Har destination ke famous places with photos, Firebase Storage mein organized.
  - Shimla: Mall Road, The Ridge, Jakhu Temple, Naldehra, Kufri
  - Manali: Mall Road, Hadimba Temple, Solang Valley, Old Manali, Vashisht Hot Springs
  - Lahaul & Spiti: Key Monastery, Dhankar Monastery, Chandratal Lake, Kibber Village, Tabo Monastery
  - Mussoorie: Mall Road, Gun Hill, Kempty Falls, Lal Tibba, Company Garden
- **REQ-004 — Image sourcing:** Place-specific images Unsplash se search karke Firebase Storage mein upload hon; existing generic destination gallery images replace/update hon.
- **REQ-005 — Accessibility and keyboard:** Arrows aur dots keyboard-accessible hon; current slide aria attributes se identify ho.
- **REQ-006 — Responsive:** Carousel mobile aur desktop par sahi render ho.

## Acceptance criteria

- **AC-001 (REQ-001):** Given destination detail khula hai, when visitor forward arrow activate karta hai, then next place ka image aur caption visible hota hai; back arrow previous slide par le jata hai.
- **AC-002 (REQ-002):** Given carousel slide visible hai, when visitor dekhta hai, then us place ka naam caption ke roop mein dikhta hai.
- **AC-003 (REQ-003):** Given har destination, when detail section dekhta hai, then listed famous places ke carousel slides available hote hain.
- **AC-004 (REQ-004):** Given place images upload ho gayi hain, when carousel render hota hai, then images Firebase Storage URLs se load hoti hain; koi broken image nahi hoti.
- **AC-005 (REQ-005):** Given visitor keyboard use karta hai, when arrows aur dots activate karta hai, then slides change hote hain aur current slide accessible attributes se identify hota hai.
- **AC-006 (REQ-006):** Given mobile viewport, when carousel render hota hai, then content viewport mein fit rehta hai aur horizontal overflow nahi hota.

## Business rules and validation

- Place lists famous tourist spots par based hain; exact list abhi fixed hai.
- Images Unsplash se; drone/aerial ya best available shot prefer.
- Carousel images Firebase Storage mein store hon; public read access.
- Slide order place list ke order mein rahega.

## Dependencies and constraints

- Firebase Storage bucket `tour-83b6c.firebasestorage.app` active hai.
- Unsplash search headless browser se block hota hai; real browser use hoga.
- Har destination ke 5 places; har place ke liye kam se kam 1 image.

## Open questions

- Kya dots ki jagah thumbnail strip chahiye? Abhi dots selected hain.
- Kya place captions ke saath short description bhi chahiye? Abhi sirf naam.
