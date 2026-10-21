# Package Management, Online Booking & Booking Notifications

## Overview
Admin panel se tour packages create/edit/publish kiye ja sakein, guest package detail page se seedha online booking kar sake (demo payment ke saath), har booking ka trackable status ho, aur booking/payment/status change par automated email + SMS notifications generate hon.

Yeh POC-level scope hai: payment gateway simulated hai (real paisa move nahi hota) aur notifications Firestore me log hoti hain (koi real email/SMS provider connected nahi).

## Goal
Travel team ko code change ke bina packages publish/update karne ka option mile, aur guest ko "View details" se "Booked & paid" tak ka single flow mile — jisme operator har booking ka status dekh kar update kar sake aur yeh pata ho ki kis booking par kya notification bheji gayi.

## Actors
- **Guest / traveller** — packages browse karta hai, booking form bharta hai, demo payment karta hai, apni booking ka status dekhta hai.
- **Guest signed in with Google** — apni bookings list karta hai (sirf jinki email booking ke email se match karti hai).
- **Travel operator (admin)** — `config/admins` allowlist me email hone wala account; packages manage karta hai, booking status update karta hai, notifications review/send karta hai.

## Functional requirements
- **REQ-001:** Admin panel me package list ho jisme har package ka name, destination, price aur status (published/draft) dikhe.
- **REQ-002:** Admin package create, edit, publish/unpublish aur delete kar sake. Package fields: name, slug, destination, price label (e.g. `₹15,999*`), numeric price amount (INR, per traveller), duration, summary, day-by-day itinerary, inclusions, hotel details, transport details, FAQs.
- **REQ-003:** Public site packages Firestore se read kare. Agar koi published package nahi hai ya Firebase configured nahi hai, toh bundled sample packages (`src/mockData.js`) render hon — site kabhi khaali na lage.
- **REQ-004:** Package detail page par "Book this trip" action ho jo usi package ka booking form khole.
- **REQ-005:** Booking form guest name, email, phone, travel date, travellers aur optional notes capture kare; required fields, email/phone format aur "date aaj ya aage" validate kare.
- **REQ-006:** Booking submit hone par ek booking record bane jisme unique human-readable reference (e.g. `ELW-7QK4M2`) aur status `pending_payment` ho, saath me ek email aur ek SMS notification record generate ho.
- **REQ-007:** Simulated payment step guest ko booking amount pay karne de (demo card/UPI); koi real paisa move na ho.
- **REQ-008:** Payment success par booking `confirmed` aur payment `paid` ho (payment reference ke saath); payment decline par booking unpaid rahe aur error message dikhe.
- **REQ-009:** Har booking me status history (status + timestamp) store ho taaki operator dekh sake ki status kab badla.
- **REQ-010:** Admin bookings panel me saari bookings dikhein — reference, guest, package, amount, payment status aur status — status filter aur reference/email/package search ke saath.
- **REQ-011:** Admin booking status badal sake (`pending_payment` → `confirmed` → `cancelled`/`completed`); har change par status-history entry aur naye email + SMS notification records bane.
- **REQ-012:** Admin notifications panel me saari generated notifications dikhein — channel, recipient, trigger, body aur delivery state — aur admin kisi notification ko "sent" mark kar sake (simulated).
- **REQ-013:** Signed-in guest sirf apni bookings dekh sake; booking sirf uske email ya admin ke liye readable ho.
- **REQ-014:** Firebase configured na hone par public pages chalti rahein: packages sample content par fallback karein aur booking action clear "not configured" notice dikhaye, crash ya silent failure na ho.
- **REQ-015:** Booking amount = package ka numeric price amount × travellers, currency INR.

## Acceptance criteria
- **AC-001 (REQ-001):** Given signed-in admin, when `/admin/packages` open karta hai, then list me har package (published + draft) apne name, destination, price aur status ke saath dikhta hai.
- **AC-002 (REQ-002):** Given admin package editor, when admin naya package bana kar publish karta hai, then package Firestore me save hota hai aur list me "Published" status ke saath dikhta hai.
- **AC-003 (REQ-002):** Given published package, when admin uska price/summary/itinerary edit karke update karta hai, then save ke baad public package detail page nayi values dikhata hai.
- **AC-004 (REQ-002):** Given package, when admin usse draft kar deta hai, then wo package public listing aur public detail page se hat jaata hai.
- **AC-005 (REQ-002):** Given package, when admin delete confirm karta hai, then package list se hat jaata hai.
- **AC-006 (REQ-003):** Given Firestore me koi published package nahi ya Firebase unconfigured, when guest homepage kholta hai, then sample packages render hote hain (empty list nahi).
- **AC-007 (REQ-004):** Given package detail page, when guest "Book this trip" click karta hai, then booking form usi package ka naam, duration aur price dikhata hai.
- **AC-008 (REQ-005):** Given booking form, when guest required fields khaali chhod kar submit karta hai, ya invalid email/phone deta hai, ya past date select karta hai, then inline validation errors dikhte hain aur koi booking record nahi banta.
- **AC-009 (REQ-006):** Given valid booking form, when guest submit karta hai, then booking record `ELW-XXXXXX` reference, `pending_payment` status ke saath banta hai aur email + SMS notification records generate hote hain.
- **AC-010 (REQ-007):** Given booking amount, when guest payment step kholta hai, then amount = price amount × travellers, currency INR, dikhta hai.
- **AC-011 (REQ-008):** Given successful demo payment, when payment complete hoti hai, then booking status `confirmed`, payment `paid` (payment reference ke saath) ho jaata hai aur status history me entry judti hai.
- **AC-012 (REQ-008):** Given declined demo payment, when payment fail hoti hai, then error message dikhta hai, booking `pending_payment` hi rehta hai aur koi "paid" state nahi banta.
- **AC-013 (REQ-009):** Given booking jiska status admin ne badla, when booking detail dekhi jaati hai, then history me har status change ki timestamp ke saath entry hai.
- **AC-014 (REQ-010):** Given multiple bookings, when admin status filter ya search use karta hai, then sirf matching bookings dikhti hain.
- **AC-015 (REQ-011):** Given booking, when admin status change karta hai, then booking ka status update hota hai, history me entry judti hai aur naye email + SMS notifications generate hote hain.
- **AC-016 (REQ-012):** Given notifications, when admin notifications panel kholta hai, then channel, recipient, trigger, body aur state dikhte hain, aur "Mark sent" se state `sent` ho jaata hai.
- **AC-017 (REQ-013):** Given signed-in guest, when apni bookings list dekhta hai, then sirf apni bookings dikhti hain; doosre guest ki booking ki detail nahi khulti.
- **AC-018 (REQ-014):** Given Firebase unconfigured build, when guest booking form kholta hai, then clear "booking is not configured" notice dikhta hai aur app crash nahi karta.
- **AC-019 (REQ-015):** Given price amount `₹15,999` aur 3 travellers, when booking amount calculate hota hai, then amount `₹47,997` hota hai.

