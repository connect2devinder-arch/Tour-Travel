# Test Cases — India Travel Homepage and Destination Discovery

| Test case | Requirement / AC | Scenario | Priority |
| --- | --- | --- | --- |
| TC-001 | REQ-001 / AC-001 | Homepage hero renders with headline and CTA | High |
| TC-002 | REQ-002 / AC-002 | Popular destination cards show photos and names | High |
| TC-003 | REQ-003 / AC-003 | Featured packages show name, place, and price | High |
| TC-004 | REQ-004 / AC-004 | Plan CTA scrolls to the search form | High |
| TC-005 | REQ-005, REQ-006 / AC-005, AC-006 | Search and open a known destination | High |
| TC-006 | REQ-007 / AC-007 | Unknown destination shows no-results feedback | Medium |
| TC-007 | REQ-008 / AC-008 | Homepage and details are usable on a mobile viewport | High |
| TC-008 | REQ-008 / AC-008 | Keyboard and image accessibility checks | Medium |
| TC-009 | REQ-009 / AC-009 | React app starts and Vite production build succeeds | High |
| TC-010 | REQ-013 / AC-013 | Blank destination search returns all sample destinations | Medium |
| TC-011 | REQ-010 / AC-010 | Save and unsave a destination | Medium |
| TC-012 | REQ-011 / AC-011 | Select a destination gallery thumbnail | Medium |
| TC-013 | REQ-012 / AC-012 | Newsletter demo accepts a valid email | Medium |
| TC-014 | REQ-008 / AC-008 | Mobile navigation opens and closes | Medium |
| TC-015 | REQ-014 / AC-014 | Travel contact form validates and shows demo confirmation | High |
| TC-016 | REQ-015 / AC-015 | Google sign-in, user display, and sign-out | High |

## TC-001 — Homepage hero renders with headline and CTA

- **Type:** Positive
- **Preconditions:** Website is available.
- **Steps:**
  1. Open the homepage.
  2. Inspect the initial hero section.
- **Expected result:** A travel hero visual, headline/intro copy, and a visible “Plan your trip” call-to-action link are shown.
- **Requirement coverage:** REQ-001, AC-001

## TC-002 — Popular destination cards show photos and names

- **Type:** Positive
- **Preconditions:** Homepage sample content is available.
- **Steps:**
  1. Open the homepage.
  2. Navigate to the popular destinations section.
- **Expected result:** Destination cards are displayed with a destination name and photo. Initial samples include Shimla, Manali, Lahaul & Spiti, and Mussoorie.
- **Requirement coverage:** REQ-002, AC-002

## TC-003 — Featured packages show name, place, and price

- **Type:** Positive
- **Preconditions:** Homepage sample package content is available.
- **Steps:**
  1. Open the homepage.
  2. Navigate to the featured packages section.
  3. Inspect each displayed package card.
- **Expected result:** Every package card displays a package name, destination/place, duration, and illustrative price in INR (`₹`). Prices are sample content, not live quotes.
- **Requirement coverage:** REQ-003, AC-003

## TC-004 — Plan CTA scrolls to the search form

- **Type:** Positive
- **Preconditions:** Homepage and trip search form are available.
- **Steps:**
  1. Open the homepage.
  2. Activate “Plan your trip”.
- **Expected result:** The page scrolls to the trip search form and the form is visible/usable.
- **Requirement coverage:** REQ-004, AC-004

## TC-005 — Search and open a known destination

- **Type:** Positive
- **Preconditions:** At least one known sample destination exists in the search data.
- **Steps:**
  1. Navigate to the trip search form.
  2. Enter a known sample destination such as “Shimla” or “Lahaul & Spiti”.
  3. Submit the search.
  4. Select the matching destination result.
- **Expected result:** The matching destination result appears. Selecting it opens the inline destination detail section with photos, a short overview, top attractions, available packages, INR sample prices, duration, and itinerary.
- **Requirement coverage:** REQ-005, REQ-006, AC-005, AC-006

## TC-006 — Unknown destination shows no-results feedback

- **Type:** Negative
- **Preconditions:** Search form is available.
- **Steps:**
  1. Navigate to the trip search form.
  2. Enter a destination not present in the available sample data.
  3. Submit the search.
- **Expected result:** A clear no-results message appears with Indian sample destination suggestions (Shimla, Manali, Lahaul & Spiti, Mussoorie); the page remains usable and allows another search.
- **Requirement coverage:** REQ-007, AC-007

## TC-007 — Responsive layout on mobile

