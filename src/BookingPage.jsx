import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { firebaseConfigured } from "./firebase.js";
import { useAuth } from "./AuthContext.jsx";
import { usePackages } from "./PackagesContext.jsx";
import { findPackageById } from "./packages.js";
import { useSeo } from "./seo.js";
import { createRazorpayOrder, openRazorpayCheckout } from "./razorpay.js";
import {
  BOOKING_STATUS_LABELS,
  formatAmount,
  formatDate,
  getBookingById,
  listBookingsForGuest,
} from "./bookings.js";

const MAX_TRAVELERS = 20;

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function validateDetails(details) {
  const errors = {};
  const name = details.guestName.trim();
  const email = details.email.trim();
  const phone = details.phone.trim();

  if (!name) errors.guestName = "Please tell us your name.";
  else if (name.length < 2) errors.guestName = "That name looks too short.";
  else if (name.length > 100) errors.guestName = "Please use 100 characters or fewer.";

  if (!email) errors.email = "We need an email for your confirmation.";
  else if (!/^[^ @]+@[^ @]+\.[^ @]+$/.test(email)) errors.email = "That email address doesn’t look right.";

  if (!phone) errors.phone = "A phone number helps us reach you on the day.";
  else if (phone.length < 7 || !/^[+0-9() -]+$/.test(phone)) errors.phone = "Please enter a valid phone number.";

  if (!details.travelDate) errors.travelDate = "Pick a travel date.";
  else if (details.travelDate < todayISO()) errors.travelDate = "Pick a date from today onwards.";

  const travellers = Number(details.travelers);
  if (!travellers || travellers < 1 || travellers > MAX_TRAVELERS) {
    errors.travelers = `Travellers must be between 1 and ${MAX_TRAVELERS}.`;
  }

  return errors;
}

