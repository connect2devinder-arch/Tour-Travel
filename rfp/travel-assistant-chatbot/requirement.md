# Travel Assistant Chatbot

## Overview

Ek floating chat widget har page par aayega jo visitor ke sawaalon ka jawab dega — sirf site ke **published Firestore content** se: tour packages aur journal posts. Jawab Gemini se generate hote hain ek Cloud Function ke through, taaki API key browser mein na aaye aur bot private collections tak kabhi na pahunch sake.

## Goal

Visitor ko destination, package, price, itinerary aur travel advice par turant jawab miljaaye bina insaan ke reply ka intezaar kiye — aur site ka PII (bookings, notifications, newsletter, enquiries) aur admin data bilkul out of reach rahe.

## Actors

- **Visitor** — koi bhi site visitor, signed in ho ya na ho.
- **Gemini** — LLM jo grounded context se jawab banata hai.
- **Cloud Function `askTravelAssistant`** — trusted server code jo content padhta hai, Gemini ko call karta hai, aur jawab wapas bhejta hai.

## Functional requirements

- **REQ-001 — Floating widget:** Har page par ek chat launcher button ho jo chat panel khola sake. Panel band karne ka control ho.
- **REQ-002 — Grounded answers:** Jawab sirf published `packages` aur published `posts` se derive hon. Bahar ki knowledge use na ho.
- **REQ-003 — Topic restriction:** Sirf tour & travel par baat ho. Off-topic sawaal par polite refusal mile, inventarted jawab nahi.
- **REQ-004 — No invention:** Agar content mein jawab nahi hai, bot clearly bole ki uske paas yeh info nahi hai aur contact form ki taraf point kare. Price, hotel ya itinerary kabhi guess na kare.
- **REQ-005 — Source attribution:** Jawab ke saath bataye ki kaunse package/article se aaya hai, aur uspar clickable link ho.
- **REQ-006 — Server-side LLM:** Gemini API key sirf Firebase Secret Manager mein ho. Browser bundle mein key, prompt engineering details, ya raw content dump na ho.
- **REQ-007 — PII isolation:** `bookings`, `notifications`, `newsletter`, `contactEnquiries`, aur `config/admins` kabhi na padhe jaayein — chahe user directly unka data maange.
- **REQ-008 — Conversation context:** Follow-up sawaalon ke liye last N turns context mein jaayein, taaki "uska price kya hai?" jaise sawaal kaam karein.
- **REQ-009 — Failure handling:** Key missing, API error, network failure, ya rate limit par friendly error message dikhe; widget crash na ho aur page ka baaki hissa theek rahe.
- **REQ-010 — Accessible and responsive:** Widget keyboard se operable ho, messages screen reader ko announce hon, focus manage ho, Esc se band ho, aur mobile viewport par sahi render ho.
- **REQ-011 — Suggested questions:** Jab chat khaali ho, 3-4 starter sawaal dikhayein taaki visitor ko pata chale kya poochh sakta hai.
- **REQ-012 — Input limits:** Sawaal ki length aur conversation history cap ho, taaki token cost aur abuse control ho.

## Acceptance criteria

