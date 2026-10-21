# Test Cases — Enquiry Email and Enquiry Notification

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / AC-001 | Submitting an enquiry saves it and queues an email notification for the team | High |
| TC-002 | REQ-003 / AC-002 | Contact section shows the enquiry email with a mailto link | High |
| TC-003 | REQ-004 / AC-003 | Footer shows the enquiry email | Medium |
| TC-004 | REQ-006 / AC-004 | The enquiry notification body carries the full enquiry | High |
| TC-005 | REQ-007 / AC-005 | Success message names the enquiry email | Medium |
| TC-006 | REQ-008 / AC-006 | Booking and enquiry notifications share the collection but differ by targetType | Medium |

## TC-001 — Submitting an enquiry queues an email notification
- **Type:** Positive
- **Preconditions:** Firebase is configured.
- **Steps:**
  1. Fill the contact form with a name, email, phone, destination and message.
  2. Submit the form.
- **Expected result:** An enquiry document is written to `contactEnquiries`, and a notification document is written with `trigger: "enquiry_received"`, `channel: "email"`, `recipient: "connect2devinder@gmail.com"`, `status: "queued"` and `targetType: "enquiry"`.
- **Requirement coverage:** REQ-001, REQ-005, AC-001

## TC-002 — Contact section shows the enquiry email
- **Type:** Positive
- **Preconditions:** Homepage is open.
- **Steps:**
  1. Scroll to the contact section.
  2. Read the contact detail cards.
- **Expected result:** A card labelled "Email us" shows `connect2devinder@gmail.com` and links to `mailto:connect2devinder@gmail.com`.
- **Requirement coverage:** REQ-003, AC-002

## TC-003 — Footer shows the enquiry email
- **Type:** Positive
- **Preconditions:** Homepage is open.
- **Steps:**
  1. Scroll to the footer.
- **Expected result:** The enquiry email appears as a mailto link next to the phone number.
- **Requirement coverage:** REQ-004, AC-003

## TC-004 — Enquiry notification body carries the full enquiry
- **Type:** Positive
- **Preconditions:** An enquiry notification exists.
- **Steps:**
  1. Open the admin notifications panel and read the enquiry entry.
- **Expected result:** The body contains the guest name, email, phone, destination, tour package, preferred travel date, number of travellers and the message.
- **Requirement coverage:** REQ-006, AC-004

## TC-005 — Success message names the enquiry email
- **Type:** Positive
- **Preconditions:** The contact form has been submitted successfully.
- **Steps:**
  1. Read the status line under the form.
- **Expected result:** The message reads "Thanks! Your enquiry has been sent to connect2devinder@gmail.com."
- **Requirement coverage:** REQ-007, AC-005

## TC-006 — Booking and enquiry notifications differ by target type
- **Type:** Alternate
- **Preconditions:** One booking notification and one enquiry notification exist.
- **Steps:**
  1. Open the admin notifications panel.
  2. Compare the two entries.
- **Expected result:** The booking entry keeps `targetType: "booking"` with its `ELW-…` reference; the enquiry entry shows `targetType: "enquiry"` and is labelled "Contact form" instead of a booking reference.
- **Requirement coverage:** REQ-008, AC-006
