import { firebaseApp } from "./firebase.js";

export const POST_TYPES = ["guide", "itinerary", "seasonal", "story"];
export const POST_LANGS = ["en", "hi"];

const ADMIN_DOC = "config/admins";

async function firestore() {
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(firebaseApp);
}

/** Returns the admin allowlist, or an empty list when it has not been seeded. */
export async function getAdminEmails() {
  if (!firebaseApp) return [];
  const db = await firestore();
  const { doc, getDoc } = await import("firebase/firestore");
  try {
    const snapshot = await getDoc(doc(db, ...ADMIN_DOC.split("/")));
    const emails = snapshot.exists() ? snapshot.data()?.emails : null;
    return Array.isArray(emails) ? emails : [];
  } catch {
    return [];
  }
}

export async function isAdminUser(user) {
  if (!user?.email) return false;
  const emails = await getAdminEmails();
  return emails.some((email) => String(email).toLowerCase() === user.email.toLowerCase());
}

function normalise(post, id) {
  const body = post.body ?? "";
  return {
    id,
    translationGroup: post.translationGroup ?? id,
    lang: post.lang ?? "en",
    type: post.type ?? "guide",
    title: post.title ?? "",
    slug: post.slug ?? "",
    excerpt: post.excerpt ?? "",
    body,
    coverImage: post.coverImage ?? "",
    coverAlt: post.coverAlt ?? "",
    tags: Array.isArray(post.tags) ? post.tags : [],
    destinationId: post.destinationId ?? null,
    packageId: post.packageId ?? null,
    status: post.status ?? "draft",
    authorName: post.authorName ?? "",
    publishedAt: post.publishedAt ?? null,
    updatedAt: post.updatedAt ?? null,
    readingMinutes: post.readingMinutes ?? estimateReadingMinutes(body),
    featured: Boolean(post.featured),
    seo: { metaTitle: "", metaDescription: "", ...(post.seo ?? {}) },
  };
}

export function estimateReadingMinutes(body) {
  const words = String(body ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Public listing. Firestore rules require the status filter for public reads. */
export async function listPublishedPosts({ lang, destinationId, tag } = {}) {
  if (!firebaseApp) return [];
  const db = await firestore();
  const { collection, getDocs, query, where } = await import("firebase/firestore");

  const filters = [where("status", "==", "published")];
  if (lang) filters.push(where("lang", "==", lang));
  if (destinationId) filters.push(where("destinationId", "==", destinationId));
  if (tag) filters.push(where("tags", "array-contains", tag));

  // Sorted client-side so no composite index is required for a small blog.
  const snapshot = await getDocs(query(collection(db, "posts"), ...filters));
  return snapshot.docs
    .map((doc) => normalise(doc.data(), doc.id))
    .sort((a, b) => (b.publishedAt?.seconds ?? 0) - (a.publishedAt?.seconds ?? 0));
}

export async function getPublishedPostBySlug(slug) {
  if (!firebaseApp) return null;
  const db = await firestore();
  const { collection, getDocs, query, where } = await import("firebase/firestore");
  const snapshot = await getDocs(query(collection(db, "posts"), where("slug", "==", slug), where("status", "==", "published")));
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return normalise(doc.data(), doc.id);
}

/** All posts for the signed-in admin, drafts included. */
export async function listAllPostsForAdmin() {
  if (!firebaseApp) return [];
  const db = await firestore();
  const { collection, getDocs, query } = await import("firebase/firestore");
  const snapshot = await getDocs(query(collection(db, "posts")));
  return snapshot.docs
    .map((doc) => normalise(doc.data(), doc.id))
    .sort((a, b) => (b.updatedAt?.seconds ?? 0) - (a.updatedAt?.seconds ?? 0));
}

/** All published language versions that belong to the same post. */
export async function getTranslationSiblings(translationGroup) {
  if (!firebaseApp || !translationGroup) return [];
  const db = await firestore();
  const { collection, getDocs, query, where } = await import("firebase/firestore");
  const snapshot = await getDocs(query(
    collection(db, "posts"),
    where("translationGroup", "==", translationGroup),
    where("status", "==", "published"),
  ));
  return snapshot.docs.map((doc) => normalise(doc.data(), doc.id));
}

export async function getPostById(id) {
  if (!firebaseApp) return null;
  const db = await firestore();
  const { doc, getDoc } = await import("firebase/firestore");
  const snapshot = await getDoc(doc(db, "posts", id));
  if (!snapshot.exists()) return null;
  return normalise(snapshot.data(), snapshot.id);
}

export async function savePost(post, { id, actorEmail } = {}) {
  if (!firebaseApp) throw new Error("Firebase is not configured for this build.");
  const db = await firestore();
  const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");

  const slug = slugify(post.slug || post.title);
  if (!slug) throw new Error("A title or slug is required.");

  const payload = {
    translationGroup: post.translationGroup || id || slug,
    lang: POST_LANGS.includes(post.lang) ? post.lang : "en",
    type: POST_TYPES.includes(post.type) ? post.type : "guide",
    title: post.title.trim(),
    slug,
    excerpt: post.excerpt.trim(),
    body: post.body,
    coverImage: post.coverImage || "",
    coverAlt: post.coverAlt || post.title,
    tags: post.tags,
    destinationId: post.destinationId || null,
    packageId: post.packageId || null,
    status: post.status === "published" ? "published" : "draft",
    authorName: post.authorName || "",
    publishedAt: post.status === "published" ? post.publishedAt ?? null : null,
    readingMinutes: estimateReadingMinutes(post.body),
    featured: Boolean(post.featured),
    seo: {
      metaTitle: post.seo?.metaTitle || "",
      metaDescription: post.seo?.metaDescription || "",
    },
    updatedAt: serverTimestamp(),
  };

  if (id) {
    await setDoc(doc(db, "posts", id), payload, { merge: true });
    return id;
  }
  const created = await setDoc(doc(collection(db, "posts")), payload);
  return created.id;
}

export async function deletePost(id) {
  if (!firebaseApp) throw new Error("Firebase is not configured for this build.");
  const db = await firestore();
  const { doc, deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "posts", id));
}

export async function uploadCoverImage(file, postId) {
  if (!firebaseApp) throw new Error("Firebase is not configured for this build.");
  const { getStorage, ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
  const storage = getStorage(firebaseApp);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const objectRef = ref(storage, `journal/covers/${postId || "new"}/${Date.now()}-${safeName}`);
  await uploadBytes(objectRef, file, { contentType: file.type });
  return getDownloadURL(objectRef);
}

export function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Extracts h2/h3 headings for a simple table of contents. */
export function extractHeadings(body) {
  const headings = [];
  String(body ?? "")
    .split("\n")
    .forEach((line) => {
      const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
      if (!match) return;
      const text = match[2].replace(/[*_`]/g, "").trim();
      if (!text) return;
      headings.push({ level: match[1].length, text, id: slugify(text) });
    });
  return headings;
}
