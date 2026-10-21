# Test Cases — Blog and Content Writing Platform ("The Journal")

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / AC-001 | Journal listing shows published posts only, with filters | High |
| TC-002 | REQ-002 / AC-002 | Article page renders full post content | High |
| TC-003 | REQ-003 / AC-003 | Language switch between English and Hindi versions | High |
| TC-004 | REQ-004 / AC-004 | Admin can set the content type | Medium |
| TC-005 | REQ-005 / AC-005 | Drafts stay hidden until published | High |
| TC-006 | REQ-006 / AC-006 | Admin creates and publishes a post end to end | High |
| TC-007 | REQ-007 / AC-007 | Cover image uploads to Firebase Storage and renders | Medium |
| TC-008 | REQ-008 / AC-008 | Markdown is sanitized and scripts do not run | High |
| TC-009 | REQ-009 / AC-009 | SEO meta, OG tags, JSON-LD, and RSS are correct | Medium |
| TC-010 | REQ-010 / AC-010 | Related posts appear on the article page | Low |
| TC-011 | REQ-011 / AC-011 | Non-admin users cannot access or write posts | High |
| TC-012 | REQ-012 / AC-012 | Blog pages are responsive and keyboard accessible | Medium |

## TC-001 — Journal listing shows published posts only, with filters

- **Type:** Positive
- **Preconditions:** At least two published posts and one draft exist.
- **Steps:**
  1. Open `/journal`.
  2. Inspect the listing.
  3. Apply a destination or tag filter.
- **Expected result:** Published posts appear (featured highlighted), the draft does not, and the filter narrows the list.
- **Requirement coverage:** REQ-001, AC-001

## TC-002 — Article page renders full post content

- **Type:** Positive
- **Preconditions:** A published post exists with body, cover, and related posts.
- **Steps:**
  1. Open `/journal/:slug` for that post.
  2. Inspect the cover, title, author, date, reading time, body, and table of contents.
- **Expected result:** All elements are present and the body renders as formatted markdown.
- **Requirement coverage:** REQ-002, AC-002

## TC-003 — Language switch between English and Hindi versions

- **Type:** Positive
- **Preconditions:** One post has both English and Hindi versions; another has only English.
- **Steps:**
  1. Open the bilingual post and switch to Hindi.
  2. Open the English-only post and attempt the language switch.
- **Expected result:** The bilingual post shows the Hindi version; the English-only post shows a clear "not available in this language" state.
- **Requirement coverage:** REQ-003, AC-003

## TC-004 — Admin can set the content type

- **Type:** Positive
- **Preconditions:** Admin is signed in on the editor.
- **Steps:**
  1. Open the content type control and inspect the options.
  2. Save a post with one type selected.
- **Expected result:** The type can be set to guide, itinerary, seasonal, or story and persists.
- **Requirement coverage:** REQ-004, AC-004

## TC-005 — Drafts stay hidden until published

- **Type:** Positive / Negative
- **Preconditions:** A post is saved as a draft.
- **Steps:**
  1. Open `/journal` and the draft's own URL.
  2. Publish the post and re-check both.
- **Expected result:** While a draft it is absent from the listing and its URL is not readable; after publishing it appears in both.
- **Requirement coverage:** REQ-005, AC-005

## TC-006 — Admin creates and publishes a post end to end

- **Type:** Positive
- **Preconditions:** Admin is signed in and is on the admin allowlist.
- **Steps:**
  1. Open `/admin/journal/new`.
  2. Fill title, slug, excerpt, and body, then save as a draft.
  3. Publish the post.
  4. Open `/admin/journal` and `/journal`.
- **Expected result:** The post appears in the admin list, and after publishing it appears on the public journal listing with a working article link.
- **Requirement coverage:** REQ-006, AC-006

## TC-007 — Cover image uploads to Firebase Storage and renders

- **Type:** Positive
- **Preconditions:** Admin is on the editor with a local image file available.
- **Steps:**
  1. Choose an image file as the cover and save the post.
  2. Open the published article.
- **Expected result:** The image is stored under `journal/covers/...` in Firebase Storage, the article renders it, and it has meaningful alt text.
- **Requirement coverage:** REQ-007, AC-007

## TC-008 — Markdown is sanitized and scripts do not run

- **Type:** Negative / Security
- **Preconditions:** A post body contains raw HTML including a `<script>` tag.
- **Steps:**
  1. Publish the post and open its article page.
  2. Check the console for script execution and inspect the rendered markup.
- **Expected result:** No script executes, no console error is raised, and the rendered output contains no script tags.
- **Requirement coverage:** REQ-008, AC-008

## TC-009 — SEO meta, OG tags, JSON-LD, and RSS are correct

- **Type:** Positive
- **Preconditions:** A published post has a title, excerpt, and cover image.
- **Steps:**
  1. Open the article page and inspect the document head.
  2. Open `/journal/rss.xml`.
- **Expected result:** The head contains a unique meta title, meta description, Open Graph image, and `Article` JSON-LD; the RSS feed lists published posts.
- **Requirement coverage:** REQ-009, AC-009

## TC-010 — Related posts appear on the article page

- **Type:** Positive
- **Preconditions:** A post shares a destination or tag with other published posts.
- **Steps:**
  1. Open the article page and scroll to the related section.
- **Expected result:** Related posts sharing the destination or tag are listed with working links.
- **Requirement coverage:** REQ-010, AC-010

## TC-011 — Non-admin users cannot access or write posts

- **Type:** Negative / Security
- **Preconditions:** A user is signed in with Google but is not on the admin allowlist.
- **Steps:**
  1. Open `/admin/journal`.
  2. Attempt a direct write to the `posts` collection from the browser console.
- **Expected result:** The admin editor is not accessible, and the direct write is rejected by Firestore rules with a permission error.
- **Requirement coverage:** REQ-011, AC-011

## TC-012 — Blog pages are responsive and keyboard accessible

- **Type:** Responsive / Accessibility
- **Preconditions:** The journal has published content.
- **Steps:**
  1. View the listing and an article at desktop and mobile viewport sizes.
  2. Use keyboard navigation to reach the language switch, filters, and share buttons.
- **Expected result:** Content reflows without horizontal overflow, focus is visible, and all controls are operable by keyboard.
- **Requirement coverage:** REQ-012, AC-012

## Playwright CLI execution notes

- Use the project-local Playwright CLI and the OpenCode `playwright-cli` skill; do not create or run a test script.
- Save evidence for every case under `test-results/evidence/` and record PASS/FAIL/BLOCKED below.
- Admin tests need a Google account that is on the admin allowlist; the signed-in account is never handled by the agent.

## Execution results

| Case | Result | Evidence |
| --- | --- | --- |
| TC-001 | PENDING — not implemented | — |
| TC-002 | PENDING — not implemented | — |
| TC-003 | PENDING — not implemented | — |
| TC-004 | PENDING — not implemented | — |
| TC-005 | PENDING — not implemented | — |
| TC-006 | PENDING — not implemented | — |
| TC-007 | PENDING — not implemented | — |
| TC-008 | PENDING — not implemented | — |
| TC-009 | PENDING — not implemented | — |
| TC-010 | PENDING — not implemented | — |
| TC-011 | PENDING — not implemented | — |
| TC-012 | PENDING — not implemented | — |
