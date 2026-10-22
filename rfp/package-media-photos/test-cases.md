# Test Cases — Per-Package Photo Sets (package_media)

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / REQ-002 | A package with its own photos shows them in the gallery | High |
| TC-002 | REQ-003 / AC-002 | A package without photos falls back to the destination gallery | High |
| TC-003 | REQ-004 / AC-003 | Admin picker adds and removes destination images | Medium |
| TC-004 | REQ-005 / AC-004 | Admin uploads a new package photo | Medium |
| TC-005 | REQ-006 / AC-005 | Admin adds a photo by URL with alt text | Medium |
| TC-006 | REQ-008 / AC-006 | Admin package list shows the photo count | Low |
| TC-007 | REQ-009 / AC-007 | Package photo URLs are publicly readable, writes are admin-only | Medium |

## TC-001 — A package with its own photos shows them in the gallery
- **Type:** Positive
- **Preconditions:** The Manali package has its own photo set.
- **Steps:**
  1. Open `/packages/manali-valley`.
  2. Read the large photo and the counter.
  3. Click the next arrow.
- **Expected result:** The first photo is `destinations/manali/mall-road.jpg` with the counter "1 of 5 photos"; the next arrow swaps to `hadimba-temple.jpg` and the counter to "2 of 5 photos".
- **Requirement coverage:** REQ-001, REQ-002, AC-001

## TC-002 — A package without photos falls back to the destination gallery
- **Type:** Alternate
- **Preconditions:** The Shimla package has no photo set of its own.
- **Steps:**
  1. Open `/packages/shimla-escape`.
- **Expected result:** The gallery shows the destination gallery photos (`destinations/shimla/1.jpg` first) with five dots — the gallery is never empty.
- **Requirement coverage:** REQ-003, AC-002

## TC-003 — Admin picker adds and removes destination images
- **Type:** Positive
- **Preconditions:** An admin is signed in and a package is open in the editor.
- **Steps:**
  1. Pick the destination.
  2. Click an image in the "destination images" picker.
  3. Click the same image again.
- **Expected result:** Step 2 adds the photo to the package photo list (picker tile marked selected); step 3 removes it again.
- **Requirement coverage:** REQ-004, AC-003

## TC-004 — Admin uploads a new package photo
- **Type:** Positive
- **Preconditions:** An admin is signed in; the package editor is open.
- **Steps:**
  1. Choose an image file in "Upload a photo".
  2. Wait for the upload to finish.
- **Expected result:** A success message is shown, the photo appears in the package photo list, and the file is stored under `packages/<packageId>/…` in Firebase Storage.
- **Requirement coverage:** REQ-005, AC-004

## TC-005 — Admin adds a photo by URL with alt text
- **Type:** Positive
- **Preconditions:** An admin is signed in; the package editor is open.
- **Steps:**
  1. Paste an image URL and click "Add photo".
  2. Type alt text for the new photo.
  3. Save the package.
- **Expected result:** The photo is listed with the alt text, and the saved package document contains it in its `photos` array.
- **Requirement coverage:** REQ-006, REQ-007, AC-005

## TC-006 — Admin package list shows the photo count
- **Type:** Positive
- **Preconditions:** At least one package exists.
- **Steps:**
  1. Open `/admin/packages`.
- **Expected result:** Each package row shows its photo count (for example "5 photos").
- **Requirement coverage:** REQ-008, AC-006

## TC-007 — Package photos are public, writes are admin-only
- **Type:** Negative
- **Preconditions:** A package photo exists in Storage.
- **Steps:**
  1. Open the photo URL in a browser without signing in.
  2. Attempt an upload to `packages/` without admin rights.
- **Expected result:** Step 1 returns the image; step 2 is denied by the Storage rules.
- **Requirement coverage:** REQ-009, AC-007
