const { createHmac, randomBytes, timingSafeEqual } = require("node:crypto");
const { initializeApp } = require("firebase-admin/app");
const { FieldValue, Timestamp, getFirestore } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const { HttpsError, onCall, onRequest } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");

initializeApp();

const REGION = "asia-south1";
const KEY_ID = defineSecret("RAZORPAY_KEY_ID");
const KEY_SECRET = defineSecret("RAZORPAY_KEY_SECRET");
const WEBHOOK_SECRET = defineSecret("RAZORPAY_WEBHOOK_SECRET");
const db = getFirestore();

const SAMPLE_PACKAGES = {
  "shimla-escape": { name: "Shimla Hill Escape", destinationId: "shimla", destinationName: "Shimla", priceAmount: 15999 },
  "manali-valley": { name: "Manali Valley Break", destinationId: "manali", destinationName: "Manali", priceAmount: 21999 },
  "spiti-road-trip": { name: "Spiti Slow Road Trip", destinationId: "lahaul-spiti", destinationName: "Lahaul & Spiti", priceAmount: 36999 },
  "mussoorie-weekend": { name: "Mussoorie Weekend", destinationId: "mussoorie", destinationName: "Mussoorie", priceAmount: 12999 },
};

const DESTINATION_NAMES = {
  shimla: "Shimla",
  manali: "Manali",
  "lahaul-spiti": "Lahaul & Spiti",
  mussoorie: "Mussoorie",
};

function bookingReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  const suffix = [...bytes].map((byte) => alphabet[byte % alphabet.length]).join("");
  return `ELW-${suffix}`;
}

function validateBooking(input) {
  const data = input && typeof input === "object" ? input : {};
  const guestName = String(data.guestName ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const phone = String(data.phone ?? "").trim();
  const travelDate = String(data.travelDate ?? "");
  const travelers = Number(data.travelers);
  const notes = String(data.notes ?? "").trim();
  const packageId = String(data.packageId ?? "").trim();

  if (guestName.length < 2 || guestName.length > 100) throw new HttpsError("invalid-argument", "Please enter a valid name.");
  if (email.length > 254 || !/^[^ @]+@[^ @]+\.[^ @]+$/.test(email)) throw new HttpsError("invalid-argument", "Please enter a valid email address.");
  if (phone.length < 7 || phone.length > 30 || !/^[+0-9() -]+$/.test(phone)) throw new HttpsError("invalid-argument", "Please enter a valid phone number.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate) || travelDate < new Date().toISOString().slice(0, 10)) {
    throw new HttpsError("invalid-argument", "Please choose a valid travel date.");
  }
  if (!Number.isInteger(travelers) || travelers < 1 || travelers > 20) throw new HttpsError("invalid-argument", "Travellers must be between 1 and 20.");
  if (notes.length > 1500) throw new HttpsError("invalid-argument", "Notes must be 1,500 characters or fewer.");
  if (!packageId) throw new HttpsError("invalid-argument", "A package is required.");

  return { guestName, email, phone, travelDate, travelers, notes, packageId };
}

async function getBookablePackage(packageId) {
  const snapshot = await db.collection("packages").doc(packageId).get();
  if (snapshot.exists) {
    const pkg = snapshot.data();
    if (pkg.status !== "published") throw new HttpsError("failed-precondition", "This package is not currently available.");
    const priceAmount = Number(pkg.priceAmount);
    if (!Number.isSafeInteger(priceAmount) || priceAmount < 1) throw new HttpsError("failed-precondition", "This package has no valid booking price.");
    const destinationId = String(pkg.destinationId ?? "");
    return {
      name: String(pkg.name ?? "Trip package"),
      destinationId,
      destinationName: DESTINATION_NAMES[destinationId] ?? destinationId,
      priceAmount,
    };
  }

  // Existing sample packages live in src/mockData.js rather than Firestore.
  const sample = SAMPLE_PACKAGES[packageId];
  if (!sample) throw new HttpsError("not-found", "This package could not be found.");
  return sample;
}

async function razorpayRequest(path, method, body, keyId, keySecret) {
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    logger.error("Razorpay API request failed", { path, status: response.status, code: payload?.error?.code });
    throw new HttpsError("internal", "Razorpay could not process the request. Please try again.");
  }
  return payload;
}

function notificationPayload(booking, channel, trigger, subject, body) {
  return {
    targetId: booking.reference,
    targetType: "booking",
    reference: booking.reference,
    channel,
    recipient: channel === "email" ? booking.email : booking.phone,
    subject,
    body,
    trigger,
    status: "queued",
    createdAt: FieldValue.serverTimestamp(),
    sentAt: null,
  };
}

