# Test Cases — Dharamshala, Chamba and Palampur Destinations

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / AC-001 | New destination cards and links appear | High |
| TC-002 | REQ-002, REQ-003 / AC-002 | Each package route renders its details and own gallery | High |
| TC-003 | REQ-004 / AC-003 | Gallery controls and place-carousel links work | High |
| TC-004 | REQ-005, REQ-007 / AC-004 | Enquiry accepts each new destination | High |
| TC-005 | REQ-005 / AC-005 | Blog/admin destination selectors include new places | Medium |
| TC-006 | REQ-006 / AC-006 | Server-side test order prices are correct | High |
| TC-007 | REQ-008 / AC-007 | New Storage photos are publicly accessible | High |
| TC-008 | REQ-009 / AC-008 | Image credits page includes the new assets | Medium |

## TC-001 — New destination cards and links appear
- **Type:** Positive
- **Preconditions:** Homepage is loaded.
- **Steps:**
  1. Scroll to the Destinations section.
  2. Locate Dharamshala, Chamba and Palampur.
  3. Click each card image or Explore link.
- **Expected result:** All three cards display an image and route to `/packages/dharamshala-retreat`, `/packages/chamba-heritage-escape` and `/packages/palampur-tea-trail` respectively.
- **Requirement coverage:** REQ-001, AC-001

## TC-002 — Each package route renders its details and own gallery
- **Type:** Positive
- **Preconditions:** None.
- **Steps:**
  1. Open each of the three package URLs.
  2. Read the title, price, duration and gallery counter.
- **Expected result:** Each URL shows the matching package content, sample price, itinerary and "1 of 5 photos" gallery; the photo is from that destination's Storage folder.
- **Requirement coverage:** REQ-002, REQ-003, AC-002

## TC-003 — Gallery controls and place-carousel links work
- **Type:** Positive
- **Preconditions:** One new package detail page is open.
- **Steps:**
  1. Click Next and Previous on the package gallery.
  2. Click "See the places in <destination>".
- **Expected result:** The photo counter/dots update and wrap correctly; the place link opens `/?destination=<id>#destinations` with the corresponding place carousel.
- **Requirement coverage:** REQ-004, AC-003

## TC-004 — Enquiry accepts each new destination
- **Type:** Positive / Firestore integration
- **Preconditions:** Firestore rules are deployed and Firebase is configured.
- **Steps:**
  1. Open the homepage contact form.
  2. Submit a valid enquiry for Dharamshala, Chamba and Palampur in separate submissions.
- **Expected result:** Each enquiry saves successfully to `contactEnquiries` with the selected destination ID and queues its team notification.
- **Requirement coverage:** REQ-005, REQ-007, AC-004

## TC-005 — Blog/admin destination selectors include new places
- **Type:** Positive
- **Preconditions:** Admin or writer editor is open.
- **Steps:**
  1. Open the blog destination selector.
  2. Open `/admin/packages/new` and open the package destination selector.
- **Expected result:** Both selectors list Dharamshala, Chamba and Palampur.
- **Requirement coverage:** REQ-005, AC-005

## TC-006 — Server-side test order prices are correct
- **Type:** Positive / Security
- **Preconditions:** Razorpay Test Mode Cloud Functions are deployed.
- **Steps:**
  1. Create a test order for each new package with 2 travellers.
- **Expected result:** Function order amounts are Dharamshala ₹37,998 (3,799,800 paise), Chamba ₹49,998 (4,999,800 paise), Palampur ₹35,998 (3,599,800 paise), regardless of any client amount.
- **Requirement coverage:** REQ-006, AC-006

## TC-007 — New Storage photos are publicly accessible
- **Type:** Positive
- **Preconditions:** New image files exist in Storage.
- **Steps:**
  1. Open each destination's package image URL while signed out.
- **Expected result:** Each URL returns an image successfully.
- **Requirement coverage:** REQ-008, AC-007

## TC-008 — Image credits page includes the new assets
- **Type:** Positive
- **Preconditions:** Homepage is loaded.
- **Steps:**
  1. Open the footer's Image credits link.
  2. Inspect each new destination group.
- **Expected result:** Each image is listed with its title, author, license, and original source link.
- **Requirement coverage:** REQ-009, AC-008
