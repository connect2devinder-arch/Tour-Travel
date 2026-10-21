import { firebaseApp } from "./firebase.js";

export const BOOKING_STATUSES = ["pending_payment", "confirmed", "cancelled", "completed"];
export const NOTIFICATION_CHANNELS = ["email", "sms"];
export const NOTIFICATION_TRIGGERS = ["booking_created", "payment_received", "status_changed"];

export const BOOKING_STATUS_LABELS = {
  pending_payment: "Awaiting payment",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

async function firestore() {
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(firebaseApp);
}

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Human-readable booking reference, e.g. ELW-7QK4M2. Also the document ID. */
export function createBookingReference() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (byte) => REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length]).join("");
  return `ELW-${suffix}`;
}

function normaliseBooking(booking, id) {
  return {
    id: id ?? booking.reference,
    reference: booking.reference ?? id,
    packageId: booking.packageId ?? "",
    packageName: booking.packageName ?? "",
    destinationId: booking.destinationId ?? "",
    destinationName: booking.destinationName ?? "",
    guestName: booking.guestName ?? "",
    email: booking.email ?? "",
    phone: booking.phone ?? "",
    travelDate: booking.travelDate ?? "",
    travelers: Number(booking.travelers ?? 1),
    notes: booking.notes ?? "",
    amount: Number(booking.amount ?? 0),
    currency: booking.currency ?? "INR",
    status: BOOKING_STATUSES.includes(booking.status) ? booking.status : "pending_payment",
    payment: {
      status: booking.payment?.status ?? "pending",
      method: booking.payment?.method ?? "",
      reference: booking.payment?.reference ?? "",
      paidAt: booking.payment?.paidAt ?? null,
    },
    history: Array.isArray(booking.history) ? booking.history : [],
    createdAt: booking.createdAt ?? null,
    updatedAt: booking.updatedAt ?? null,
  };
}

function normaliseNotification(notification, id) {
  return {
    id: id ?? "",
    bookingId: notification.bookingId ?? "",
    reference: notification.reference ?? "",
    channel: notification.channel ?? "email",
    recipient: notification.recipient ?? "",
    subject: notification.subject ?? "",
    body: notification.body ?? "",
    trigger: notification.trigger ?? "booking_created",
    status: notification.status ?? "queued",
    createdAt: notification.createdAt ?? null,
    sentAt: notification.sentAt ?? null,
  };
}

export function formatAmount(amount, currency = "INR") {
  const value = Number(amount ?? 0);
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `₹${value.toLocaleString("en-IN")}`;
  }
}

export function formatDate(value) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(`${value}T00:00:00`) : value.toDate ? value.toDate() : value;
  if (Number.isNaN(date?.getTime?.())) return String(value);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Creates the booking document. The document ID is the booking reference. */
export async function createBooking(details) {
  if (!firebaseApp) throw new Error("Firebase is not configured for this build.");
  const db = await firestore();
  const { doc, serverTimestamp, setDoc } = await import("firebase/firestore");

  const reference = createBookingReference();
  const payload = {
    reference,
    packageId: details.packageId ?? "",
    packageName: details.packageName ?? "",
    destinationId: details.destinationId ?? "",
    destinationName: details.destinationName ?? "",
    guestName: String(details.guestName ?? "").trim(),
    email: String(details.email ?? "").trim(),
    phone: String(details.phone ?? "").trim(),
    travelDate: details.travelDate ?? "",
    travelers: Number(details.travelers ?? 1),
    notes: String(details.notes ?? "").trim(),
    amount: Math.max(0, Math.round(Number(details.amount ?? 0))),
    currency: "INR",
    status: "pending_payment",
    payment: { status: "pending", method: "", reference: "", paidAt: null },
    // serverTimestamp() is not supported inside arrays, so the history entry
    // carries a client timestamp.
    history: [{ status: "pending_payment", at: new Date(), note: "Booking received" }],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, "bookings", reference), payload);
  return { id: reference, reference };
}

export async function getBookingById(id) {
  if (!firebaseApp || !id) return null;
  const db = await firestore();
  const { doc, getDoc } = await import("firebase/firestore");
  try {
    const snapshot = await getDoc(doc(db, "bookings", id));
    if (!snapshot.exists()) return null;
    return normaliseBooking(snapshot.data(), snapshot.id);
  } catch {
    return null;
  }
}

/** Bookings that belong to the signed-in guest (email match). */
export async function listBookingsForGuest(email) {
  if (!firebaseApp || !email) return [];
  const db = await firestore();
  const { collection, getDocs, query, where } = await import("firebase/firestore");
  try {
    const snapshot = await getDocs(query(collection(db, "bookings"), where("email", "==", email)));
    return snapshot.docs
      .map((doc) => normaliseBooking(doc.data(), doc.id))
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
  } catch {
    return [];
  }
}

