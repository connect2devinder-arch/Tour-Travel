# Test Cases — Community Blogging (Users Can Write Too)

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / AC-001 | Signed-in user sees their posts and a New post action | High |
| TC-002 | REQ-002 / AC-001 | Guest sees the sign-in wall on /write | High |
| TC-003 | REQ-004 / AC-002 | Author may create draft/pending but never published | High |
| TC-004 | REQ-006 / AC-003 | A pending post is visible to its author only | High |
| TC-005 | REQ-006 / AC-004 | Only the author (or an admin) may edit or delete a post | High |
| TC-006 | REQ-007 / AC-005 | Editing a live post sends it back to review | High |
| TC-007 | REQ-008 / AC-006 | Admin review queue approves a post | High |
| TC-008 | REQ-009 / AC-006 | Admin can request changes with a note | Medium |
| TC-009 | REQ-010 / AC-007 | Author sees the review note | Medium |
| TC-010 | REQ-011 / AC-008 | Approved post appears publicly with the author name | Medium |
| TC-011 | REQ-012 | Signed-in user gets a Write link in header and footer | Medium |
| TC-012 | REQ-014 / AC-009 | Non-admin cannot reach packages/bookings admin pages | High |

## TC-001 — Signed-in user sees their posts and a New post action
- **Type:** Positive
- **Preconditions:** Signed in with a non-admin Google account.
- **Steps:**
  1. Open `/write`.
- **Expected result:** "Your stories." heading, a "+ New post" action, and every post of that author listed with its status (Draft / In review / Live / Changes requested).
- **Requirement coverage:** REQ-001, REQ-003, AC-001

## TC-002 — Guest sees the sign-in wall on /write
- **Type:** Negative
- **Preconditions:** Signed out.
- **Steps:**
  1. Open `/write` and then `/write/new`.
- **Expected result:** Both show "Sign in to write." with a "Sign in with Google" button and no editor fields.
- **Requirement coverage:** REQ-002, AC-001

## TC-003 — Author may create draft/pending but never published
- **Type:** Negative
- **Preconditions:** Signed in as a community author.
- **Steps:**
  1. Create a post with `status: "pending"` (through the editor, or a direct SDK write).
  2. Attempt the same create with `status: "published"`.
- **Expected result:** Step 1 succeeds; step 2 is denied by the Firestore rules (permission error), and the post never appears publicly.
- **Requirement coverage:** REQ-004, REQ-013, AC-002

## TC-004 — A pending post is visible to its author only
- **Type:** Negative
- **Preconditions:** Author A has a pending post.
- **Steps:**
  1. Read the post as author A.
  2. Read it as another signed-in user.
  3. Read it without signing in.
- **Expected result:** Step 1 succeeds; steps 2 and 3 are denied. A published post from the same author stays readable by everyone.
- **Requirement coverage:** REQ-006, REQ-013, AC-003

## TC-005 — Only the author (or an admin) may edit or delete a post
- **Type:** Negative
- **Preconditions:** Author A has a pending post.
- **Steps:**
  1. Edit the post as author A.
  2. Edit the post as user B.
  3. Delete the post as user B.
  4. Delete the post as author A.
- **Expected result:** Step 1 and step 4 succeed; steps 2 and 3 are denied.
- **Requirement coverage:** REQ-006, REQ-013, AC-004

## TC-006 — Editing a live post sends it back to review
- **Type:** Positive
- **Preconditions:** An approved (published) post by author A.
- **Steps:**
  1. As author A, edit the post and save.
- **Expected result:** The write succeeds and the post status becomes `pending` again — it does not stay live, and the change needs a new admin approval.
- **Requirement coverage:** REQ-007, AC-005

## TC-007 — Admin review queue approves a post
- **Type:** Positive
- **Preconditions:** A community post is pending; an admin is signed in.
- **Steps:**
  1. Open `/admin/journal`.
  2. Click "Approve & publish" on the pending post.
- **Expected result:** The post leaves the review queue, its status becomes `published`, and it is readable without signing in.
- **Requirement coverage:** REQ-008, REQ-009, AC-006

## TC-008 — Admin can request changes with a note
- **Type:** Alternate
- **Preconditions:** A community post is pending; an admin is signed in.
- **Steps:**
  1. Click "Request changes", type a note, submit.
- **Expected result:** The post status becomes `rejected` and the note is stored on the post.
- **Requirement coverage:** REQ-009, AC-006

## TC-009 — Author sees the review note
- **Type:** Positive
- **Preconditions:** A post was rejected with a note.
- **Steps:**
  1. Open `/write` as the author.
- **Expected result:** The post shows the "Changes requested" status and the admin's note.
- **Requirement coverage:** REQ-010, AC-007

## TC-010 — Approved post appears publicly with the author name
- **Type:** Positive
- **Preconditions:** A community post was approved.
- **Steps:**
  1. Open `/journal`.
- **Expected result:** The post appears in the listing with "by <author name>" in the card meta, and its article page opens.
- **Requirement coverage:** REQ-011, AC-008

## TC-011 — Signed-in user gets a Write link in header and footer
- **Type:** Positive
- **Preconditions:** Signed in as a non-admin.
- **Steps:**
  1. Read the header actions and the footer "Company" column.
- **Expected result:** Both show a "Write" link pointing at `/write`.
- **Requirement coverage:** REQ-012

## TC-012 — Non-admin cannot reach packages/bookings admin pages
- **Type:** Negative
- **Preconditions:** Signed in as a non-admin.
- **Steps:**
  1. Open `/admin/packages`.
  2. Open `/admin/bookings`.
- **Expected result:** Both show the admin gate (the editor/booking data is never loaded for a non-admin).
- **Requirement coverage:** REQ-014, AC-009