## Business rules and validation
- **Booking reference:** `ELW-` + 6 uppercase alphanumerics, unique (booking document ki ID hi reference hoti hai).
- **Booking statuses:** `pending_payment`, `confirmed`, `cancelled`, `completed`. `cancelled` aur `completed` terminal hain; `pending_payment` sirf simulated payment se `confirmed` ho sakta hai.
- **Status history:** har booking me `history` array hota hai jisme `{ status, at, note }` entries hoti hain; booking create hone par bhi ek `pending_payment` entry judti hai.
- **Amount:** `priceAmount × travellers`, currency `INR`, minimum ₹1. Amount server par recompute nahi hota POC me (client-computed) — production requirement ke liye open question.
- **Travellers:** 1 se 20 ke beech.
- **Travel date:** aaj ya usse aage, format `YYYY-MM-DD`.
- **Guest name:** 2–100 characters. **Email:** valid format, max 254 characters. **Phone:** 7–30 characters, digits aur `+ ( ) -` allowed.
- **Payment demo rules:** card number 16 digits; `4000 0000 0000 0001` (ya koi 16-digit number jo `0002` par khatam ho) success, `4000 0000 0000 0002` decline; UPI id mein `fail` shabd aaye to decline.
- **Notifications:** har booking event par email + SMS dono channels. Channels: `email`, `sms`. States: `queued` (created), `sent` (admin ne mark kiya), `failed`. Trigger: `booking_created`, `payment_received`, `status_changed`.
- **Package slug:** name se auto-generate hota hai, kebab-case, unique.
- **Package status:** `draft` ya `published`. Sirf published packages public site par dikhte hain.
- **Public fallback:** Firestore empty/unavailable/unconfigured ho toh sample packages (`src/mockData.js`) dikhte hain — read-only, admin editable nahi.
- **Destinations:** is requirement me destinations sample content hi rehte hain (`src/mockData.js`); admin se destination management alag requirement hai (TBD).

## Dependencies and constraints
- Firestore (`tour-83b6c` project) aur Firebase Auth pehle se configured hain; admin allowlist `config/admins` document se control hoti hai.
- Firestore rules `packages`, `bookings` aur `notifications` collections ke liye update karne hote hain.
- **Payment provider integrate nahi hai** — Razorpay/Stripe/PayU ka koi SDK ya key nahi; payment browser me simulate hota hai. Real integration ke liye Cloud Functions + provider credentials chahiye (TBD).
- **Email/SMS delivery integrate nahi hai** — notifications Firestore me log hoti hain aur admin panel me dikhti hain; real delivery ke liye Cloud Functions + provider (e.g. SendGrid/Twilio/MSG91) chahiye (TBD).
- POC me Cloud Functions folder `firebase.json` me configured nahi hai.
- Booking notifications client-side trigger hoti hain (booking create aur admin status change ke waqt).

## Open questions
- **TBD:** Kaunsa payment gateway use hoga (Razorpay / Stripe / PayU) aur server-side amount verification kaise hogi?
- **TBD:** Email/SMS provider aur message templates (booking confirmation, payment receipt, cancellation) final kaun approve karega?
- **TBD:** Cancellation policy, refund amount aur deadline — booking cancel karne par kya refund hoga?
- **TBD:** Deposit vs full payment — booking confirm hone par kitna amount lena hai?
- **TBD:** Payment na karne par booking kitni der baad expire ho (pending_payment timeout)?
- **TBD:** GST/tax treatment aur invoice generation chahiye ya nahi?
- **TBD:** Destinations aur package images bhi admin se manage hone chahiye ya sirf package content?
- **TBD:** Guest ko email/SMS ka opt-in consent lena hai ya nahi (booking form par checkbox)?