/** Every booking, for the admin panel. */
export async function listBookingsForAdmin() {
  if (!firebaseApp) return [];
  const db = await firestore();
  const { collection, getDocs, query } = await import("firebase/firestore");
  const snapshot = await getDocs(query(collection(db, "bookings")));
  return snapshot.docs
    .map((doc) => normaliseBooking(doc.data(), doc.id))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

/**
 * Marks the simulated payment as paid and confirms the booking.
 * The guest is not signed in while paying, so the history is rebuilt from the
 * copy the booking flow already holds instead of reading the document back.
 */
export async function confirmBookingPayment(id, { method, reference, history = [] }) {
  if (!firebaseApp) throw new Error("Firebase is not configured for this build.");
  const db = await firestore();
  const { doc, serverTimestamp, updateDoc } = await import("firebase/firestore");

  const updatedHistory = [
    ...history,
    { status: "confirmed", at: new Date(), note: `Payment received via ${method}` },
  ];

  await updateDoc(doc(db, "bookings", id), {
    status: "confirmed",
    payment: { status: "paid", method, reference, paidAt: serverTimestamp() },
    history: updatedHistory,
    updatedAt: serverTimestamp(),
  });
  return { status: "confirmed", history: updatedHistory };
}

/** Admin status change. Writes the history entry and returns the new state. */
export async function updateBookingStatus(id, status, note = "") {
  if (!firebaseApp) throw new Error("Firebase is not configured for this build.");
  if (!BOOKING_STATUSES.includes(status)) throw new Error("Unknown booking status.");
  const db = await firestore();
  const { doc, serverTimestamp, updateDoc } = await import("firebase/firestore");

  const booking = await getBookingById(id);
  if (!booking) throw new Error("Booking not found.");

  const history = [
    ...booking.history,
    { status, at: new Date(), note: note || `Status changed to ${BOOKING_STATUS_LABELS[status] ?? status}` },
  ];

  await updateDoc(doc(db, "bookings", id), { status, history, updatedAt: serverTimestamp() });
  return { ...booking, status, history };
}

/** Writes a notification record. Delivery itself is simulated in this POC. */
export async function createNotification({ bookingId, reference, channel, recipient, subject, body, trigger }) {
  if (!firebaseApp) throw new Error("Firebase is not configured for this build.");
  const db = await firestore();
  const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");

  const payload = {
    bookingId,
    reference: reference ?? "",
    channel,
    recipient: recipient ?? "",
    subject: subject ?? "",
    body: body ?? "",
    trigger,
    status: "queued",
    createdAt: serverTimestamp(),
    sentAt: null,
  };

  const created = await addDoc(collection(db, "notifications"), payload);
  return created.id;
}

export async function listNotifications() {
  if (!firebaseApp) return [];
  const db = await firestore();
  const { collection, getDocs, query } = await import("firebase/firestore");
  const snapshot = await getDocs(query(collection(db, "notifications")));
  return snapshot.docs
    .map((doc) => normaliseNotification(doc.data(), doc.id))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

export async function markNotificationSent(id) {
  if (!firebaseApp) throw new Error("Firebase is not configured for this build.");
  const db = await firestore();
  const { doc, serverTimestamp, updateDoc } = await import("firebase/firestore");
  await updateDoc(doc(db, "notifications", id), { status: "sent", sentAt: serverTimestamp() });
}

/** Builds the email + SMS notification pair for a booking event. */
export function buildBookingNotifications({ booking, trigger, extraNote = "" }) {
  const amount = formatAmount(booking.amount, booking.currency);
  const reference = booking.reference;
  const packageName = booking.packageName || "your trip";
  const travellers = `${booking.travelers} traveller${booking.travelers === 1 ? "" : "s"}`;

  const templates = {
    booking_created: {
      email: {
        subject: `Booking received — ${reference} (${packageName})`,
        body: `Hi ${booking.guestName}, we have received your booking for ${packageName} in ${booking.destinationName || "the Himalayas"}. Reference ${reference}. Amount due ${amount} for ${travellers} travelling on ${formatDate(booking.travelDate)}. Complete the payment to confirm your trip. — Elsewhere Travel Co.`,
      },
      sms: {
        subject: "Booking received",
        body: `Elsewhere Travel: booking ${reference} received for ${packageName}. Pay ${amount} to confirm. Ref ${reference}.`,
      },
    },
    payment_received: {
      email: {
        subject: `Payment received — ${reference}`,
        body: `We have received ${amount} for ${packageName}. Booking ${reference} is confirmed for ${booking.travelers} traveller${booking.travelers === 1 ? "" : "s"} on ${formatDate(booking.travelDate)}. We will share the final itinerary over email. — Elsewhere Travel Co.`,
      },
      sms: {
        subject: "Payment received",
        body: `Elsewhere Travel: ${amount} received. Booking ${reference} for ${packageName} is confirmed. Thank you!`,
      },
    },
    status_changed: {
      email: {
        subject: `Booking ${reference} — status updated`,
        body: `Your booking ${reference} for ${packageName} is now ${BOOKING_STATUS_LABELS[booking.status] ?? booking.status}.${extraNote ? ` ${extraNote}` : ""} — Elsewhere Travel Co.`,
      },
      sms: {
        subject: "Booking update",
        body: `Elsewhere Travel: booking ${reference} for ${packageName} is now ${BOOKING_STATUS_LABELS[booking.status] ?? booking.status}.${extraNote ? ` ${extraNote}` : ""}`,
      },
    },
  };

  const template = templates[trigger] ?? templates.booking_created;
  return [
    { channel: "email", recipient: booking.email, subject: template.email.subject, body: template.email.body },
    { channel: "sms", recipient: booking.phone, subject: template.sms.subject, body: template.sms.body },
  ];
}

/** Creates the email + SMS notification records for a booking event. */
export async function recordBookingNotifications(booking, trigger, extraNote = "") {
  const templates = buildBookingNotifications({ booking, trigger, extraNote });
  const results = [];
  for (const template of templates) {
    try {
      await createNotification({
        bookingId: booking.id ?? booking.reference,
        reference: booking.reference,
        trigger,
        ...template,
      });
      results.push({ channel: template.channel, ok: true });
    } catch (error) {
      console.warn(`Notification (${template.channel}) could not be queued:`, error?.message || error);
      results.push({ channel: template.channel, ok: false, error: error?.message || String(error) });
    }
  }
  return results;
}
