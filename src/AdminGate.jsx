import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { siteConfig } from "./siteConfig.js";

export function GoogleMark() {
  return (
    <svg className="google-mark" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.3A20 20 0 0 0 24 44Z" />
      <path fill="#FBBC05" d="M12.8 27.7a12 12 0 0 1 0-7.4V15H5.9a20 20 0 0 0 0 17.9l6.9-5.2Z" />
      <path fill="#EA4334" d="M24 12.1c3 0 5.6 1 7.7 3.1l5.8-5.8C34 5.9 29.5 4 24 4A20 20 0 0 0 5.9 15l6.9 5.3c1.6-4.7 6-8.2 11.2-8.2Z" />
    </svg>
  );
}

const ADMIN_NAV_ITEMS = [
  { to: "/admin/journal", label: "Journal" },
  { to: "/admin/packages", label: "Packages" },
  { to: "/admin/bookings", label: "Bookings" },
];

/** Shared navigation across the admin area. */
export function AdminNav({ active }) {
  return (
    <nav className="admin-nav" aria-label="Admin sections">
      {ADMIN_NAV_ITEMS.map((item) => (
        <Link key={item.to} to={item.to} className={`admin-nav-link${active === item.label ? " is-active" : ""}`}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/** Blocks the admin area until the signed-in account is on the admin allowlist. */
export function AdminGate({ children }) {
  const { user, isAdmin, checking, signOut, signInWithGoogle } = useAuth();
  const [signInError, setSignInError] = useState("");

  if (checking) {
    return <main id="main" className="admin-page"><p className="journal-status section-shell">Checking access…</p></main>;
  }

  if (!user) {
    return (
      <main id="main" className="admin-page">
        <div className="section-shell admin-locked">
          <p className="eyebrow">ADMIN</p>
          <h1>Sign in to manage the site.</h1>
          <p>Only accounts on the admin allowlist can open the editor. Sign in with the Google account that runs this site — {siteConfig.adminEmail}.</p>
          <button
            className="admin-signin-button"
            type="button"
            onClick={() => {
              setSignInError("");
              signInWithGoogle().catch((error) => {
                const messages = {
                  "auth/operation-not-allowed": "Google sign-in is not enabled for this Firebase project yet.",
                  "auth/unauthorized-domain": "This domain is not authorized for Firebase sign-in yet.",
                  "auth/popup-closed-by-user": "Sign-in was cancelled.",
                };
                setSignInError(messages[error?.code] || "Could not complete sign-in. Please try again.");
              });
            }}
          >
            <GoogleMark /> Sign in with Google
          </button>
          {signInError && <p className="admin-message is-error">{signInError}</p>}
          <Link className="text-link" to="/">Back to the site <span aria-hidden="true">↗</span></Link>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main id="main" className="admin-page">
        <div className="section-shell admin-locked">
          <p className="eyebrow">ADMIN</p>
          <h1>You’re signed in, but not on the list.</h1>
          <p>Your account ({user.email}) is signed in but isn’t an admin. Admin access is limited to {siteConfig.adminEmail} — sign in with that account.</p>
          <button className="journal-filter-button" type="button" onClick={() => signOut()}>Sign out</button>
        </div>
      </main>
    );
  }

  return children;
}