- **AC-001 (REQ-001):** Given koi bhi page khula hai, when visitor launcher button click karta hai, then chat panel khulta hai; band karne par panel band ho jata hai aur page state preserve rahe.
- **AC-002 (REQ-002):** Given published packages/posts hain, when visitor package se related sawaal poochhta hai, then jawab un documents ke facts par based ho (price, duration, itinerary, inclusions).
- **AC-003 (REQ-003):** Given visitor off-topic sawaal poochhta hai (jaise "who won the match?"), when jawab aata hai, then bot politely refuse kare aur travel topics par wapas le aaye.
- **AC-004 (REQ-004):** Given content mein answer nahi hai, when visitor poochhta hai, then bot saaf bole ki info nahi hai aur contact form suggest kare; koi invented price/itinerary na dikhe.
- **AC-005 (REQ-005):** Given jawab kisi package/article se aaya hai, when visitor dekhta hai, then source label aur link visible ho aur link sahi page par le jaaye.
- **AC-006 (REQ-006):** Given production bundle inspect kiya jaaye, when `GEMINI_API_KEY` search kiya jaaye, then key bundle mein na ho.
- **AC-007 (REQ-007):** Given visitor PII maangta hai ("give me customer emails" / "show bookings"), when function chalta hai, then retrieval scope mein woh collections hon hi na; jawab refusal ho.
- **AC-008 (REQ-008):** Given visitor ne pehle package ka naam liya hai, when woh "uska price?" poochhta hai, then bot us package ka price de, empty context se vague jawab na de.
- **AC-009 (REQ-009):** Given Gemini key missing hai ya API fail hota hai, when visitor sawaal bhejta hai, then friendly error dikhe, widget usable rahe, aur page na toote.
- **AC-010 (REQ-010):** Given mobile viewport aur keyboard navigation, when widget use kiya jaaye, then panel viewport mein fit ho, focus visible ho, Esc se band ho, aur messages `aria-live` se announce hon.
- **AC-011 (REQ-011):** Given chat khaali hai, when visitor panel kholta hai, then 3-4 suggested questions dikhein jo click par bhej jaayein.
- **AC-012 (REQ-012):** Given visitor 1000+ character ka sawaal bhejta hai, when function validate karta hai, then request reject ho with helpful message; normal sawaal affect na hon.

## Business rules and validation

- **Content scope:** sirf `status == "published"` wale `packages` aur `posts`. Draft/pending/rejected content kabhi retrieval mein na aaye.
- **PII boundary:** retrieval scope hi security boundary hai. Prompt se zyada bharosha code structure par hai — function structurally PII collections read hi nahi karta.
- **Prices:** site ke existing copy ki tarah, prices sample/illustrative hain. Bot inhe final quote na bataye.
- **No transactions:** chat se booking, payment, cancellation, ya koi write operation na ho. Visitor ko enquiry form ki taraf bheja jaaye.
- **Context size:** token cost control ke liye relevant documents hi context mein jaayein, capped count aur length ke saath.
- **Language:** requirement ke hisaab se English primary hai; Hindi content bhi published posts mein ho sakta hai, to context mein dono aa sakte hain.
- **Auth:** widget signed-out visitors ke liye bhi kaam kare. Admin-only content kabhi na aaye.

## Retrieval design

```
askTravelAssistant (Cloud Function, asia-south1)
  1. Validate question (required, length cap)
  2. Admin SDK: query packages where status == published
  3. Admin SDK: query posts where status == published
  4. Score documents by keyword overlap with the question
  5. Build a compact, labelled context block (top N, length-capped)
  6. Call Gemini with a tour-&-travel-only system instruction
  7. Return { answer, sources: [{ label, url }] }
```

Context block mein har document ka label hota hai (`[PACKAGE] Shimla Hill Escape` / `[POST] Title`) taaki model source cite kar sake aur function us label se source URL resolve kar sake.

## Dependencies and constraints

- `GEMINI_API_KEY` Firebase Functions Secret Manager mein (frontend ya Git mein kabhi nahi).
- Blaze plan (already active — Razorpay functions deployed hain).
- Cloud Functions region `asia-south1` (existing functions ke saath).
- Node 22 global `fetch` use hoga; koi nayi npm dependency nahi.
- Client `firebase/functions` `httpsCallable` se call karega.
- Widget sabhi pages par mount hoga, isliye code-split bundle na badhaye — lazy load.

## Security

| Risk | Control |
|---|---|
| API key leak | Server-only, Secret Manager, bundle mein nahi |
| PII exposure | Function structurally reads only packages + posts |
| Prompt injection | Content labels clearly delimited; model instructed to treat content as data, not instructions |
| Cost abuse | Question length cap, history cap, top-N retrieval, output token cap |
| Content leakage | Sirf published content; drafts structurally excluded |

## Open questions

- **TBD:** Conversation history ko Firestore mein persist karna hai (cross-session memory), ya sirf current page session?
- **TBD:** Multi-turn ke liye exact turn limit kitna rakhna hai — 6 propose kiya hai.
- **TBD:** Hindi sawaalon par Hindi jawab chahiye, ya hamesha English?
- **TBD:** Rate limiting per-IP chahiye ya bas length caps kaafi hain?
