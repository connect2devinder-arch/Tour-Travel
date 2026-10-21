# Blog and Content Writing Platform ("The Journal")

## Overview

Website par ek blog/content platform add hoga jahan owner apne travel guides, itineraries, seasonal tips aur stories likh, publish aur edit kar sake. Har post English aur Hindi dono versions mein available hogi. Reader-facing blog public rahega, aur writing sirf admin users ke liye.

## Goal

Organic search traffic aur content authority badhana, aur website par ek aisi jagah dena jahan owner bina developer ke naye travel content publish kar sake.

## Actors

- **Reader:** Visitor jo blog padhta hai.
- **Admin/Owner:** Google sign-in karke posts create/edit/publish karta hai.
- **Owner (non-admin):** Signed in ho par admin nahi — read-only access.

## Functional requirements

- **REQ-001 — Journal listing:** `/journal` par published posts ka listing ho — featured post highlight ke saath, latest posts grid, aur destination/tag filter.
- **REQ-002 — Article page:** `/journal/:slug` par post render ho: cover image, title, meta (author, date, reading time), markdown body, table of contents, related posts, aur share buttons.
- **REQ-003 — Bilingual posts:** Har post English aur Hindi dono versions mein publish ho sakein. Versions ek `translationGroup` se linked honge, aur reader dono switch kar sake. Koi translation na ho to clear state dikhe.
- **REQ-004 — Content types:** Post type `guide`, `itinerary`, `seasonal`, ya `story` hona chahiye.
- **REQ-005 — Draft/publish workflow:** Admin post ko `draft` ya `published` state mein rakh sake. Sirf published posts public listing aur article page par dikhein.
- **REQ-006 — Admin editor:** `/admin/journal` par post list (status, languages, last edited) ho, aur `/admin/journal/new` + `/admin/journal/:id` par editor — title, slug, excerpt, markdown body with live preview, cover image upload, tags, linked destination/package, aur publish toggle.
- **REQ-007 — Cover images:** Cover image Firebase Storage mein upload ho (`journal/covers/...`) aur post mein render ho.
- **REQ-008 — Markdown rendering:** Body markdown se render ho (tables, lists, headings, links, code supported) aur output sanitize hua ho — raw HTML/script execute na ho.
- **REQ-009 — SEO:** Per-post meta title, meta description, Open Graph image, JSON-LD `Article` schema, `sitemap.xml` aur RSS feed.
- **REQ-010 — Related content:** Article page par same destination ya shared tags wale posts "related" ke roop mein dikhaye jayen.
- **REQ-011 — Access control:** Admin routes sirf admin users ko dikhein; Firestore aur Storage rules se writes enforce karein (UI hiding ke bajaye).
- **REQ-012 — Responsive and accessible:** Blog pages mobile par responsive hon, images meaningful alt text rakhein, aur keyboard navigation kaam kare.

## Acceptance criteria

- **AC-001 (REQ-001):** Given `/journal` khula hai, when visitor dekhta hai, then featured post aur published posts ka grid dikhe, draft posts na dikhein, aur destination/tag filter se list filter ho.
- **AC-002 (REQ-002):** Given post published hai, when reader uska URL kholta hai, then cover, title, author, date, reading time, sanitized body, TOC aur related posts visible hon.
- **AC-003 (REQ-003):** Given post ke dono versions hain, when reader language switch use karta hai, then corresponding language version dikhe; translation na hone par clear "not available in this language" state aaye.
- **AC-004 (REQ-004):** Given post create hota hai, when admin type choose karta hai, then `guide`, `itinerary`, `seasonal`, `story` mein se ek chun sakta hai.
- **AC-005 (REQ-005):** Given post draft hai, when reader `/journal` ya post URL kholta hai, then post invisible rahe; publish karne par wahi post listing aur article page par dikhna shuru kare.
- **AC-006 (REQ-006):** Given admin signed in hai, when woh naya post banata hai aur publish karta hai, then post `/admin/journal` list mein dikhe aur public `/journal` par bhi aa jaye.
- **AC-007 (REQ-007):** Given cover image choose ki gayi hai, when admin save karta hai, then image Firebase Storage mein upload ho aur post page par render ho.
- **AC-008 (REQ-008):** Given post body mein raw HTML/script hai, when article render hota hai, then script execute na ho aur output sanitized markup ho.
- **AC-009 (REQ-009):** Given post published hai, when uska URL kholte hain, then unique meta title/description, OG image aur JSON-LD `Article` markup page head mein hon; `/journal/rss.xml` published posts list kare.
- **AC-010 (REQ-010):** Given article page khula hai, when visitor neeche dekhta hai, then same destination ya shared tags wale related posts dikhein.
- **AC-011 (REQ-011):** Given non-admin user signed in hai, when woh `/admin/journal` kholta hai ya post likhne ki koshish karta hai, then editor access mile na aur Firestore/Storage rules write reject karein.
- **AC-012 (REQ-012):** Given mobile viewport, when journal list aur article render hote hain, then content single-column stack ho, koi horizontal overflow na ho, aur images/controls keyboard-accessible hon.

