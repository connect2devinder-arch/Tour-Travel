# Android Play Store App — Trusted Web Activity (TWA)

## Chosen approach

Use **Trusted Web Activity** to package the existing HTTPS site as an Android app. This reuses the React/Vite website, Firebase Google sign-in and Razorpay web checkout instead of rewriting the UI in Android/React Native.

- Website origin: `https://tour-83b6c.web.app`
- Android package ID (chosen before publication): `com.elsewheretravel.app`
- Bubblewrap configuration: `twa-manifest.json`
- Web app manifest: `public/manifest.webmanifest`
- Service worker: `public/sw.js`
- Offline fallback: `public/offline.html`
- App icons: `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`

## What's already prepared

1. PWA manifest with standalone display, app name, theme colors and three icon sizes/purposes.
2. Service worker for the app shell and an offline fallback. Firebase APIs, Storage and Razorpay stay network-only.
3. TWA manifest points to the live domain and uses package ID `com.elsewheretravel.app`.
4. Firebase Hosting serves the app on HTTPS, which TWA requires.

## What is still required to produce a Play Store AAB

This workspace does not have Java/Android SDK or the Play signing certificate, so it cannot produce a final signed Android App Bundle yet.

1. Install **JDK 17+**, Android Studio/Android SDK and Node.js on a machine that will build the Android app.
2. Install Bubblewrap CLI: `npm install -g @bubblewrap/cli`.
3. From the repo root, initialize/check the TWA from the existing manifest: `bubblewrap init --manifest https://tour-83b6c.web.app/manifest.webmanifest`. Keep package ID `com.elsewheretravel.app` and review the generated Android project.
4. Generate or select the Android **upload keystore** and store it securely. Never commit the keystore or passwords to Git.
5. Build the signed AAB with Bubblewrap (`bubblewrap build`) and upload it to a Google Play Console **Internal testing** track.
6. In Play Console, enable Play App Signing and copy the **App signing certificate SHA-256 fingerprint** (not just the upload-key fingerprint).
7. Create `public/.well-known/assetlinks.json` using the fingerprint and package ID, then deploy Hosting. The JSON shape is:

   ```json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "android_app",
       "package_name": "com.elsewheretravel.app",
       "sha256_cert_fingerprints": ["PLAY_APP_SIGNING_SHA256"]
     }
   }]
   ```

8. Verify the TWA opens without the browser address bar and test Google sign-in, destination/package routes, booking checkout, payment return, back navigation and offline fallback on a physical Android device.
9. Complete Play Console listing, screenshots, privacy policy URL, Data Safety declaration, content rating, target API requirement and support contact.

## Payment and policy launch gate

Razorpay is currently integrated in **Test Mode**. Test Mode must never be used to collect real payments. Before public Play Store launch, the owner must complete Razorpay KYC, configure Live API keys in Firebase Secret Manager, review the refund/cancellation policy and test live webhooks. Travel bookings are real-world services; confirm the current Play policy treatment for the payment flow during Play Console review.

The site currently stores newsletter sign-ups and queues booking/enquiry notification records, but does not send marketing emails, booking emails or SMS. Do not describe those messages as delivered until a provider is connected.

## Important irreversible decision

The package ID is `com.elsewheretravel.app`. Keep it unchanged after the first Play Store upload; changing it creates a different Android app listing.