function bookingCreatedNotifications(booking) {
  const when = booking.travelDate;
  const amount = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(booking.amount);
  return [
    notificationPayload(
      booking,
      "email",
      "booking_created",
      `Booking received — ${booking.reference} (${booking.packageName})`,
      `Hi ${booking.guestName}, we received your booking for ${booking.packageName} in ${booking.destinationName}. Reference ${booking.reference}. Amount due ${amount} for ${booking.travelers} traveller(s), travelling on ${when}. Complete payment through the secure checkout to confirm. — Elsewhere Travel Co.`,
    ),
    notificationPayload(
      booking,
      "sms",
      "booking_created",
      "Booking received",
      `Elsewhere Travel: booking ${booking.reference} received for ${booking.packageName}. Amount due ${amount}. Complete payment to confirm.`,
    ),
  ];
}

function paymentReceivedNotifications(booking) {
  const amount = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(booking.amount);
  return [
    notificationPayload(
      booking,
      "email",
      "payment_received",
      `Payment received — ${booking.reference}`,
      `We received ${amount} for ${booking.packageName}. Booking ${booking.reference} is confirmed for ${booking.travelers} traveller(s) on ${booking.travelDate}. — Elsewhere Travel Co.`,
    ),
    notificationPayload(
      booking,
      "sms",
      "payment_received",
      "Payment received",
      `Elsewhere Travel: ${amount} received. Booking ${booking.reference} is confirmed.`,
    ),
  ];
}

async function queueNotifications(notifications) {
  const batch = db.batch();
  notifications.forEach((notification) => {
    batch.set(db.collection("notifications").doc(), notification);
  });
  await batch.commit();
}

async function finalizeCapturedPayment({ orderId, paymentId, paymentMethod = "razorpay", amountPaise, currency }) {
  const matches = await db.collection("bookings").where("payment.orderId", "==", orderId).limit(1).get();
  if (matches.empty) {
    logger.warn("Captured Razorpay payment has no matching booking", { orderId, paymentId });
    return null;
  }

  const bookingRef = matches.docs[0].ref;
  let shouldQueueNotifications = false;
  let bookingResult;

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(bookingRef);
    if (!snapshot.exists) return;
    const booking = snapshot.data();
    if (booking.payment?.status === "paid" && booking.payment?.reference === paymentId) {
      bookingResult = { ...booking, id: snapshot.id };
      return;
    }

    if (booking.payment?.orderId !== orderId) throw new HttpsError("failed-precondition", "Payment order does not match this booking.");
    if (Number(amountPaise) !== Number(booking.amount) * 100 || currency !== "INR") {
      throw new HttpsError("failed-precondition", "Captured payment amount does not match the booking.");
    }
    const history = Array.isArray(booking.history) ? booking.history : [];
    const updated = {
      status: "confirmed",
      payment: {
        ...(booking.payment ?? {}),
        status: "paid",
        method: paymentMethod,
        reference: paymentId,
        paidAt: Timestamp.now(),
      },
      history: [...history, { status: "confirmed", at: Timestamp.now(), note: "Razorpay payment captured" }],
      updatedAt: FieldValue.serverTimestamp(),
    };
    transaction.update(bookingRef, updated);
    bookingResult = { ...booking, ...updated, id: snapshot.id };
    shouldQueueNotifications = true;
  });

  if (shouldQueueNotifications && bookingResult) {
    await queueNotifications(paymentReceivedNotifications(bookingResult));
  }
  return bookingResult;
}

