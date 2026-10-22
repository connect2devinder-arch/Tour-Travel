# Community Blogging (Users Can Write Too)

## Overview
Ab koi bhi **Google sign-in wala user** blog likh sakta hai. Users ke liye alag area hai (`/write`) — apne drafts dekhna, naya post likhna, aur use review ke liye bhejna. Admin approve karta hai tab post public Journal me live hota hai. Packages, bookings aur site content admin-only rahenge.

## Goal
Community se content aaye, lekin site par control khud ke paas rahe — user likhe, admin publish kare.

## Actors
- **Community writer** — Google sign-in karke account banata hai, post likhta hai, review ke liye bhejta hai, apne post dekh/edit/delete karta hai.
- **Travel operator (admin)** — review queue me post approve karta hai ya changes maangta hai, kisi bhi post ko delete karta hai.
- **Visitor** — sirf published posts dekhta hai.

## Functional requirements
- **REQ-001:** Signed-in user ke liye `/write` area ho — "My posts" list aur "New post".
- **REQ-002:** Guest `/write` khole to sign-in screen dikhe (Google sign-in ke saath).
- **REQ-003:** Post status values: `draft`, `pending` (review me), `published` (live), `rejected` (changes maange gaye, note ke saath).
- **REQ-004:** User sirf `draft` ya `pending` me post save kar sakta hai — **publish nahi** (admin-only).
- **REQ-005:** Post me `authorUid` (Firebase UID) store ho, taaki ownership rules kaam karein; saath me `authorName` aur `authorPhoto`.
- **REQ-006:** User sirf apne posts dekh sake, edit kar sake aur delete kar sake; dusre users ke drafts/pending posts invisible rahein.
- **REQ-007:** User published post ko edit kare to wo **wapas review me** chale (`pending`), bina admin approval ke live na rahe.
- **REQ-008:** Admin journal list me **Review queue** dikhe — pending aur rejected posts, author name ke saath.
- **REQ-009:** Admin ke paas do actions: **Approve & publish** aur **Request changes** (note likhkar).
- **REQ-010:** Author ko apne post par admin ka note dikhe.
- **REQ-011:** Approved post public Journal listing aur article page par author name ke saath dikhe.
- **REQ-012:** Signed-in non-admin ko header me **Write** link mile (`/write`); footer me bhi Write link ho.
- **REQ-013:** Firestore rules: user create sirf `draft`/`pending` me, sirf apne `authorUid` ke saath; update sirf apne post ka, ownership/`featured`/`publishedAt` change na kar sakta; delete sirf apna; read published public, pending/draft sirf author ya admin ko.
- **REQ-014:** Packages, bookings, enquiries, notifications — ye sab admin-only rahen.

## Acceptance criteria
- **AC-001 (REQ-001, REQ-002):** Given signed-in user, when `/write` kholta hai, then apne posts (status ke saath) aur "+ New post" dikhte hain; given guest, then "Sign in to write." screen.
- **AC-002 (REQ-004, REQ-013):** Given signed-in user, when post create karta hai `draft`/`pending` me, then write allowed; `published` status ke saath create attempt **denied** hota hai (rules).
- **AC-003 (REQ-006):** Given user A ka pending post, when user B (ya anonymous) use karta hai, then read **denied**; user A ko apna post **allowed**.
- **AC-004 (REQ-006, REQ-013):** Given user A ka post, when user B edit ya delete karta hai, then **denied**; user A ko apna post edit/delete **allowed**.
- **AC-005 (REQ-007):** Given user ka published post, when user use edit karta hai, then post `pending` ho jaata hai (live nahi rehta) aur write allowed.
- **AC-006 (REQ-008, REQ-009):** Given admin, when `/admin/journal` kholta hai, then review queue me pending posts dikhte hain, aur "Approve & publish" se post live hota hai; "Request changes" se `rejected` + note.
- **AC-007 (REQ-010):** Given rejected post, when author apni list dekhta hai, then admin ka note dikhta hai.
- **AC-008 (REQ-011):** Given approved post, when public journal kholta hai, then post listing me author name ke saath dikhta hai.
- **AC-009 (REQ-014):** Given signed-in non-admin, when `/admin/packages` ya `/admin/bookings` kholta hai, then admin gate block karta hai.

## Business rules and validation
- Post statuses: `draft` (sirf author), `pending` (review me), `published` (public), `rejected` (note ke saath, author edit karke resubmit kar sakta hai).
- Ownership: post ka `authorUid` hamesha author ka Firebase UID hota hai aur kabhi nahi badalta.
- User `featured` aur `publishedAt` nahi badal sakta (admin-only fields).
- Published post ki edit hamesha `pending` me wapas jaati hai.
- User sirf apna post delete kar sakta hai; admin kisi bhi post ko delete kar sakta hai.
- Community post author ke naam se publish hoti hai (`authorName`).
- Email/password signup abhi bhi disabled hai — account Google sign-in se banta hai (TBD).

## Dependencies and constraints
- Firestore `posts` collection me `authorUid`, `authorPhoto`, `reviewNote` fields; rules ownership-aware.
- Firebase Auth (Google) — UID se ownership.
- Storage: cover uploads `journal/covers/<postId>/…` (admin-only write abhi) — community cover upload ke liye storage rule alag chahiye (TBD).
- Public listing `listPublishedPosts()` sirf `status == 'published'` filter karti hai → pending/draft kabhi public list me nahi.
- `listPostsByAuthor(uid)` sirf author ko apne posts dikhata hai.

## Open questions
- **TBD:** Community members ko cover image upload ka access dena hai? (abhi sirf admin)
- **TBD:** Ek user kitne posts bana sakta hai (rate limit)?
- **TBD:** Rejected post ka author ko email notification chahiye?
- **TBD:** Community posts par "Community" badge dikhana hai ya sirf author name?
- **TBD:** Hindi translation sibling feature community writers ko bhi mile?
