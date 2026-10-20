# India Travel Homepage and Destination Discovery

## Overview

React + Vite mein bana India-focused Tour & Travel website homepage visitors ko travel hero banner, popular Indian destinations, featured packages, aur trip plan/search karne ka clear path dega. Initial sample destinations mein Shimla, Manali, Lahaul & Spiti, aur Mussoorie shamil hain. Visitors destination search karke us jagah ki photos aur useful trip information dekh sakenge.

## Goal

Visitors ko India ke travel options—especially Himachal Pradesh aur Uttarakhand ke hill destinations—discover karne, packages compare karne, aur trip planning shuru karne mein madad dena.

## Actors

- Prospective traveler / website visitor.

## Functional requirements

- **REQ-001 — Hero banner:** Homepage par prominent travel hero banner, headline/intro copy, aur clear “Plan your trip” call-to-action dikhna chahiye.
- **REQ-002 — Popular destinations:** Homepage par popular Indian destination cards dikhne chahiye. Initial sample destinations: Shimla, Manali, Lahaul & Spiti, aur Mussoorie. Har card mein destination ka naam aur photo ho.
- **REQ-003 — Featured packages:** Homepage par featured Indian travel package cards dikhne chahiye. Har card mein package name, destination/place, aur price Indian Rupees (INR, ₹) mein ho. Sample content filhaal acceptable hai.
- **REQ-004 — Plan your trip navigation:** “Plan your trip” button visitor ko homepage ke trip search form tak scroll karaye.
- **REQ-005 — Destination search:** Visitor search form mein destination/place search kar sake aur matching destination result select kar sake.
- **REQ-006 — Destination details:** Destination result select karne par destination ki detail view/page khule. Ismein destination photos, short overview, top attractions, available packages, package prices, duration, aur itinerary dikhaye jayen. Itinerary aur duration user ne recommended detail set ke roop mein confirm kiye hain.
- **REQ-007 — Search feedback:** Agar search se koi matching destination na mile, visitor ko clear no-results message dikhaya jaye; page blank ya broken na lage.
- **REQ-008 — Responsive and accessible presentation:** Homepage aur destination details mobile aur desktop layouts par usable hon. Images ke liye meaningful alternative text ho; interactive controls keyboard se use kiye ja saken.
- **REQ-009 — React application:** Website React components ke roop mein implement ho aur Vite development/production build use kare. Search, saved destinations, gallery, and newsletter-demo interactions React state se kaam karein; user-facing behavior ke liye direct DOM mutation par depend na karein.
- **REQ-010 — Save destination:** Visitor destination card ke save control ko toggle karke destination ko saved/unsaved mark kar sake. State current page session tak local hai; account/server persistence scope mein nahi hai.
- **REQ-011 — Destination photo gallery:** Destination details mein thumbnail select karne par main photo aur selected thumbnail state update ho.
- **REQ-012 — Newsletter demo:** Valid email submit karne par inline demo confirmation dikhaya jaye. Is stage par email kisi backend ya mailing list ko send na ho.
- **REQ-013 — Empty destination search:** Search field blank chhodkar search submit karne par all available sample destinations results mein dikhaye jayen.
- **REQ-014 — Travel enquiry contact form:** Visitor apna naam, email, phone number, destination, optional travel date, traveller count, aur optional message submit kar sake. Valid enquiry `contactEnquiries` Firestore collection mein save ho aur confirmation dikhe.
- **REQ-015 — Google sign-in:** Visitor Firebase Authentication ke through Google account se sign in aur sign out kar sake. Signed-in visitor ka display name/email header mein dikhaya jaye. Provider/domain setup unavailable ho to helpful error message dikhe.

## Acceptance criteria

