import { firebaseFunctions } from "./firebase.js";

let checkoutScriptPromise;

function loadRazorpayCheckout() {
  if (typeof window === "undefined") return Promise.reject(new Error("Razorpay checkout needs a browser."));
  if (window.Razorpay) return Promise.resolve();
  if (checkoutScriptPromise) return checkoutScriptPromise;

  checkoutScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => window.Razorpay ? resolve() : reject(new Error("Razorpay checkout could not be loaded."));
    script.onerror = () => {
      checkoutScriptPromise = null;
      reject(new Error("Could not load Razorpay checkout. Check your connection and try again."));
    };
    document.head.appendChild(script);
  });
  return checkoutScriptPromise;
}

export async function createRazorpayOrder(details) {
  if (!firebaseFunctions) throw new Error("Firebase Functions is not configured for this build.");
  const { httpsCallable } = await import("firebase/functions");
  const createOrder = httpsCallable(firebaseFunctions, "createRazorpayOrder");
  const result = await createOrder(details);
  return result.data;
}

export async function verifyRazorpayPayment(details) {
  if (!firebaseFunctions) throw new Error("Firebase Functions is not configured for this build.");
  const { httpsCallable } = await import("firebase/functions");
  const verify = httpsCallable(firebaseFunctions, "verifyRazorpayPayment");
  const result = await verify(details);
  return result.data;
}

/** Opens Razorpay Checkout; server-side verification happens in the callback. */
export async function openRazorpayCheckout({ order, onSuccess, onFailure, onDismiss }) {
  await loadRazorpayCheckout();

  const checkout = new window.Razorpay({
    key: order.keyId,
    amount: order.amountPaise,
    currency: order.currency,
    name: "Elsewhere Travel Co.",
    description: order.packageName,
    order_id: order.orderId,
    prefill: {
      name: order.guestName,
      email: order.email,
      contact: order.phone,
    },
    notes: { bookingReference: order.reference },
    theme: { color: "#16342f" },
    handler: async (response) => {
      try {
        const result = await verifyRazorpayPayment({
          reference: order.reference,
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });
        await onSuccess(result);
      } catch (error) {
        onFailure(error);
      }
    },
    modal: {
      ondismiss: onDismiss,
      confirm_close: true,
    },
  });

  checkout.on("payment.failed", (response) => {
    const description = response?.error?.description || "The payment was not completed.";
    onFailure(new Error(description));
  });
  checkout.open();
}