exports.createRazorpayOrder = onCall(
  { region: REGION, secrets: [KEY_ID, KEY_SECRET] },
  async (request) => {
    if (!KEY_ID.value().startsWith("rzp_test_")) {
      throw new HttpsError("failed-precondition", "Razorpay test mode is required for this integration.");
    }
    const details = validateBooking(request.data);
    const pkg = await getBookablePackage(details.packageId);
    const amount = pkg.priceAmount * details.travelers;
    if (!Number.isSafeInteger(amount) || amount < 1) throw new HttpsError("failed-precondition", "Booking amount is invalid.");
    const amountPaise = amount * 100;
    if (!Number.isSafeInteger(amountPaise)) throw new HttpsError("failed-precondition", "Booking amount is too large.");

    const reference = bookingReference();
    let order;
    try {
      order = await razorpayRequest("/orders", "POST", {
        amount: amountPaise,
        currency: "INR",
        receipt: reference,
        notes: { bookingReference: reference, packageId: details.packageId },
      }, KEY_ID.value(), KEY_SECRET.value());
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logger.error("Could not create Razorpay order", error);
      throw new HttpsError("internal", "Could not start the secure payment. Please try again.");
    }

    const booking = {
      reference,
      packageId: details.packageId,
      packageName: pkg.name,
      destinationId: pkg.destinationId,
      destinationName: pkg.destinationName,
      guestName: details.guestName,
      email: details.email,
      phone: details.phone,
      travelDate: details.travelDate,
      travelers: details.travelers,
      notes: details.notes,
      amount,
      currency: "INR",
      status: "pending_payment",
      payment: { status: "pending", method: "razorpay", reference: "", orderId: order.id, paidAt: null },
      history: [{ status: "pending_payment", at: Timestamp.now(), note: "Booking received; awaiting Razorpay payment" }],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    try {
      await db.collection("bookings").doc(reference).create(booking);
    } catch (error) {
      logger.error("Could not save booking after Razorpay order creation", { reference, orderId: order.id, error });
      throw new HttpsError("internal", "Payment order started, but we couldn’t save the booking. Please contact the travel team.");
    }

    try {
      await queueNotifications(bookingCreatedNotifications(booking));
    } catch (error) {
      // A notification outage must not prevent the guest from paying for a
      // booking that has already been safely created.
      logger.error("Could not queue booking-created notifications", { reference, error });
    }

    return {
      reference,
      orderId: order.id,
      keyId: KEY_ID.value(),
      amount: amount,
      amountPaise,
      currency: "INR",
      packageName: pkg.name,
      guestName: details.guestName,
      email: details.email,
      phone: details.phone,
    };
  },
);

exports.verifyRazorpayPayment = onCall(
  { region: REGION, secrets: [KEY_ID, KEY_SECRET] },
  async (request) => {
    const paymentId = String(request.data?.paymentId ?? "");
    const orderId = String(request.data?.orderId ?? "");
    const signature = String(request.data?.signature ?? "");
    const reference = String(request.data?.reference ?? "");
    if (!paymentId || !orderId || !signature || !reference) {
      throw new HttpsError("invalid-argument", "Payment verification details are incomplete.");
    }

    const bookingSnapshot = await db.collection("bookings").doc(reference).get();
    if (!bookingSnapshot.exists) throw new HttpsError("not-found", "Booking not found.");
    const booking = bookingSnapshot.data();
    if (booking.payment?.orderId !== orderId) throw new HttpsError("failed-precondition", "Payment order does not match this booking.");

    const expected = createHmac("sha256", KEY_SECRET.value()).update(`${orderId}|${paymentId}`).digest();
    let received;
    try {
      received = Buffer.from(signature, "hex");
    } catch {
      throw new HttpsError("permission-denied", "Payment signature is invalid.");
    }
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
      throw new HttpsError("permission-denied", "Payment signature is invalid.");
    }

    const payment = await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`, "GET", null, KEY_ID.value(), KEY_SECRET.value());
    if (payment.order_id !== orderId || Number(payment.amount) !== Number(booking.amount) * 100 || payment.currency !== "INR") {
      throw new HttpsError("failed-precondition", "Payment details do not match the booking.");
    }

    let confirmedPayment = payment;
    if (payment.status === "authorized") {
      confirmedPayment = await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}/capture`, "POST", {
        amount: Number(booking.amount) * 100,
        currency: "INR",
      }, KEY_ID.value(), KEY_SECRET.value());
    }
    if (confirmedPayment.status !== "captured") {
      throw new HttpsError("failed-precondition", "Razorpay has not captured this payment yet.");
    }

    const updated = await finalizeCapturedPayment({
      orderId,
      paymentId,
      paymentMethod: payment.method || "razorpay",
      amountPaise: confirmedPayment.amount,
      currency: confirmedPayment.currency,
    });
    if (!updated) throw new HttpsError("not-found", "Booking not found for this payment.");
    return { reference, status: "confirmed", paymentId, amount: updated.amount };
  },
);

exports.razorpayWebhook = onRequest(
  { region: REGION, secrets: [WEBHOOK_SECRET] },
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method not allowed");
      return;
    }

    const suppliedSignature = String(request.get("x-razorpay-signature") ?? "");
    const expectedSignature = createHmac("sha256", WEBHOOK_SECRET.value()).update(request.rawBody).digest();
    let receivedSignature;
    try {
      receivedSignature = Buffer.from(suppliedSignature, "hex");
    } catch {
      response.status(400).send("Invalid signature");
      return;
    }
    if (receivedSignature.length !== expectedSignature.length || !timingSafeEqual(receivedSignature, expectedSignature)) {
      response.status(400).send("Invalid signature");
      return;
    }

    const event = request.body?.event;
    if (event === "payment.captured") {
      const payment = request.body?.payload?.payment?.entity;
      if (payment?.order_id && payment?.id) {
        await finalizeCapturedPayment({
          orderId: payment.order_id,
          paymentId: payment.id,
          paymentMethod: payment.method || "razorpay",
          amountPaise: payment.amount,
          currency: payment.currency,
        });
      }
    }

    response.status(200).json({ received: true });
  },
);
