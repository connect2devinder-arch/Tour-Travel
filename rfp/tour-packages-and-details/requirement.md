# Tour Packages and Package Details

## Overview

India-focused travel website par visitors tour packages compare kar saken aur package-specific detail page par itinerary, inclusions, stay/transport information, photos, aur FAQs dekh saken. Is iteration ke liye package content illustrative mock data hoga.

## Goal

Visitors ko package choose karne ke liye essential trip information dena aur selected package ke saath enquiry shuru karne dena.

## Actors

- Prospective traveler / website visitor.

## Functional requirements

- **REQ-001 — Package cards:** Tour package listing cards par package name, destination, duration, itinerary summary, inclusions, aur “Starting from” price INR mein dikhaye jayen.
- **REQ-002 — Separate package detail page:** “View details” select karne par us package ka shareable URL/page khule, e.g. `/packages/shimla-escape`.
- **REQ-003 — Day-wise plan:** Detail page par itinerary day-by-day order mein dikhayi jaye.
- **REQ-004 — Package information:** Detail page par package inclusions, hotel/stay details, aur transport details sections hon.
- **REQ-005 — Photos and FAQs:** Detail page par package destination photos aur readable FAQs dikhaye jayen.
- **REQ-006 — Enquiry handoff:** “Enquire about this trip” visitor ko existing contact form par le jaye aur selected package preselect kare. Contact submission Firestore document mein package ID aur package name bhi store kare.
- **REQ-007 — Responsive and accessible page:** Package cards aur details mobile/desktop par usable hon; navigation, gallery, FAQs, aur enquiry controls keyboard-accessible hon.

## Acceptance criteria

- **AC-001 (REQ-001):** Given package listing visible hai, when visitor cards dekhta hai, then har card par name, destination, duration, itinerary summary, inclusions, aur `Starting from ₹...` sample price visible hota hai.
- **AC-002 (REQ-002):** Given package card visible hai, when visitor “View details” activate karta hai, then us package ka unique detail URL khulta hai aur correct package title dikhata hai.
- **AC-003 (REQ-003):** Given detail page khuli hai, when visitor itinerary dekhta hai, then trip plan Day 1 se duration ke aakhri din tak sahi order mein dikhai deta hai.
- **AC-004 (REQ-004):** Given detail page khuli hai, when visitor package information dekhta hai, then inclusions, hotel/stay, aur transport details alag sections mein visible hote hain.
- **AC-005 (REQ-005):** Given detail page khuli hai, when visitor photos aur FAQs dekhta hai, then destination photos accessible alt text ke saath aur FAQ questions/answers readable form mein dikhte hain.
- **AC-006 (REQ-006):** Given visitor package detail page par hai, when woh enquiry action activate karta hai, then contact form par wahi package selected hota hai; valid submission Firestore `contactEnquiries` document mein package ID/name ke saath save hoti hai.
- **AC-007 (REQ-007):** Given visitor mobile ya desktop use karta hai, when package list/detail render hota hai, then content viewport mein reflow hota hai aur main controls keyboard se operate kiye ja sakte hain.

## Business rules and validation

- Destination, itinerary, hotel/transport information, FAQs, inclusions, aur package prices abhi **illustrative mock data** hain; actual supplier/property confirmations ya quotes nahi.
- Prices “Starting from” ke roop mein INR (`₹`) mein dikhte hain.
- Booking, payment, real-time availability, cancellation policy, aur vendor integrations is scope mein nahi hain.
- Enquiry form Firestore mein enquiry aur selected package reference store karta hai; email notification/admin dashboard alag requirement hai.

## Dependencies and constraints

- Package data `src/mockData.js` se aata hai.
- Package details separate React Router route par render hote hain.
- Contact enquiry writes ke liye Firebase project `tour-83b6c` ka Firestore `contactEnquiries` collection aur deployed Security Rules required hain.

## Open questions

- Real supplier-confirmed package prices, hotels, transport inclusions, aur itinerary kab provide honge?
- Firestore enquiry ke liye admin dashboard ya email notification chahiye?
