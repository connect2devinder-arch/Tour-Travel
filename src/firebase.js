import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = Object.values(firebaseConfig).every((value) => typeof value === "string" && value.length > 0);
const firebaseAppInstance = isConfigured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;

export const firebaseConfigured = isConfigured;
export const firebaseApp = firebaseAppInstance;
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function saveContactEnquiry(enquiry) {
  if (!firebaseApp) throw new Error("Firebase is not configured for this build.");

  const { addDoc, collection, getFirestore, serverTimestamp } = await import("firebase/firestore");
  const db = getFirestore(firebaseApp);
  const created = await addDoc(collection(db, "contactEnquiries"), {
    ...enquiry,
    createdAt: serverTimestamp(),
  });
  return created.id;
}