## Business rules and validation

- **Content store:** Cloud Firestore (project `tour-83b6c`, database `(default)`), collection `posts`.
- **Storage:** bucket `tour-83b6c.firebasestorage.app`, path `journal/covers/{postId}/{fileName}`.
- **Authoring:** in-app admin editor (browser mein). Koi doosra CMS vendor ya subscription nahi.
- **Language model:** English aur Hindi. Har language version ek alag document hai, `translationGroup` se linked. Base slug English wala hota hai.
- **Sanitization:** markdown render output HTML-sanitize hoga (react-markdown + rehype-sanitize ya equivalent).
- **Draft isolation:** drafts sirf admin ko visible.
- **Listing cost control:** post listing metadata document padhe, full markdown body sirf article page par padha jaye.

## Data model

```
posts/{postId}
  translationGroup: string        # same for en/hi pair
  lang: "en" | "hi"
  type: "guide" | "itinerary" | "seasonal" | "story"
  title: string
  slug: string                   # unique, URL-safe
  excerpt: string
  body: string                   # markdown
  coverImage: string             # Firebase Storage URL
  coverAlt: string
  tags: string[]
  destinationId: string | null   # links to destination id
  packageId: string | null       # links to package id
  status: "draft" | "published"
  authorName: string
  publishedAt: timestamp | null
  updatedAt: timestamp
  readingMinutes: number
  featured: boolean
  seo: { metaTitle, metaDescription }
```

```
config/admins
  emails: string[]               # bootstrap admin allowlist
```

## Routes

| Route | Purpose |
|---|---|
| `/journal` | Listing, featured post, filters |
| `/journal/:slug` | Article |
| `/journal/tag/:tag` | Tag-filtered listing |
| `/journal/rss.xml` | RSS feed |
| `/admin/journal` | Admin post list |
| `/admin/journal/new` | Create post |
| `/admin/journal/:id` | Edit post |

## Phasing

- **Phase 1 (this requirement):** Reading experience + admin editor — listing, article page, bilingual posts, markdown with sanitization, editor, Storage cover upload, rules, SEO meta, RSS.
- **Phase 2 (later):** search, featured scheduling, view counts, newsletter integration of the feed, sitemap automation, related-content tuning.

## Dependencies and constraints

- Firestore `posts` collection aur `config/admins` doc (bootstrap ke liye).
- **Naye Storage rules chahiye** — abhi storage ke rules nahi hain, cover upload ke liye admin-only write allow karna hoga.
- Firebase Authentication (Google provider) already enabled hai.
- `react-markdown` + `remark-gfm` + `rehype-sanitize` (ya equivalent) naye dependencies.
- Per-route `<head>` management chahiye (meta/OG/JSON-LD) — SPA mein.
- Vite build ko markdown/JSON content bundle nahi karega; content runtime par Firestore se aayega.

## Open questions

- Blog copy final karne ke liye koi tone guide ya sample post chahiye?
- Featured post sirf ek ho ya multiple slots?
- Hindi version ke liye separate OG image chahiye ya same cover?
- Article mein package CTA chahiye (post se direct enquiry flow)?
- Reading time aur TOC ka format English-only rakhein ya bilingual?
