# Enquiry Email and Enquiry Notification

## Overview
Contact-form enquiries ab ek fixed email address par jaate hain — `connect2devinder@gmail.com`. Address `src/siteConfig.js` me ek jagah hai aur site par contact section + footer dono me dikhta hai, aur har enquiry ke liye ek email notification record queue hota hai jo admin panel me dikhta hai.

## Goal
Travel team ko enquiry seedha mil rahi ho — guest ko bhi pata chale enquiry kis email par ja rahi hai.

## Actors
- **Guest / traveller** — enquiry form bharta hai.
- **Travel operator (admin)** — admin panel me notifications tab me enquiry email dekhta hai.
- **Elsewhere Travel Co.** — enquiry ka recipient.

## Functional requirements
- **REQ-001:** Enquiry ka recipient email `connect2devinder@gmail.com` hona chahiye.
- **REQ-002:** Email address ek hi jagah define ho (`src/siteConfig.js`) aur contact section, footer aur notification record — sab me wahi value use ho.
- **REQ-003:** Contact section me enquiry email "Email us" ke naam se dikhe, `mailto:` link ke saath.
- **REQ-004:** Footer me bhi enquiry email dikhe (mailto link).
- **REQ-005:** Form submit hone par enquiry `contactEnquiries` collection me save ho aur saath me ek email notification record bane jiska recipient enquiry email ho, trigger `enquiry_received`.
- **REQ-006:** Notification record me enquiry ka poora detail ho — naam, email, phone, destination, package, travel date, travellers aur message.
- **REQ-007:** Form ka success message bataye ki enquiry kis email par bhej di gayi.
- **REQ-008:** Notification record booking wale record se ek hi collection me rahe, sirf `targetType` (`booking` / `enquiry`) alag ho.

## Acceptance criteria
- **AC-001 (REQ-001, REQ-005):** Given valid enquiry form, when guest submit karta hai, then `contactEnquiries` me enquiry save hoti hai aur `notifications` me `trigger: "enquiry_received"`, `channel: "email"`, `recipient: "connect2devinder@gmail.com"` wala record banta hai.
- **AC-002 (REQ-003):** Given contact section, when guest dekhta hai, then "Email us" ke saath `connect2devinder@gmail.com` dikhta hai aur link `mailto:` se khulta hai.
- **AC-003 (REQ-004):** Given footer, when guest dekhta hai, then enquiry email mailto link ke saath dikhta hai.
- **AC-004 (REQ-006):** Given enquiry notification, when admin notification kholta hai, then body me guest ka naam, email, phone, destination, package, travel date, travellers aur message sab hote hain.
- **AC-005 (REQ-007):** Given successful submit, when guest success message dekhta hai, then message me `connect2devinder@gmail.com` hota hai.
- **AC-006 (REQ-008):** Given booking notification, when admin uska record dekhta hai, then `targetType` "booking" rehta hai aur enquiry record ka `targetType` "enquiry" hota hai.

## Business rules and validation
- Enquiry email `src/siteConfig.js` ke `siteConfig.email.address` me hai — badli to poori site update ho jaati hai.
- Notification record ke fields: `targetId`, `targetType`, `reference`, `channel`, `recipient`, `subject`, `body`, `trigger`, `status`, `createdAt`, `sentAt`.
- `trigger` allowed values: `booking_created`, `payment_received`, `status_changed`, `enquiry_received`.
- `targetType` allowed values: `booking`, `enquiry`. Booking notification ke liye booking doc exist hona chahiye, enquiry notification ke liye enquiry doc.
- Notification body 1500 characters se chhoti hoti hai; enquiry message 600 characters tak truncate hota hai.
- Notification `status` "queued" rehta hai jab tak admin use "sent" mark na kare (delivery POC me simulated hai).

## Dependencies and constraints
- Firestore rules: `notifications` collection me create allowed hai agar linked booking/enquiry doc exist karta ho; read/update admin-only.
- Enquiry doc read public nahi hai (`contactEnquiries` me `allow read: if false`), lekin rules me `exists()` se linked-doc check ho jaata hai.
- Real email delivery integrate nahi hai — record admin panel me dikhta hai. Actual bhejne ke liye Cloud Functions + email provider chahiye (TBD).

## Open questions
- **TBD:** Kya enquiry par bhi SMS guest ke phone number par jaaye?
- **TBD:** Notification record ka retention kitne din ka rakhein hai?
- **TBD:** Kya guest ko bhi "humne aapki enquiry receive kar li" confirmation email chahiye?