function PaymentStep({ booking, amount, onPaid }) {
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  async function handlePay(event) {
    event.preventDefault();
    setMessage("");
    setProcessing(true);
    try {
      await openRazorpayCheckout({
        order: booking.razorpayOrder,
        onSuccess: async (result) => {
          setProcessing(false);
          onPaid(result.paymentId, [{ channel: "email", ok: true }, { channel: "sms", ok: true }]);
        },
        onFailure: (error) => {
          setProcessing(false);
          setMessage(error?.message || "Payment was not completed. Please try again.");
        },
        onDismiss: () => setProcessing(false),
      });
    } catch (error) {
      setProcessing(false);
      setMessage(error?.message || "We couldn’t open Razorpay checkout. Please try again.");
    }
  }

  return (
    <div className="booking-card booking-payment-card">
      <div className="booking-step-heading">
        <p className="eyebrow">STEP 2 OF 2 · PAYMENT</p>
        <h2>Pay <em>{formatAmount(amount)}</em></h2>
        <p className="booking-step-note">
          Secure Razorpay checkout · Test mode is active, so no real money will be charged.
        </p>
      </div>

      <form className="booking-form" onSubmit={handlePay} noValidate>
        {message && <p className="booking-message is-error" role="alert">{message}</p>}

        <div className="booking-submit-row">
          <p className="booking-demo-note">You’ll complete payment securely in Razorpay. Test mode does not charge a real card or bank account.</p>
          <button className="booking-submit" type="submit" disabled={processing}>
            {processing ? "Opening secure checkout…" : `Continue to Razorpay · ${formatAmount(amount)}`} <span aria-hidden="true">↗</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export function BookingPage() {
  const { packageId } = useParams();
  const { destinations } = usePackages();
  const [step, setStep] = useState("details");
  const [details, setDetails] = useState({
    guestName: "",
    email: "",
    phone: "",
    travelDate: "",
    travelers: 2,
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [booking, setBooking] = useState(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const found = useMemo(() => findPackageById(destinations, packageId), [destinations, packageId]);
  const packageData = found?.package;
  const destination = found?.destination;
  const travellers = Number(details.travelers) || 0;
  const amount = Math.round((packageData?.priceAmount ?? 0) * travellers);

  useSeo({
    title: packageData ? `Book ${packageData.name}` : "Book a trip",
    description: packageData?.summary,
    url: `${window.location.origin}/book/${packageId}`,
  });

  function update(field, value) {
    setDetails((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleDetailsSubmit(event) {
    event.preventDefault();
    const nextErrors = validateDetails(details);
    setErrors(nextErrors);
    setMessage("");
    if (Object.keys(nextErrors).length) return;

    if (!firebaseConfigured) {
      setMessage("Online booking isn’t configured for this build.");
      return;
    }

    setSaving(true);
    try {
      const razorpayOrder = await createRazorpayOrder({
        packageId,
        guestName: details.guestName,
        email: details.email,
        phone: details.phone,
        travelDate: details.travelDate,
        travelers: travellers,
        notes: details.notes,
      });

      const created = {
        id: razorpayOrder.reference,
        reference: razorpayOrder.reference,
        packageId,
        packageName: razorpayOrder.packageName,
        destinationId: destination.id,
        destinationName: destination.name,
        guestName: details.guestName.trim(),
        email: details.email.trim(),
        phone: details.phone.trim(),
        travelDate: details.travelDate,
        travelers: travellers,
        notes: details.notes.trim(),
        amount: razorpayOrder.amount,
        currency: "INR",
        status: "pending_payment",
        razorpayOrder,
        history: [{ status: "pending_payment", at: new Date(), note: "Booking received" }],
      };

      setBooking(created);
      setStep("payment");
    } catch (error) {
      setMessage(`We couldn’t save your booking. Please try again.${error?.message ? ` (${error.message})` : ""}`);
    } finally {
      setSaving(false);
    }
  }

  if (!packageData) {
    return (
      <main id="main" className="package-not-found section-shell">
        <p className="eyebrow">TRIP NOT FOUND</p>
        <h1>That trip isn’t bookable right now.</h1>
        <Link className="text-link" to="/#packages">Back to tour packages <span aria-hidden="true">↗</span></Link>
      </main>
    );
  }

  if (step === "done") {
    return (
      <main id="main" className="booking-page">
        <section className="section-shell booking-confirmation">
          <p className="eyebrow">BOOKING CONFIRMED</p>
          <h1>You’re going to <em>{packageData.name}.</em></h1>
          <p className="booking-confirmation-lead">
            Reference <strong>{booking.reference}</strong> · {formatAmount(booking.amount)} paid · {booking.travelers} traveller{booking.travelers === 1 ? "" : "s"} · {formatDate(booking.travelDate)}
          </p>
          <div className="booking-confirmation-card">
            <dl>
              <div><dt>Booking reference</dt><dd>{booking.reference}</dd></div>
              <div><dt>Package</dt><dd>{booking.packageName}</dd></div>
              <div><dt>Destination</dt><dd>{booking.destinationName}</dd></div>
              <div><dt>Travellers</dt><dd>{booking.travelers}</dd></div>
              <div><dt>Travel date</dt><dd>{formatDate(booking.travelDate)}</dd></div>
              <div><dt>Amount paid</dt><dd>{formatAmount(booking.amount)}</dd></div>
              <div><dt>Payment reference</dt><dd>{paymentReference}</dd></div>
              <div><dt>Status</dt><dd>{BOOKING_STATUS_LABELS.confirmed}</dd></div>
            </dl>
          </div>
          <p className="booking-demo-note">
            {notifications.length && notifications.every((item) => item.ok) ? (
              <>Confirmation email and SMS notifications were queued for {booking.email} and {booking.phone}. In this demo they are stored in the admin panel instead of being delivered.</>
            ) : (
              <>Booking saved, but the email/SMS notifications could not be queued for {booking.email} and {booking.phone}. The travel team can still follow up from the admin panel.</>
            )}
          </p>
          <div className="booking-confirmation-actions">
            <Link className="text-link" to="/">Back to the site <span aria-hidden="true">↗</span></Link>
            <Link className="text-link" to="/bookings">See your bookings <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="main" className="booking-page">
      <nav className="package-breadcrumb section-shell" aria-label="Breadcrumb">
        <Link to="/#top">Home</Link><span aria-hidden="true">/</span>
        <Link to={`/packages/${packageId}`}>{packageData.name}</Link><span aria-hidden="true">/</span>
        <span aria-current="page">Book</span>
      </nav>

      <section className="section-shell booking-layout">
        <div className="booking-card">
          {step === "details" ? (
            <>
              <div className="booking-step-heading">
                <p className="eyebrow">STEP 1 OF 2 · YOUR DETAILS</p>
                <h2>Book <em>{packageData.name}</em></h2>
                <p className="booking-step-note">{packageData.duration} · from {packageData.price} per traveller · {destination.name}</p>
              </div>

              {!firebaseConfigured && (
                <p className="booking-message is-error" role="status">
                  Online booking isn’t configured for this build — Firestore keys are missing.
                </p>
              )}

              <form className="booking-form" onSubmit={handleDetailsSubmit} noValidate>
                <label className="booking-field">
                  <span>Your name</span>
                  <input value={details.guestName} onChange={(event) => update("guestName", event.target.value)} placeholder="Full name" autoComplete="name" />
                  {errors.guestName && <small className="booking-error">{errors.guestName}</small>}
                </label>

                <label className="booking-field">
                  <span>Email address</span>
                  <input type="email" value={details.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" autoComplete="email" />
                  {errors.email && <small className="booking-error">{errors.email}</small>}
                </label>

                <label className="booking-field">
                  <span>Phone number</span>
                  <input type="tel" value={details.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+91 98765 43210" autoComplete="tel" />
                  {errors.phone && <small className="booking-error">{errors.phone}</small>}
                </label>

                <div className="booking-field-row">
                  <label className="booking-field">
                    <span>Travel date</span>
                    <input type="date" min={todayISO()} value={details.travelDate} onChange={(event) => update("travelDate", event.target.value)} />
                    {errors.travelDate && <small className="booking-error">{errors.travelDate}</small>}
                  </label>
                  <label className="booking-field">
                    <span>Travellers</span>
                    <select value={details.travelers} onChange={(event) => update("travelers", event.target.value)}>
                      {Array.from({ length: MAX_TRAVELERS }, (_, index) => index + 1).map((count) => (
                        <option value={count} key={count}>{count}</option>
                      ))}
                    </select>
                    {errors.travelers && <small className="booking-error">{errors.travelers}</small>}
                  </label>
                </div>

                <label className="booking-field">
                  <span>Anything else? <small>Optional</small></span>
                  <textarea rows="3" maxLength="1500" value={details.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Pickup details, dietary needs, a birthday…" />
                </label>

                {message && <p className="booking-message is-error" role="alert">{message}</p>}

                <div className="booking-submit-row">
                  <p className="booking-demo-note">Amount due <strong>{formatAmount(amount)}</strong> ({travellers} traveller{travellers === 1 ? "" : "s"} × {formatAmount(packageData.priceAmount)}).</p>
                  <button className="booking-submit" type="submit" disabled={saving || !firebaseConfigured}>
                    {saving ? "Saving…" : "Continue to payment"} <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
          <PaymentStep booking={booking} amount={booking?.amount ?? amount} onPaid={(reference, results) => { setPaymentReference(reference); if (results) setNotifications(results); setStep("done"); }} />
          )}
        </div>

        <aside className="booking-summary">
          <p className="eyebrow">YOUR TRIP</p>
          <h2>{packageData.name}</h2>
          <p>{packageData.summary}</p>
          <dl>
            <div><dt>Destination</dt><dd>{destination.name}</dd></div>
            <div><dt>Duration</dt><dd>{packageData.duration}</dd></div>
            <div><dt>Per traveller</dt><dd>{packageData.price}</dd></div>
            <div><dt>Travellers</dt><dd>{travellers}</dd></div>
            <div><dt>Amount due</dt><dd>{formatAmount(amount)}</dd></div>
          </dl>
          <p className="price-note">Sample package content. Final price, availability and inclusions are confirmed by the travel team.</p>
        </aside>
      </section>
    </main>
  );
}

export function MyBookingsPage() {
  const { user, checking, signInWithGoogle } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signInError, setSignInError] = useState("");

  useSeo({ title: "Your bookings", url: `${window.location.origin}/bookings` });

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    setLoading(true);
    listBookingsForGuest(user.email)
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [user?.email]);

  return (
    <main id="main" className="booking-page">
      <section className="section-shell booking-list-page">
        <header className="booking-list-header">
          <p className="eyebrow">YOUR TRIPS</p>
          <h1>Your <em>bookings.</em></h1>
          <p>Bookings are tied to the email address you signed in with.</p>
        </header>

        {!user && !checking && (
          <div className="booking-lock">
            <p>Sign in with Google to see the bookings made with your email address.</p>
            <button
              className="admin-signin-button"
              type="button"
              onClick={() => {
                setSignInError("");
                signInWithGoogle().catch((error) => {
                  setSignInError(error?.message || "Could not complete sign-in. Please try again.");
                });
              }}
            >
              Sign in with Google
            </button>
            {signInError && <p className="booking-message is-error">{signInError}</p>}
          </div>
        )}

        {loading && <p className="journal-status">Loading your bookings…</p>}

        {!loading && user && bookings.length === 0 && (
          <div className="booking-lock">
            <p>No bookings yet for {user.email}.</p>
            <Link className="text-link" to="/#packages">Browse tour packages <span aria-hidden="true">↗</span></Link>
          </div>
        )}

        {bookings.length > 0 && (
          <ul className="booking-cards">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <Link to={`/bookings/${booking.id}`}>
                  <div className="booking-card-top">
                    <span>{booking.reference}</span>
                    <span className={`booking-status-pill is-${booking.status}`}>{BOOKING_STATUS_LABELS[booking.status] ?? booking.status}</span>
                  </div>
                  <h2>{booking.packageName}</h2>
                  <p>{booking.destinationName} · {formatDate(booking.travelDate)} · {booking.travelers} traveller{booking.travelers === 1 ? "" : "s"}</p>
                  <div className="booking-card-bottom">
                    <span>{formatAmount(booking.amount)}</span>
                    <span>View status <span aria-hidden="true">↗</span></span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export function BookingStatusPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useSeo({ title: "Booking status", url: `${window.location.origin}/bookings/${id}` });

  useEffect(() => {
    setLoading(true);
    getBookingById(id)
      .then(setBooking)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <main id="main" className="booking-page">
      <section className="section-shell booking-list-page">
        <nav className="package-breadcrumb" aria-label="Breadcrumb">
          <Link to="/bookings">Your bookings</Link><span aria-hidden="true">/</span>
          <span aria-current="page">{id}</span>
        </nav>

        {loading && <p className="journal-status">Loading booking…</p>}

        {!loading && !booking && (
          <div className="booking-lock">
            <p className="eyebrow">BOOKING NOT FOUND</p>
            <h1>We can’t show that booking.</h1>
            <p>
              {user
                ? "This booking isn’t linked to your signed-in email, or it doesn’t exist."
                : "Sign in with the email you booked with to see this booking."}
            </p>
            <Link className="text-link" to="/bookings">Back to your bookings <span aria-hidden="true">↗</span></Link>
          </div>
        )}

        {booking && (
          <>
            <header className="booking-list-header">
              <p className="eyebrow">BOOKING {booking.reference}</p>
              <h1>{booking.packageName}</h1>
              <p>
                <span className={`booking-status-pill is-${booking.status}`}>{BOOKING_STATUS_LABELS[booking.status] ?? booking.status}</span>
              </p>
            </header>

            <div className="booking-confirmation-card">
              <dl>
                <div><dt>Reference</dt><dd>{booking.reference}</dd></div>
                <div><dt>Destination</dt><dd>{booking.destinationName}</dd></div>
                <div><dt>Guest</dt><dd>{booking.guestName}</dd></div>
                <div><dt>Email</dt><dd>{booking.email}</dd></div>
                <div><dt>Phone</dt><dd>{booking.phone}</dd></div>
                <div><dt>Travel date</dt><dd>{formatDate(booking.travelDate)}</dd></div>
                <div><dt>Travellers</dt><dd>{booking.travelers}</dd></div>
                <div><dt>Amount</dt><dd>{formatAmount(booking.amount, booking.currency)}</dd></div>
                <div><dt>Payment</dt><dd>{booking.payment.status === "paid" ? `Paid · ${booking.payment.reference}` : "Not paid"}</dd></div>
                {booking.notes && <div><dt>Notes</dt><dd>{booking.notes}</dd></div>}
              </dl>
            </div>

            <section className="booking-history" aria-labelledby="booking-history-title">
              <h2 id="booking-history-title">Status history</h2>
              <ol>
                {booking.history.map((entry, index) => (
                  <li key={`${entry.status}-${index}`}>
                    <span className="booking-history-dot" aria-hidden="true"></span>
                    <div>
                      <strong>{BOOKING_STATUS_LABELS[entry.status] ?? entry.status}</strong>
                      <span>{formatDate(entry.at)}</span>
                      {entry.note && <p>{entry.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
