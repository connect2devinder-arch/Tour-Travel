import { firebaseApp } from "./firebase.js";

async function firestore() {
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(firebaseApp);
}

/** Adds a subscriber to the newsletter list. */
export async function subscribeToNewsletter(email, source = "website") {
  if (!firebaseApp) throw new Error("Firebase is not configured for this build.");
  const db = await firestore();
  const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");

  const key = String(email ?? "").trim().toLowerCase();
  if (!key) throw new Error("An email address is required.");

  const created = await addDoc(collection(db, "newsletter"), {
    email: key,
    source: String(source || "website").slice(0, 60),
    status: "subscribed",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

/** All subscribers, newest first. Admin only (Firestore rules enforce it). */
export async function listSubscribers() {
  if (!firebaseApp) return [];
  const db = await firestore();
  const { collection, getDocs, query } = await import("firebase/firestore");
  const snapshot = await getDocs(query(collection(db, "newsletter")));
  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      email: doc.data().email ?? "",
      source: doc.data().source ?? "website",
      status: doc.data().status ?? "subscribed",
      createdAt: doc.data().createdAt ?? null,
    }))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}
