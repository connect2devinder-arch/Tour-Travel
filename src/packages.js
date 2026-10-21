import { firebaseApp } from "./firebase.js";
import { slugify } from "./blog.js";

export const PACKAGE_STATUSES = ["draft", "published"];

async function firestore() {
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(firebaseApp);
}

/** Turns a display price such as "₹15,999*" into the number 15999. */
export function parsePrice(value) {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  const amount = Number(digits);
  return Number.isFinite(amount) ? amount : 0;
}

function toStringList(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

function normalise(pkg, id) {
  const priceLabel = pkg.priceLabel ?? pkg.price ?? "";
  const priceAmount = Number(pkg.priceAmount ?? parsePrice(priceLabel));
  return {
    id,
    name: pkg.name ?? "",
    slug: pkg.slug ?? "",
    destinationId: pkg.destinationId ?? "",
    price: priceLabel,
    priceLabel,
    priceAmount: Number.isFinite(priceAmount) ? priceAmount : 0,
    duration: pkg.duration ?? "",
    summary: pkg.summary ?? "",
    itinerary: toStringList(pkg.itinerary),
    inclusions: toStringList(pkg.inclusions),
    hotel: {
      category: pkg.hotel?.category ?? "",
      nights: pkg.hotel?.nights ?? "",
      details: pkg.hotel?.details ?? "",
    },
    transport: {
      mode: pkg.transport?.mode ?? "",
      details: pkg.transport?.details ?? "",
    },
    faqs: Array.isArray(pkg.faqs)
      ? pkg.faqs
        .filter((faq) => faq && (faq.question || faq.answer))
        .map((faq) => ({ question: faq.question ?? "", answer: faq.answer ?? "" }))
      : [],
    status: pkg.status === "published" ? "published" : "draft",
    featured: Boolean(pkg.featured),
    position: Number(pkg.position ?? 0) || 0,
    createdAt: pkg.createdAt ?? null,
    updatedAt: pkg.updatedAt ?? null,
  };
}

/**
 * Replaces the bundled sample packages with the published packages from Firestore.
 * A destination without published packages keeps its sample packages, so the
 * public site never renders an empty section.
 */
export function mergePackagesIntoDestinations(baseDestinations, managedPackages = []) {
  return baseDestinations.map((destination) => {
    const managed = managedPackages
      .filter((pkg) => pkg.destinationId === destination.id && pkg.status === "published")
      .sort((a, b) => (a.position - b.position) || a.name.localeCompare(b.name));
    const sample = (destination.packages ?? []).map((pkg) => ({
      ...pkg,
      priceAmount: Number(pkg.priceAmount ?? parsePrice(pkg.price)),
    }));
    return { ...destination, packages: managed.length ? managed : sample };
  });
}

/** Finds a package (managed or sample) and the destination it belongs to. */
export function findPackageById(destinations, packageId) {
  for (const destination of destinations) {
    const match = (destination.packages ?? []).find((pkg) => pkg.id === packageId);
    if (match) return { package: match, destination };
  }
  return null;
}

/** Published packages for the public site. Public reads must filter on status. */
export async function listPublishedPackages() {
  if (!firebaseApp) return [];
  const db = await firestore();
  const { collection, getDocs, query, where } = await import("firebase/firestore");
  try {
    const snapshot = await getDocs(query(collection(db, "packages"), where("status", "==", "published")));
    return snapshot.docs.map((doc) => normalise(doc.data(), doc.id));
  } catch {
    return [];
  }
}

/** Every package for the signed-in admin, drafts included. */
export async function listAllPackagesForAdmin() {
  if (!firebaseApp) return [];
  const db = await firestore();
  const { collection, getDocs, query } = await import("firebase/firestore");
  const snapshot = await getDocs(query(collection(db, "packages")));
  return snapshot.docs
    .map((doc) => normalise(doc.data(), doc.id))
    .sort((a, b) => (b.updatedAt?.seconds ?? 0) - (a.updatedAt?.seconds ?? 0));
}

export async function getPackageById(id) {
  if (!firebaseApp || !id) return null;
  const db = await firestore();
  const { doc, getDoc } = await import("firebase/firestore");
  try {
    const snapshot = await getDoc(doc(db, "packages", id));
    if (!snapshot.exists()) return null;
    return normalise(snapshot.data(), snapshot.id);
  } catch {
    return null;
  }
}

export async function savePackage(pkg, { id } = {}) {
  if (!firebaseApp) throw new Error("Firebase is not configured for this build.");
  const db = await firestore();
  const { addDoc, collection, doc, serverTimestamp, setDoc } = await import("firebase/firestore");

  const name = String(pkg.name ?? "").trim();
  if (!name) throw new Error("A package name is required.");
  const slug = slugify(pkg.slug || name);
  if (!slug) throw new Error("A package name or slug is required.");

  const payload = {
    name,
    slug,
    destinationId: pkg.destinationId ?? "",
    priceLabel: String(pkg.priceLabel ?? "").trim(),
    priceAmount: Math.max(0, Math.round(Number(pkg.priceAmount) || 0)),
    duration: String(pkg.duration ?? "").trim(),
    summary: String(pkg.summary ?? "").trim(),
    itinerary: toStringList(pkg.itinerary),
    inclusions: toStringList(pkg.inclusions),
    hotel: {
      category: String(pkg.hotel?.category ?? "").trim(),
      nights: String(pkg.hotel?.nights ?? "").trim(),
      details: String(pkg.hotel?.details ?? "").trim(),
    },
    transport: {
      mode: String(pkg.transport?.mode ?? "").trim(),
      details: String(pkg.transport?.details ?? "").trim(),
    },
    faqs: Array.isArray(pkg.faqs)
      ? pkg.faqs
        .filter((faq) => faq && (faq.question || faq.answer))
        .map((faq) => ({ question: String(faq.question ?? "").trim(), answer: String(faq.answer ?? "").trim() }))
      : [],
    status: pkg.status === "published" ? "published" : "draft",
    featured: Boolean(pkg.featured),
    position: Number(pkg.position) || 0,
    updatedAt: serverTimestamp(),
  };

  if (id) {
    await setDoc(doc(db, "packages", id), payload, { merge: true });
    return id;
  }
  const created = await addDoc(collection(db, "packages"), payload);
  return created.id;
}

export async function deletePackage(id) {
  if (!firebaseApp) throw new Error("Firebase is not configured for this build.");
  const db = await firestore();
  const { doc, deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "packages", id));
}
