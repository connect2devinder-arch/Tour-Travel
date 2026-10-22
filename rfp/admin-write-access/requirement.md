# Admin Access and the Blog "Write" Option

## Overview
Blog (aur packages/bookings) likhne ka option header me "Write" link ke roop me admins ko dikhta hai. Ye tabhi dikhta hai jab visitor **sirf `connect2devinder@gmail.com`** se Google sign-in kare. Is iteration me admin detection robust banaya gaya (allowlist read fail hone par bhi owner account admin rahta hai), admin gate par email hint add kiya gaya, aur footer me bhi "Write" link aa gaya taaki option miss na ho.

## Goal
Blog likhne wale ko apna admin panel 2 click me mil jaye, aur bina admin access wale ko clear message mile ki kaun sa account chahiye.

## Actors
- **Travel operator (admin)** — `connect2devinder@gmail.com` se sign in karke "Write" link se journal/packages/bookings manage karta hai.
- **Visitor** — guest rahega to "Write" link nahi dikhega; admin page par clear guidance milegi.

## Functional requirements
- **REQ-001:** `config/admins` Firestore document me `connect2devinder@gmail.com` allowlist me ho.
- **REQ-002:** Header me "Write" link (`/admin/journal`) sirf signed-in admin ko dikhe.
- **REQ-003:** Footer me admin ke liye "Write" link ho, non-admin ke liye "Admin" link.
- **REQ-004:** Admin detection `siteConfig.adminEmail` se bhi ho — allowlist document read fail ho tab bhi owner account admin rahe.
- **REQ-005:** Admin gate (signed out) par message bataye ki kaun sa Google account use karna hai.
- **REQ-006:** Signed-in non-admin ko apna email dikhaya jaye aur bataya jaye ki sahi account se sign in kare.
- **REQ-007:** `siteConfig.adminEmail` ek hi jagah ho (siteConfig.js) aur allowlist document se sync rahe.
- **REQ-008:** Google sign-in enabled ho aur live domain authorized ho.

## Acceptance criteria
- **AC-001 (REQ-001, REQ-008):** Given production project, when `config/admins` check hota hai, then `emails` array me `connect2devinder@gmail.com` ho; authorized domains me `tour-83b6c.web.app` ho; Google provider enabled ho.
- **AC-002 (REQ-002, REQ-004):** Given signed-in admin, when header dekhi jaati hai, then "Write" link `/admin/journal` dikhta hai; given guest ya non-admin, then nahi dikhta.
- **AC-003 (REQ-003):** Given admin, when footer dekha jaata hai, then Company column me "Write" hai; given guest, then "Admin".
- **AC-004 (REQ-005):** Given signed-out visitor, when `/admin` khulta hai, then "Sign in to manage the site." aur `connect2devinder@gmail.com` ka message dikhta hai.
- **AC-005 (REQ-006):** Given signed-in non-admin, when `/admin` khulta hai, then unka email dikhta hai aur bataya jata hai ki `connect2devinder@gmail.com` se sign in karein.
- **AC-006 (REQ-001):** Given real signed-in admin token, when Firestore `config/admins` read hota hai, then 200 (allowlist me hone par); non-admin ya anonymous ke liye 403.

## Business rules and validation
- `siteConfig.adminEmail` client-side sirf **UI gating** ke liye hai — asli security Firestore rules me hai (`config/admins` allowlist).
- Allowlist document ka read rule `allow read: if isAdmin()` hai, isliye allowlist ka read sirf admin hi kar sakta hai; isliye client-side fallback zaroori hai.
- Admin email publicly footer me enquiry address ke roop me already dikhti hai, isliye admin gate par dikhana nayi information expose nahi karta.
- Account switch: alag Google account se sign in karne par "Write" link chala jayega (auth state badal jaata hai).

## Dependencies and constraints
- Firebase Auth (Google provider), Firestore rules, `config/admins` document.
- Client-side admin check: `src/blog.js` → `isAdminUser()`; gate UI: `src/AdminGate.jsx`; owner email: `src/siteConfig.js`.
- Firestore rules ka `isAdmin()` `get()` use karta hai (elevated read) — isliye allowlist read allowed hai.

## Open questions
- **TBD:** Kya future me multiple admin accounts hon (allowlist me 2-3 emails)?
- **TBD:** Admin sign-in ke liye password bhi allow karna hai (abhi sirf Google)?
- **TBD:** Non-admin signed-in users ke liye dashboard me read-only view chahiye?