- **Type:** Boundary / Responsive
- **Preconditions:** A mobile-sized viewport or device is available.
- **Steps:**
  1. Open the homepage at a mobile viewport width.
  2. Inspect the hero, destination cards, package cards, search form, and detail view.
  3. Use the primary navigation and search form.
- **Expected result:** Content reflows for the narrow viewport, remains readable and operable, and does not require horizontal scrolling.
- **Requirement coverage:** REQ-008, AC-008

## TC-008 — Keyboard and image accessibility

- **Type:** Accessibility
- **Preconditions:** Homepage and at least one destination detail are available.
- **Steps:**
  1. Navigate the page using only the keyboard.
  2. Focus and activate the Plan CTA, search controls, and destination links/buttons.
  3. Inspect destination and package images for alternative text.
- **Expected result:** Interactive controls can be reached and operated using the keyboard, focus is visible, and meaningful images have descriptive alternative text.
- **Requirement coverage:** REQ-008, AC-008

## TC-009 — React app starts and Vite production build succeeds

- **Type:** Technical / Build
- **Preconditions:** Node.js and npm are installed and project dependencies are available.
- **Steps:**
  1. Run `npm run dev` and open the local URL printed by Vite.
  2. Confirm the React homepage renders and check the browser console for runtime errors.
  3. Run `npm run build`.
- **Expected result:** The homepage renders without a React runtime error and the Vite production build completes successfully.
- **Requirement coverage:** REQ-009, AC-009

## TC-010 — Blank destination search returns all sample destinations

- **Type:** Boundary
- **Preconditions:** Homepage and destination search form are available; mock data contains four destinations.
- **Steps:**
  1. Leave the destination field blank.
  2. Submit “Find a trip”.
- **Expected result:** Search results show Shimla, Manali, Lahaul & Spiti, and Mussoorie.
- **Requirement coverage:** REQ-013, AC-013

## TC-011 — Save and unsave a destination

- **Type:** Positive / Toggle
- **Preconditions:** A destination card is visible and initially unsaved.
- **Steps:**
  1. Locate Shimla’s save control.
  2. Activate it and inspect its accessible pressed state.
  3. Activate it again.
- **Expected result:** First activation marks Shimla saved (`aria-pressed=true`); second activation restores unsaved (`aria-pressed=false`). No sign-in is required for this local demo state.
- **Requirement coverage:** REQ-010, AC-010

## TC-012 — Select a destination gallery thumbnail

- **Type:** Positive
- **Preconditions:** Open any destination details that contain two gallery thumbnails.
- **Steps:**
  1. Record the main photo and selected thumbnail.
  2. Activate the second thumbnail.
- **Expected result:** Main photo changes to the second thumbnail’s image; the second thumbnail becomes selected (`aria-pressed=true`).
- **Requirement coverage:** REQ-011, AC-011

## TC-013 — Newsletter demo accepts a valid email

- **Type:** Positive
- **Preconditions:** Newsletter form is visible.
- **Steps:**
  1. Enter a syntactically valid email address.
  2. Submit “Count me in”.
- **Expected result:** Inline text says “Thanks! Newsletter sign-up is a demo for now.” and the email input is cleared. No real network subscription is expected.
- **Requirement coverage:** REQ-012, AC-012

## TC-014 — Mobile navigation opens and closes

- **Type:** Responsive / Interaction
- **Preconditions:** Browser viewport is set to a mobile width where the menu toggle is visible.
- **Steps:**
  1. Activate the menu toggle.
  2. Inspect `aria-expanded` and the navigation links.
  3. Choose a navigation link.
- **Expected result:** Menu opens with `aria-expanded=true`; selecting a link closes it and restores `aria-expanded=false`.
- **Requirement coverage:** REQ-008, AC-008

## TC-015 — Travel contact form validates and shows demo confirmation

- **Type:** Positive / Form validation
- **Preconditions:** Contact form is visible and Firestore security rules are deployed.
- **Steps:**
  1. Enter a name, valid email, phone number, and select a destination.
  2. Optionally choose a travel date, traveller count, and enter a message.
  3. Submit “Send trip enquiry”.
- **Expected result:** A document is created in `contactEnquiries`, an inline saved confirmation appears, and the form resets. If the Firestore write fails, an error appears and entered fields remain.
- **Requirement coverage:** REQ-014, AC-014

## TC-016 — Google sign-in, user display, and sign-out

- **Type:** Authentication / Positive
- **Preconditions:** Firebase Web App is registered; Google provider is enabled; test domain is authorized; a test Google account is available.
- **Steps:**
  1. Open the homepage while signed out.
  2. Activate “Sign in with Google” and complete the Google account prompt.
  3. Verify the account identity in the header.
  4. Activate “Sign out”.
