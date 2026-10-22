# Test Cases — Admin Access and the Blog "Write" Option

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / AC-001 | Project auth setup is correct | High |
| TC-002 | REQ-002 / AC-002 | Signed-in admin sees the Write link | High |
| TC-003 | REQ-003 / AC-003 | Footer link adapts to admin/guest | Medium |
| TC-004 | REQ-005 / AC-004 | Admin gate names the account to use | High |
| TC-005 | REQ-006 / AC-005 | Signed-in non-admin gets a clear message | Medium |
| TC-006 | REQ-001 / AC-006 | Real token: allowlist read is 200 for admin, 403 otherwise | High |
| TC-007 | REQ-004 | Admin detection survives an allowlist read failure | Medium |

## TC-001 — Project auth setup is correct
- **Type:** Positive
- **Preconditions:** None.
- **Steps:**
  1. Read the `config/admins` document.
  2. Read the Identity Platform config.
- **Expected result:** The allowlist contains `connect2devinder@gmail.com`; `tour-83b6c.web.app` is an authorized domain; the Google provider is enabled.
- **Requirement coverage:** REQ-001, REQ-008, AC-001

## TC-002 — Signed-in admin sees the Write link
- **Type:** Positive
- **Preconditions:** Signed in with `connect2devinder@gmail.com`.
- **Steps:**
  1. Open the homepage.
  2. Read the header actions.
- **Expected result:** A "Write" link pointing to `/admin/journal` is visible next to the signed-in user.
- **Requirement coverage:** REQ-002, REQ-004, AC-002

## TC-003 — Footer link adapts to admin/guest
- **Type:** Alternate
- **Preconditions:** One signed-out visitor and one signed-in admin.
- **Steps:**
  1. Read the footer "Company" column as a guest.
  2. Read it as the admin.
- **Expected result:** The guest sees "Admin" (pointing to `/admin`); the admin sees "Write" (pointing to `/admin/journal`).
- **Requirement coverage:** REQ-003, AC-003

## TC-004 — Admin gate names the account to use
- **Type:** Positive
- **Preconditions:** Signed out.
- **Steps:**
  1. Open `/admin`.
- **Expected result:** The page shows "Sign in to manage the site." and states that the Google account `connect2devinder@gmail.com` should be used.
- **Requirement coverage:** REQ-005, AC-004

## TC-005 — Signed-in non-admin gets a clear message
- **Type:** Negative
- **Preconditions:** Signed in with an account that is not on the allowlist.
- **Steps:**
  1. Open `/admin`.
- **Expected result:** The page shows the signed-in email and states that admin access is limited to `connect2devinder@gmail.com`, with a sign-out option.
- **Requirement coverage:** REQ-006, AC-005

## TC-006 — Real token: allowlist read is 200 for admin, 403 otherwise
- **Type:** Positive / Negative
- **Preconditions:** A signed-in account whose email is on the allowlist.
- **Steps:**
  1. Read `config/admins` with that account's ID token.
  2. Read it with a token for an account that is not on the allowlist, and with no token at all.
- **Expected result:** Step 1 returns 200; steps 2 and 3 return 403 — the allowlist stays protected while admins can read it.
- **Requirement coverage:** REQ-001, AC-006

## TC-007 — Admin detection survives an allowlist read failure
- **Type:** Negative
- **Preconditions:** The `config/admins` document cannot be read (transient error or rules denial).
- **Steps:**
  1. Sign in with `connect2devinder@gmail.com`.
  2. Check whether the admin UI is unlocked.
- **Expected result:** The owner account is still treated as an admin, so the "Write" link and the admin pages work; other accounts are not.
- **Requirement coverage:** REQ-004, AC-002
