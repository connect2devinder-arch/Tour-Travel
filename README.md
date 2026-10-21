# Elsewhere Travel

A responsive India-focused travel discovery website built with React and Vite. Sample destinations include Shimla, Manali, Lahaul & Spiti, and Mussoorie. Edit `src/mockData.js` to change the mock destinations and packages.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Use `npm run build` to create a production build.

Destination/package details, INR prices, and the newsletter are sample/demo content. Trip enquiries are saved to the `contactEnquiries` Firestore collection; email notifications/admin dashboard, bookings, live availability, and newsletter delivery are not configured.

## Tour packages

Package cards show duration, itinerary summary, inclusions, and a "Starting from" price. "View details" opens a shareable route such as `/packages/shimla-escape` with a day-by-day plan, inclusions, hotel/transport details, photos, and FAQs. "Enquire about this trip" opens the contact form with that package preselected, and the enquiry stores the package ID/name in Firestore.

## Destination images

Each destination has 5 drone/aerial photos sourced from Unsplash and stored in Firebase Storage under `destinations/<place>/<n>.jpg` (bucket `tour-83b6c.firebasestorage.app`). The destination cards, destination galleries, and package detail galleries all load these images. Objects are public-read so the browser can load them directly.

## Destination place carousels

Each destination detail section shows a carousel of its famous tourist places with back/forward arrows and dot indicators. Every slide shows the place name as a caption. Place photos are stored under `destinations/<place>/<name>.jpg` in Firebase Storage:
- Shimla: Mall Road, The Ridge, Jakhu Temple, Naldehra, Kufri
- Manali: Mall Road, Hadimba Temple, Solang Valley, Old Manali, Vashisht Hot Springs
- Lahaul & Spiti: Key Monastery, Dhankar Monastery, Chandratal Lake, Kibber Village, Tabo Monastery
- Mussoorie: Mall Road, Gun Hill, Kempty Falls, Lal Tibba, Company Garden

## Playwright CLI

The project includes `@playwright/cli` and an OpenCode skill at `.opencode/skills/playwright-cli/`.

```powershell
node .\node_modules\@playwright\cli\playwright-cli.js --help
node .\node_modules\@playwright\cli\playwright-cli.js open http://localhost:5173
```

CLI snapshots and logs are written to `.playwright-cli/` (git-ignored).

## Google sign-in

This app uses the Firebase Web SDK. Local Firebase web configuration is kept in ignored `.env.local`; copy `.env.example` and supply the Firebase Web App values when setting up another checkout.

Google sign-in is enabled for the deployed Firebase project. The live flow has been verified to open Google's account sign-in page. For local testing, ensure `localhost` is listed under Firebase Console → Authentication → Settings → Authorized domains.

## Contact details

Phone number and office address live in one place: `src/siteConfig.js`. Change them there and the contact section and footer both update.