- **Expected result:** User signs in, their display name/email appears, and sign-out restores the Google sign-in button. No password is collected by the website.
- **Requirement coverage:** REQ-015, AC-015

## Playwright CLI automation notes

- Executed manually with Playwright CLI `0.1.22` on 2026-10-20. No test script was created or run.
- Start the app with `npm run dev`; use the local URL printed by Vite (normally `http://localhost:5173`).
- The project-local CLI can be started with `node .\node_modules\@playwright\cli\playwright-cli.js open http://localhost:5173`; use its `snapshot` command before interacting.
- Test data lives in `src/mockData.js`. Current destination names and prices are fixtures and may change during iteration.
- When automating with the `playwright-cli` OpenCode skill, take a fresh snapshot before using element refs. Prefer accessible names/roles, and do not reuse stale refs after navigation or a new snapshot.
- Newsletter submission is still a front-end demo; contact enquiries write to the `contactEnquiries` Firestore collection.

## Execution results and evidence

TC-001 through TC-014 passed in the earlier mock-data run. TC-015 passed with a live Firestore write; its synthetic smoke-test document was deleted after verification. The user confirmed the live Google sign-in/sign-out flow for TC-016; the agent verified that the deployed button opens Google Accounts without handling account credentials.

| Case | Result | Evidence |
| --- | --- | --- |
| TC-001 | PASS | [Homepage hero](../../test-results/evidence/TC-001-homepage-hero.png) |
| TC-002 | PASS | [Destination cards](../../test-results/evidence/TC-002-destinations.png) |
| TC-003 | PASS | [Featured packages](../../test-results/evidence/TC-003-featured-packages.png) |
| TC-004 | PASS | [Plan CTA/search form](../../test-results/evidence/TC-004-plan-cta.png) |
| TC-005 | PASS | [Search and destination details](../../test-results/evidence/TC-005-known-destination-details.png) |
| TC-006 | PASS | [No-results state](../../test-results/evidence/TC-006-no-results.png) |
| TC-007 | PASS — mobile visual and 390px layout-box review | [Mobile homepage](../../test-results/evidence/TC-007-mobile-home.png), [mobile details](../../test-results/evidence/TC-007-mobile-details.png), [layout snapshot](../../test-results/evidence/TC-007-responsive-layout-boxes.yml) |
| TC-008 | PASS — keyboard skip link/menu and accessible image names checked | [Keyboard focus](../../test-results/evidence/TC-008-keyboard-focus.png), [keyboard menu](../../test-results/evidence/TC-008-keyboard-menu-open.png), [keyboard navigation](../../test-results/evidence/TC-008-keyboard-navigation.png), [accessibility snapshot](../../test-results/evidence/TC-008-accessibility-snapshot.yml) |
| TC-009 | PASS — React page rendered with 0 console errors; Vite build succeeded | [Rendered page](../../test-results/evidence/TC-009-react-homepage.png), [build output](../../test-results/evidence/TC-009-build.log) |
| TC-010 | PASS | [Blank search returns all four destinations](../../test-results/evidence/TC-010-empty-search.png) |
| TC-011 | PASS — `aria-pressed` toggled true then false | [Saved](../../test-results/evidence/TC-011-saved.png), [unsaved](../../test-results/evidence/TC-011-unsaved.png) |
| TC-012 | PASS — second gallery image selected | [Gallery state](../../test-results/evidence/TC-012-gallery-thumbnail.png) |
| TC-013 | PASS — demo confirmation shown after valid email | [Newsletter confirmation](../../test-results/evidence/TC-013-newsletter-demo.png) |
| TC-014 | PASS — menu expanded, then collapsed after navigation | [Menu open](../../test-results/evidence/TC-014-menu-open.png), [menu closed](../../test-results/evidence/TC-014-menu-closed.png) |
| TC-015 | PASS — Firestore create succeeded, confirmation shown, form reset; synthetic test document deleted | [Firestore write confirmation](../../test-results/evidence/TC-015-contact-firestore-success.png), [mobile form](../../test-results/evidence/TC-015-contact-form-mobile.png) |
| TC-016 | PASS — live sign-in/sign-out confirmed by user; Google Accounts prompt independently verified | [Google sign-in prompt](../../test-results/evidence/TC-016-google-signin-prompt.png); final account step user-confirmed |

The sample prices, itinerary, destination content, and newsletter response are mock data/demo behavior; these results do not verify live inventory, booking, or email delivery.
