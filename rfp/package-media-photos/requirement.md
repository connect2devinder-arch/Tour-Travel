# Per-Package Photo Sets (package_media)

## Overview
Ab har tour package apni alag photo set carry karta hai — Manali, Lahaul & Spiti aur Mussoorie ke packages ke apne 5 photos hain (unke famous places ki photos), aur package detail page wahi dikhata hai. Package me photos na ho toh destination ka gallery fallback hota hai (Shimla abhi aise hi hai). Admin panel se photos choose, upload ya URL se add/remove kiye ja sakte hain.

## Goal
Har package ki story alag dikhe — Manali ka package Manali ki photos dikhaye, Spiti ka Spiti ki — aur travel team bina developer ke package photos badal sake.

## Actors
- **Guest / traveller** — package detail page par photos dekhta hai.
- **Travel operator (admin)** — package photos choose/upload/remove karta hai.

## Functional requirements
- **REQ-001:** Har package me apni photo set ho sake — `{ src, alt }` list, order me.
- **REQ-002:** Package detail page par sirf ek badi photo dikhe (arrows + dots se change), aur wahi package ki photos hon.
- **REQ-003:** Package me photos na ho toh destination ka gallery fallback ho — page khaali na lage.
- **REQ-004:** Admin package editor me destination ki available images (gallery + place photos) ka picker ho — click karke photo add/remove ho.
- **REQ-005:** Admin package editor se nayi photo upload ho sake (Firebase Storage → `packages/<packageId>/<file>`).
- **REQ-006:** Admin package editor me image URL paste karke photo add ho sake.
- **REQ-007:** Har photo ka alt text editable ho, aur gallery me accessibility ke liye use ho.
- **REQ-008:** Admin package list me photo count dikhe.
- **REQ-009:** Storage rules me `packages/**` public-read aur admin-only-write ho.

## Acceptance criteria
- **AC-001 (REQ-001, REQ-002):** Given `/packages/manali-valley`, when guest page kholta hai, then pehli photo `destinations/manali/mall-road.jpg` hai aur "1 of 5 photos" counter dikhta hai; next arrow `hadimba-temple.jpg` par le jaata hai.
- **AC-002 (REQ-003):** Given package jisme photos nahi hain (Shimla), when guest page kholta hai, then destination gallery ki photos dikhti hain aur page khaali nahi hota.
- **AC-003 (REQ-004):** Given admin package editor, when admin destination images picker se photo click karta hai, then photo package ki list me add ho jaati hai aur dobara click karne par remove ho jaati hai.
- **AC-004 (REQ-005):** Given admin package editor, when admin photo upload karta hai, then Storage me `packages/<id>/<file>` save hota hai aur photo package me add ho jaati hai.
- **AC-005 (REQ-006, REQ-007):** Given admin package editor, when admin URL paste karke photo add karta hai aur alt text likhta hai, then saved package me photo us alt text ke saath store hoti hai.
- **AC-006 (REQ-008):** Given admin package list, when admin list dekhta hai, then har package ke saath photo count dikhta hai.
- **AC-007 (REQ-009):** Given public user, when package photo URL open karta hai, then image load hoti hai; sirf admin hi `packages/` me upload kar sakta hai.

## Business rules and validation
- Photo shape: `{ src: string, alt: string }`. `src` required, empty `src` wali photo save nahi hoti.
- Fallback order: package photos → destination photos. Koi photo set na ho toh page gallery section khaali nahi chodti.
- Storage path: `packages/<packageId>/<timestamp>-<filename>`, filename me sirf safe characters.
- `packages` Firestore collection me `photos` array document ke andar hi rehta hai (SQL me iska equivalent `package_media` table hai — alag rows, `package_id` FK, `position` order column).
- Sample data me Manali/Spiti/Mussoorie packages ke photos unke place photos hain; Shimla abhi destination gallery use karta hai.

## Dependencies and constraints
- Firebase Storage bucket `tour-83b6c.firebasestorage.app`, `storage.rules` me naya `packages/**` path.
- Firestore `packages` collection already admin-only write hai.
- Places/gallery images `mockData.js` se aati hain — admin picker me wahi dikhti hain.
- Image hosting SQL me nahi jaayegi — sirf URLs.

## Open questions
- **TBD:** Package photos me crop/aspect ratio ka rule — abhi `object-fit: cover` se crop hota hai (420px desktop, 280px mobile).
- **TBD:** Photo limit per package chahiye? (abhi koi limit nahi)
- **TBD:** Shimla ka package bhi place photos par shift karna hai ya drone gallery hi rakhni hai?
- **TBD:** Package photos ka separate alt-text fallback chahiye (destination alt text se)?
