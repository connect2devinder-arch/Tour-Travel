import React, { useEffect, useMemo, useState } from "react";
import { AdminGate, AdminNav } from "./AdminGate.jsx";
import { useSeo } from "./seo.js";
import {
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
  formatAmount,
  formatDate,
  listBookingsForAdmin,
  listNotifications,
  markNotificationSent,
  recordBookingNotifications,
  updateBookingStatus,
} from "./bookings.js";

const TRIGGER_LABELS = {
  booking_created: "Booking created",
  payment_received: "Payment received",
  status_changed: "Status changed",
  enquiry_received: "Enquiry received",
};

export function AdminBookings() {
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [busyId, setBusyId] = useState("");

  useSeo({ title: "Booking admin", url: `${window.location.origin}/admin/bookings` });

  async function loadBookings() {
    const result = await listBookingsForAdmin();
    setBookings(result);
  }

  async function loadNotifications() {
    const result = await listNotifications();
    setNotifications(result);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([loadBookings(), loadNotifications()])
      .catch(() => setError("Couldn’t load the bookings."))
      .finally(() => setLoading(false));
  }, []);

  const visibleBookings = useMemo(() => {
    const term = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesFilter = filter === "all" || booking.status === filter;
      if (!matchesFilter) return false;
      if (!term) return true;
      return [booking.reference, booking.guestName, booking.email, booking.packageName, booking.destinationName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [bookings, filter, search]);

  async function handleStatusChange(booking, nextStatus) {
    setBusyId(booking.id);
    setError("");
    setMessage("");
    try {
      const updated = await updateBookingStatus(booking.id, nextStatus);
      await recordBookingNotifications(updated, "status_changed");
      await loadBookings();
      await loadNotifications();
      setMessage(`Booking ${booking.reference} is now ${BOOKING_STATUS_LABELS[nextStatus]}. Email and SMS notifications were queued.`);
    } catch (err) {
      setError(err?.message || "Couldn’t update the booking.");
    } finally {
      setBusyId("");
    }
  }

  async function handleMarkSent(notification) {
    setBusyId(notification.id);
    try {
      await markNotificationSent(notification.id);
      await loadNotifications();
    } catch (err) {
      setError(err?.message || "Couldn’t update the notification.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <AdminGate>
      <main id="main" className="admin-page">
        <header className="admin-header section-shell">
          <div>
            <p className="eyebrow">BOOKING ADMIN</p>
            <h1>Every booking, <em>accounted for.</em></h1>
          </div>
        </header>

        <AdminNav active="Bookings" />

        <div className="section-shell admin-tabs" role="tablist" aria-label="Booking admin views">
          <button type="button" role="tab" aria-selected={tab === "bookings"} className={`admin-tab${tab === "bookings" ? " is-active" : ""}`} onClick={() => setTab("bookings")}>
            Bookings ({bookings.length})
          </button>
          <button type="button" role="tab" aria-selected={tab === "notifications"} className={`admin-tab${tab === "notifications" ? " is-active" : ""}`} onClick={() => setTab("notifications")}>
            Notifications ({notifications.length})
          </button>
        </div>

        {error && <p className="section-shell journal-status journal-status-error">{error}</p>}
        {message && <p className="section-shell admin-message">{message}</p>}

        {tab === "bookings" && (
          <section className="section-shell admin-list" aria-live="polite">
            <div className="admin-toolbar">
              <div className="admin-filters">
                {["all", ...BOOKING_STATUSES].map((status) => (
                  <button
                    type="button"
                    key={status}
                    className={`admin-filter-chip${filter === status ? " is-active" : ""}`}
                    onClick={() => setFilter(status)}
                  >
                    {status === "all" ? "All" : BOOKING_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
              <label className="admin-search">
                <span className="visually-hidden">Search bookings</span>
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Reference, name, email or package" />
              </label>
            </div>

            {loading && <p className="journal-status">Loading bookings…</p>}
            {!loading && visibleBookings.length === 0 && (
              <p className="journal-status">No bookings match this view yet.</p>
            )}

            {visibleBookings.map((booking) => (
              <article className={`admin-group admin-booking${expandedId === booking.id ? " is-open" : ""}`} key={booking.id}>
                <button type="button" className="admin-booking-head" onClick={() => setExpandedId(expandedId === booking.id ? "" : booking.id)} aria-expanded={expandedId === booking.id}>
                  <div>
                    <h2>{booking.reference}</h2>
                    <p>{booking.packageName} · {booking.guestName} · {formatDate(booking.travelDate)}</p>
                  </div>
                  <div className="admin-booking-head-right">
                    <span className={`booking-status-pill is-${booking.status}`}>{BOOKING_STATUS_LABELS[booking.status]}</span>
                    <span className="admin-booking-amount">{formatAmount(booking.amount)}</span>
                  </div>
                </button>

                {expandedId === booking.id && (
                  <div className="admin-booking-body">
                    <dl className="admin-booking-facts">
                      <div><dt>Guest</dt><dd>{booking.guestName}</dd></div>
                      <div><dt>Email</dt><dd>{booking.email}</dd></div>
                      <div><dt>Phone</dt><dd>{booking.phone}</dd></div>
                      <div><dt>Package</dt><dd>{booking.packageName} · {booking.destinationName}</dd></div>
                      <div><dt>Travel date</dt><dd>{formatDate(booking.travelDate)}</dd></div>
                      <div><dt>Travellers</dt><dd>{booking.travelers}</dd></div>
                      <div><dt>Amount</dt><dd>{formatAmount(booking.amount)}</dd></div>
                      <div><dt>Payment</dt><dd>{booking.payment.status === "paid" ? `Paid · ${booking.payment.reference}` : "Not paid"}</dd></div>
                      {booking.notes && <div><dt>Notes</dt><dd>{booking.notes}</dd></div>}
                    </dl>

                    <div className="admin-booking-history">
                      <h3>Status history</h3>
                      <ol>
                        {booking.history.map((entry, index) => (
                          <li key={`${entry.status}-${index}`}>
                            <strong>{BOOKING_STATUS_LABELS[entry.status] ?? entry.status}</strong>
                            <span>{formatDate(entry.at)}</span>
                            {entry.note && <p>{entry.note}</p>}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="admin-booking-actions">
                      <label className="admin-field">
                        <span>Booking status</span>
                        <select
                          value={booking.status}
                          disabled={busyId === booking.id}
                          onChange={(event) => handleStatusChange(booking, event.target.value)}
                        >
                          {BOOKING_STATUSES.map((status) => (
                            <option value={status} key={status}>{BOOKING_STATUS_LABELS[status]}</option>
                          ))}
                        </select>
                      </label>
                      <p className="admin-demo-note">Changing the status queues a fresh email and SMS notification for this booking.</p>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}

        {tab === "notifications" && (
          <section className="section-shell admin-list" aria-live="polite">
            {loading && <p className="journal-status">Loading notifications…</p>}
            {!loading && notifications.length === 0 && (
              <p className="journal-status">No notifications yet. They are created when a booking is made, paid for, or updated.</p>
            )}

            {notifications.map((notification) => (
              <article className="admin-group admin-notification" key={notification.id}>
                <div className="admin-group-head">
                  <h2>{notification.subject || "Notification"}</h2>
                  <span className={`admin-status-pill ${notification.status === "sent" ? "is-published" : "is-draft"}`}>
                    {notification.status === "sent" ? "Sent" : "Queued"}
                  </span>
                </div>
                <div className="admin-package-meta">
                  <span className="notification-channel">{notification.channel.toUpperCase()}</span>
                  <span>{notification.recipient}</span>
                  <span>{TRIGGER_LABELS[notification.trigger] ?? notification.trigger}</span>
                  {notification.targetType === "enquiry"
                    ? <span>Contact form</span>
                    : <span>{notification.reference}</span>}
                </div>
                <p className="admin-notification-body">{notification.body}</p>
                <div className="admin-notification-actions">
                  <button
                    type="button"
                    className="journal-filter-button"
                    disabled={busyId === notification.id || notification.status === "sent"}
                    onClick={() => handleMarkSent(notification)}
                  >
                    Mark sent
                  </button>
                  <span className="admin-demo-note">Delivery is simulated in this POC — no provider is connected.</span>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </AdminGate>
  );
}