- **AC-001 (REQ-001):** Given visitor homepage kholta hai, when page load hota hai, then travel hero banner, headline/intro, aur “Plan your trip” button visible hote hain.
- **AC-002 (REQ-002):** Given homepage load ho chuka hai, when visitor popular destinations section tak pahunchta hai, then destination name aur photo wale destination cards visible hote hain.
- **AC-003 (REQ-003):** Given homepage load ho chuka hai, when visitor featured packages section dekhta hai, then har visible package card par package name, place, duration, aur illustrative price `₹` (INR) mein hota hai.
- **AC-004 (REQ-004):** Given visitor homepage ke kisi bhi section par hai, when woh “Plan your trip” button activate karta hai, then trip search form viewport mein aa jata hai.
- **AC-005 (REQ-005):** Given search form visible hai, when visitor available sample destination search karke matching result select karta hai, then us destination ki details khulti hain.
- **AC-006 (REQ-006):** Given destination detail view khuli hai, when visitor detail content dekhta hai, then photos, overview, attractions, packages, prices, duration, aur itinerary available hote hain.
- **AC-007 (REQ-007):** Given visitor aisa destination search karta hai jiska sample data available nahi hai, when search complete hota hai, then helpful no-results message dikhai deta hai aur visitor search badal sakta hai.
- **AC-008 (REQ-008):** Given visitor mobile ya desktop viewport use karta hai, when homepage/destination details render hote hain, then content bina horizontal overflow ke readable aur usable hota hai, images ke alt text hote hain, aur controls keyboard se operate kiye ja sakte hain.
- **AC-009 (REQ-009):** Given project dependencies install hain, when developer `npm run dev` chalata hai, then React homepage bina runtime error render hota hai; when developer `npm run build` chalata hai, then Vite production build successfully complete hota hai.
- **AC-010 (REQ-010):** Given destination card visible hai, when visitor uska save control activate karta hai, then control ka saved state/accessible `aria-pressed` value update hota hai; dobara activate karne par unsaved state restore hoti hai.
- **AC-011 (REQ-011):** Given destination details aur gallery thumbnails visible hain, when visitor doosra thumbnail select karta hai, then main photo us thumbnail ki photo ban jati hai aur selected state update hoti hai.
- **AC-012 (REQ-012):** Given newsletter form visible hai, when visitor valid email submit karta hai, then inline demo confirmation dikhai deti hai aur form input clear hota hai. Koi real subscription request nahi bheji jati.
- **AC-013 (REQ-013):** Given destination search form visible hai aur destination field blank hai, when visitor search submit karta hai, then all four available sample destinations results mein dikhte hain.
- **AC-014 (REQ-014):** Given contact form visible hai aur Firestore available hai, when visitor required fields valid details se fill karke submit karta hai, then enquiry Firestore mein save ho, confirmation dikhai de, aur form reset ho. Agar save fail ho to error message dikhaye aur entered details preserve rahein.
- **AC-015 (REQ-015):** Given Firebase project mein Google provider enabled hai aur current domain authorized hai, when visitor Google sign-in complete karta hai, then signed-in identity header mein dikhai deti hai aur visitor sign out kar sakta hai. Provider disabled/unauthorized ho to helpful error dikhaya jata hai.

## Business rules and validation

- Abhi destinations, packages, itineraries, aur prices ke liye **illustrative sample content** use hoga; real travel inventory, availability, aur rates user ne provide nahi kiye hain.
- Website India-focused hai; displayed sample prices Indian Rupees (INR, ₹) mein hain. Ye real quotes nahi hain.
- Search results aur destination details static sample data se aayenge, jab tak koi data source/API separately specify na ho.
- Booking, payment, real-time availability, aur external booking provider integration is requirement ka confirmed scope nahi hai.
- Contact form submissions Firestore mein store hongi; browser/client se enquiries read, update, ya delete nahi ki ja sakti. Email alerts/admin dashboard abhi scope mein nahi hain.
- Firestore database currently `nam5` US multi-region mein hai; contact details isi existing database location par store hongi.
- Lahaul & Spiti jaise high-altitude routes par access aur itinerary season/weather ke hisaab se badal sakte hain; live route status abhi scope mein nahi hai.
- Destination detail view homepage par inline section ke roop mein khulta hai; ye separate route nahi hai.

## Dependencies and constraints

- Destination photos aur descriptive sample data ki zaroorat hogi.
- Local development/build ke liye Node.js, npm, React, aur Vite required hain.
- Google sign-in ke liye Firebase Web App config, Firebase Authentication setup, Google provider enablement, aur authorized hosting/local domains required hain.
- Photos abhi external Unsplash image URLs se load hote hain; offline/local image hosting abhi setup nahi hai.
- Real booking/search data source, verified package prices/inclusions, aur seasonal route updates define karna abhi baaki hai.

## Open questions

- Kya initial focus Shimla, Manali, Lahaul & Spiti, aur Mussoorie par hi rahe, ya aur Indian destinations bhi add karne hain?
- Real package rates, inclusions, aur seasonal itinerary details kab/kaun provide karega?
- Newsletter sign-up aur trip search ko backend/API se kab connect karna hai?
