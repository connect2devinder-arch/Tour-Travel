import React, { useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { destinations, experiences } from "./mockData.js";
import { aboutContent } from "./aboutContent.js";
import { siteAddress, siteConfig } from "./siteConfig.js";
import { firebaseAuth, firebaseConfigured, googleProvider, saveContactEnquiry } from "./firebase.js";
import { Link, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

function Brand({ footer = false }) {
  return (
    <a className={`brand${footer ? " footer-brand" : ""}`} href="/#top" aria-label="Elsewhere home">
      <span className="brand-mark" aria-hidden="true">e</span>elsewhere<span className="brand-period">.</span>
    </a>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const location = useLocation();
  const closeMenu = () => setMenuOpen(false);
  const sectionHref = (id) => location.pathname === "/" ? `#${id}` : `/#${id}`;

  useEffect(() => {
    if (!firebaseAuth) return undefined;
    return onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);
      setAuthMessage("");
    });
  }, []);

  async function handleAuthAction() {
    if (!firebaseAuth) {
      setAuthMessage("Firebase sign-in is not configured for this build.");
      return;
    }

    setAuthLoading(true);
    setAuthMessage("");
    try {
      if (user) {
        await signOut(firebaseAuth);
      } else {
        await signInWithPopup(firebaseAuth, googleProvider);
      }
    } catch (error) {
      const messages = {
        "auth/operation-not-allowed": "Google sign-in is not enabled for this Firebase project yet.",
        "auth/unauthorized-domain": "This domain is not authorized for Firebase sign-in yet.",
        "auth/popup-closed-by-user": "Google sign-in was cancelled.",
      };
      setAuthMessage(messages[error.code] || "Could not complete Google sign-in. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <>
      <header className="site-header">
        <Brand />
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span></span><span></span>
        </button>
        <nav className={`primary-nav${menuOpen ? " is-open" : ""}`} id="primary-nav" aria-label="Main navigation">
          <a href={sectionHref("destinations")} onClick={closeMenu}>Destinations</a>
          <a href={sectionHref("packages")} onClick={closeMenu}>Packages</a>
          <a href={sectionHref("experiences")} onClick={closeMenu}>Experiences</a>
          <a href={sectionHref("about")} onClick={closeMenu}>About</a>
          <a href={sectionHref("contact")} onClick={closeMenu}>Contact</a>
          <a href={sectionHref("our-way")} onClick={closeMenu}>Our way</a>
        </nav>
        <div className="header-actions">
          {user ? (
            <div className="signed-in-user">
              <span className="signed-in-name" title={user.email || user.displayName}>{user.displayName || user.email}</span>
              <button className="auth-button" type="button" aria-label="Sign out" onClick={handleAuthAction} disabled={authLoading}>
                <span className="auth-button-label">{authLoading ? "Signing out…" : "Sign out"}</span><span aria-hidden="true">↪</span>
              </button>
            </div>
          ) : (
            <button className="auth-button google-auth-button" type="button" aria-label="Sign in with Google" onClick={handleAuthAction} disabled={authLoading || !firebaseAuth}>
              <GoogleMark /><span className="auth-button-label">{authLoading ? "Signing in…" : "Sign in with Google"}</span>
            </button>
          )}
          <a className="header-cta" href={sectionHref("plan")} onClick={closeMenu}>Plan your trip <span aria-hidden="true">↗</span></a>
        </div>
      </header>
      {authMessage && <p className="auth-feedback" role="status" aria-live="polite">{authMessage}</p>}
    </>
  );
}

function GoogleMark() {
  return (
    <svg className="google-mark" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.3A20 20 0 0 0 24 44Z" />
      <path fill="#FBBC05" d="M12.8 27.7a12 12 0 0 1 0-7.4V15H5.9a20 20 0 0 0 0 17.9l6.9-5.2Z" />
      <path fill="#EA4335" d="M24 12.1c3 0 5.6 1 7.7 3.1l5.8-5.8C34 5.9 29.5 4 24 4A20 20 0 0 0 5.9 15l6.9 5.3c1.6-4.7 6-8.2 11.2-8.2Z" />
    </svg>
  );
}

function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-image" role="img" aria-label="A hill town surrounded by the Himalayan mountains"></div>
      <div className="hero-content">
        <p className="eyebrow hero-eyebrow"><span></span> FOR THE LOVE OF GETTING LOST</p>
        <h1 id="hero-title">Find your kind<br />of <em>mountain escape.</em></h1>
        <p className="hero-copy">From Shimla’s pine-lined streets to Spiti’s high roads, find an Indian hill escape that feels like yours.</p>
        <a className="text-link hero-link" href="#plan">Plan your trip <span aria-hidden="true">↓</span></a>
      </div>
        <div className="hero-caption"><span>HIMACHAL PRADESH, INDIA</span><span>31° 06′ N &nbsp; 77° 10′ E</span></div>
      <div className="hero-counter"><span>01</span><span className="counter-line"></span><span>04</span></div>
    </section>
  );
}

function TripSearch({ onSearch }) {
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  function handleSubmit(event) {
    event.preventDefault();
    onSearch({ query: query.trim(), date, guests });
  }

  return (
    <section className="search-wrap" id="plan" aria-label="Plan your trip">
      <form className="trip-search" onSubmit={handleSubmit}>
        <label className="search-field destination-field">
          <span className="field-icon" aria-hidden="true">⌖</span>
          <span className="field-content"><span className="field-label">Where to?</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Anywhere you like" autoComplete="off" /></span>
        </label>
        <label className="search-field date-field">
          <span className="field-icon" aria-hidden="true">▦</span>
          <span className="field-content"><span className="field-label">When?</span><input type="date" aria-label="Travel date" min={minDate} value={date} onChange={(event) => setDate(event.target.value)} /></span>
        </label>
        <label className="search-field guest-field">
          <span className="field-icon guest-icon" aria-hidden="true">♙</span>
          <span className="field-content"><span className="field-label">Who’s going?</span><select aria-label="Number of travelers" value={guests} onChange={(event) => setGuests(event.target.value)}><option value="1">Just me</option><option value="2">2 travelers</option><option value="3">3 travelers</option><option value="4">4+ travelers</option></select></span>
        </label>
        <button className="search-button" type="submit"><span>Find a trip</span><span aria-hidden="true">↗</span></button>
      </form>
    </section>
  );
}

function DestinationCard({ destination, index, onExplore, saved, onToggleSave }) {
  const large = index === 0;
  return (
    <article className={`destination-card${large ? " destination-large" : ""}`}>
      <img src={destination.image} alt={destination.imageAlt} loading="lazy" />
      <div className="card-shade"></div>
      <div className="card-topline">
        <span>{destination.country.toUpperCase()}</span>
        <button className="save-button" type="button" aria-label={`${saved ? "Remove saved" : "Save"} ${destination.name}`} aria-pressed={saved} onClick={() => onToggleSave(destination.id)}>{saved ? "♥" : "♡"}</button>
      </div>
      <div className="destination-info">
        <p>{destination.tagline}</p>
        <h3>{destination.name}</h3>
        <button className="card-explore" type="button" onClick={() => onExplore(destination)}>Explore <span aria-hidden="true">↗</span></button>
      </div>
    </article>
  );
}

function DestinationCards({ items, onExplore, savedIds, onToggleSave }) {
  return (
    <div className="destination-grid">
      {items.map((destination, index) => (
        <DestinationCard
          key={destination.id}
          destination={destination}
          index={index}
          onExplore={onExplore}
          saved={savedIds.includes(destination.id)}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}

function SearchResults({ query, results, onExplore, savedIds, onToggleSave, sectionRef }) {
  return (
    <section className="search-results section-shell" ref={sectionRef} aria-labelledby="results-title" aria-live="polite">
      <div className="section-heading">
        <div><p className="eyebrow">YOUR NEXT SOMEWHERE</p><h2 id="results-title">{query ? <>Ideas for <em>“{query}”</em></> : <>A few places <em>we love.</em></>}</h2></div>
      </div>
      {results.length > 0 ? (
        <DestinationCards items={results} onExplore={onExplore} savedIds={savedIds} onToggleSave={onToggleSave} />
      ) : (
        <div className="empty-state"><p>No places found for “{query}” just yet.</p><span>Try Shimla, Manali, Lahaul &amp; Spiti, or Mussoorie.</span></div>
      )}
    </section>
  );
}

function DestinationDetails({ destination, onClose }) {
  const places = destination.places;
  const [activeIndex, setActiveIndex] = useState(0);
  const activePlace = places[activeIndex];

  function goToPlace(index) {
    setActiveIndex((index + places.length) % places.length);
  }

  return (
    <section className="destination-detail section-shell" aria-labelledby="detail-title">
      <div className="detail-heading">
        <div><p className="eyebrow">A CLOSER LOOK · {destination.country.toUpperCase()}</p><h2 id="detail-title">A little more <em>{destination.name}.</em></h2></div>
        <button className="detail-close" type="button" onClick={onClose}>Back to places <span aria-hidden="true">↑</span></button>
      </div>
      <div className="detail-layout">
        <div className="place-carousel" aria-label={`${destination.name} tourist places`}>
          <div className="place-carousel-stage">
            <img className="place-carousel-image" src={activePlace.image} alt={activePlace.alt} />
            <button className="carousel-arrow carousel-prev" type="button" aria-label="Previous place" onClick={() => goToPlace(activeIndex - 1)}>←</button>
            <button className="carousel-arrow carousel-next" type="button" aria-label="Next place" onClick={() => goToPlace(activeIndex + 1)}>→</button>
          </div>
          <div className="place-carousel-caption">
            <h3>{activePlace.name}</h3>
            <span>{activeIndex + 1} of {places.length} · {destination.name}</span>
          </div>
          <div className="carousel-dots" role="tablist" aria-label="Place navigation">
            {places.map((place, index) => (
              <button key={place.slug} type="button" role="tab" aria-selected={index === activeIndex} aria-label={`Show ${place.name}`} className={`carousel-dot${index === activeIndex ? " is-active" : ""}`} onClick={() => goToPlace(index)} />
            ))}
          </div>
        </div>
        <div className="detail-copy">
          <p className="eyebrow">THE FEEL OF THE PLACE</p>
          <p className="detail-description">{destination.description}</p>
          <h3>Worth the wander</h3>
          <ul className="attraction-list">{destination.attractions.map((attraction) => <li key={attraction}>{attraction}</li>)}</ul>
          <p className="price-note">*Illustrative sample prices in INR; not live quotes.</p>
        </div>
      </div>
      <div className="detail-packages">
        <div className="detail-subheading"><div><p className="eyebrow">A FEW WAYS TO GO</p><h3>Choose your <em>kind of trip.</em></h3></div></div>
        <div className="detail-package-grid">
          {destination.packages.map((trip) => (
            <article className="detail-package" key={trip.id}>
              <div className="detail-package-top"><span>{trip.duration}</span><span>Starting from {trip.price}</span></div>
              <h4>{trip.name}</h4>
              <p className="package-place">{destination.name}, {destination.country}</p>
              <h5>Sample itinerary</h5>
              <ol>{trip.itinerary.map((day, index) => <li key={`${trip.id}-${index}`}><span>DAY {String(index + 1).padStart(2, "0")}</span>{day}</li>)}</ol>
              <Link className="detail-package-link" to={`/packages/${trip.id}`}>View full package details <span aria-hidden="true">↗</span></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedPackages() {
  const packages = destinations.flatMap((destination) =>
    destination.packages.slice(0, 1).map((trip) => ({ ...trip, destination })),
  );

  return (
    <section className="featured-packages section-shell" id="packages" aria-labelledby="packages-title">
      <div className="section-heading">
        <div><p className="eyebrow">THOUGHTFUL TRIPS, NO GUESSWORK</p><h2 id="packages-title">A good place to <em>begin.</em></h2></div>
        <p className="heading-note">Sample trips to get your<br />daydream going.</p>
      </div>
      <div className="package-grid">
        {packages.map((trip) => (
          <article className="package-card" key={trip.id}>
            <Link className="package-image-button" to={`/packages/${trip.id}`} aria-label={`View ${trip.name} package details`}>
              <img src={trip.destination.image} alt={trip.destination.imageAlt} loading="lazy" />
              <span className="package-image-label">{trip.destination.country.toUpperCase()}</span>
            </Link>
            <div className="package-card-copy">
              <p className="package-place">{trip.destination.name} · {trip.duration}</p>
              <h3>{trip.name}</h3>
              <p className="package-summary">{trip.summary}</p>
              <ul className="package-inclusion-preview">{trip.inclusions.slice(0, 2).map((inclusion) => <li key={inclusion}>{inclusion}</li>)}</ul>
              <div className="package-card-bottom"><span>Starting from {trip.price}<small>* sample price</small></span><Link to={`/packages/${trip.id}`}>View details <span aria-hidden="true">↗</span></Link></div>
            </div>
          </article>
        ))}
      </div>
      <p className="price-note">*Illustrative sample prices in INR; not live quotes.</p>
    </section>
  );
}

function PackageDetailPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const packageData = destinations.flatMap((destination) =>
    destination.packages.map((trip) => ({ ...trip, destination })),
  ).find((trip) => trip.id === packageId);

  if (!packageData) {
    return (
      <main id="main" className="package-not-found section-shell">
        <p className="eyebrow">TRIP NOT FOUND</p>
        <h1>Looks like this trip took another turn.</h1>
        <Link className="text-link" to="/#packages">Back to tour packages <span aria-hidden="true">↗</span></Link>
      </main>
    );
  }

  const { destination, ...trip } = packageData;
  const activePhoto = destination.photos[activePhotoIndex] || destination.photos[0];
  const enquiryUrl = `/?package=${encodeURIComponent(trip.id)}#contact`;

  return (
    <main id="main" className="package-detail-page">
      <nav className="package-breadcrumb section-shell" aria-label="Breadcrumb">
        <Link to="/#top">Home</Link><span aria-hidden="true">/</span><Link to="/#packages">Tour packages</Link><span aria-hidden="true">/</span><span aria-current="page">{trip.name}</span>
      </nav>
      <section className="package-detail section-shell" aria-labelledby="package-title">
        <header className="package-detail-heading">
          <div>
            <p className="eyebrow">{destination.name.toUpperCase()} · {destination.country.toUpperCase()}</p>
            <h1 id="package-title">{trip.name}</h1>
            <p>{trip.summary}</p>
          </div>
          <div className="package-price-card">
            <span>{trip.duration}</span>
            <strong>Starting from {trip.price}</strong>
            <small>* Illustrative sample price</small>
            <button type="button" onClick={() => navigate(enquiryUrl)}>Enquire about this trip <span aria-hidden="true">↗</span></button>
          </div>
        </header>

        <div className="package-detail-gallery-layout">
          <div className="package-detail-gallery">
            <img className="package-detail-main-image" src={activePhoto.src} alt={activePhoto.alt} />
            <div className="package-detail-thumbnails" aria-label={`${trip.name} photos`}>
              {destination.photos.map((photo, index) => (
                <button className={`detail-thumbnail${index === activePhotoIndex ? " is-active" : ""}`} type="button" key={photo.src} aria-label={`Show package photo ${index + 1}`} aria-pressed={index === activePhotoIndex} onClick={() => setActivePhotoIndex(index)}>
                  <img src={photo.src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
          <div className="package-info-panel">
            <section aria-labelledby="package-inclusions-title">
              <p className="eyebrow">WHAT’S INCLUDED · SAMPLE</p>
              <h2 id="package-inclusions-title">The good bits.</h2>
              <ul className="package-inclusions-list">{trip.inclusions.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
            <div className="stay-transport-grid">
              <article className="stay-transport-card">
                <p className="eyebrow">YOUR STAY</p>
                <h3>{trip.hotel.category}</h3>
                <p>{trip.hotel.nights}</p>
                <small>{trip.hotel.details}</small>
              </article>
              <article className="stay-transport-card">
                <p className="eyebrow">GETTING AROUND</p>
                <h3>{trip.transport.mode}</h3>
                <p>{trip.transport.details}</p>
              </article>
            </div>
          </div>
        </div>

        <section className="package-itinerary" aria-labelledby="itinerary-title">
          <div className="package-section-heading">
            <p className="eyebrow">A SAMPLE PLAN</p>
            <h2 id="itinerary-title">Day by <em>day.</em></h2>
            <p>Routes, timings, and access can change with season and local conditions.</p>
          </div>
          <ol className="package-day-list">
            {trip.itinerary.map((day, index) => (
              <li className="package-day" key={`${trip.id}-day-${index + 1}`}>
                <span className="package-day-number">DAY {String(index + 1).padStart(2, "0")}</span>
                <span>{day}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="package-faqs" aria-labelledby="package-faq-title">
          <div className="package-section-heading">
            <p className="eyebrow">A FEW USEFUL THINGS</p>
            <h2 id="package-faq-title">Good to <em>know.</em></h2>
          </div>
          <div className="package-faq-list">
            {trip.faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
        <p className="price-note">Sample package content only. Confirm final price, availability, hotel, transport, and inclusions before booking.</p>
      </section>
    </main>
  );
}

function AboutSection() {
  return (
    <section className="about-section" id="about" aria-labelledby="about-title">
      <div className="about-grid">
        <figure className="about-media">
          <img src={aboutContent.image.src} alt={aboutContent.image.alt} loading="lazy" />
          <figcaption>{aboutContent.image.note}</figcaption>
        </figure>
        <div className="about-copy">
          <p className="eyebrow">{aboutContent.eyebrow}</p>
          <h2 id="about-title">{aboutContent.headingLead} <em>{aboutContent.headingHighlight}</em></h2>
          {aboutContent.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 24)}>{paragraph}</p>)}
          <p className="about-closing">{aboutContent.closing}</p>
        </div>
      </div>
      <div className="about-values">
        {aboutContent.values.map((value, index) => (
          <article className="about-value" key={value.title}>
            <span className="about-value-number">{String(index + 1).padStart(2, "0")}</span>
            <h3>{value.title}</h3>
            <p>{value.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Experiences() {
  return (
    <section className="experiences section-shell" id="experiences" aria-labelledby="experiences-title">
      <div className="section-heading"><div><p className="eyebrow">NOT JUST A CHANGE OF SCENERY</p><h2 id="experiences-title">Go for the <em>feeling.</em></h2></div><p className="heading-note">A few ways to make a place<br />feel like it was made for you.</p></div>
      <div className="experience-grid">
        {experiences.map((experience) => (
          <a className="experience-card" href="#plan" key={experience.number}>
            <span className="experience-number">{experience.number}</span><span className="experience-icon" aria-hidden="true">{experience.icon}</span>
            <h3>{experience.title}</h3><p>{experience.description}</p><span className="experience-arrow" aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function ContactForm() {
  const [submissionStatus, setSubmissionStatus] = useState("idle");
  const [searchParams] = useSearchParams();
  const packageIdFromUrl = searchParams.get("package") || "";
  const [selectedPackageId, setSelectedPackageId] = useState(packageIdFromUrl);
  const packageOptions = destinations.flatMap((destination) =>
    destination.packages.map((trip) => ({ ...trip, destination })),
  );
  const selectedPackage = packageOptions.find((trip) => trip.id === selectedPackageId);
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    setSelectedPackageId(packageIdFromUrl);
    if (packageIdFromUrl) {
      requestAnimationFrame(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [packageIdFromUrl]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!firebaseConfigured) {
      setSubmissionStatus("error-config");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    setSubmissionStatus("saving");

    try {
      await saveContactEnquiry({
        name: String(formData.get("name")).trim(),
        email: String(formData.get("email")).trim(),
        phone: String(formData.get("phone")).trim(),
        destination: String(formData.get("destination")),
        packageId: selectedPackageId,
        packageName: selectedPackage?.name || "",
        travelDate: formData.get("travelDate") || null,
        travelers: String(formData.get("travelers")),
        message: String(formData.get("message") || "").trim(),
      });
      form.reset();
      setSelectedPackageId("");
      setSubmissionStatus("success");
    } catch {
      setSubmissionStatus("error");
    }
  }

  const statusMessages = {
    idle: "Your details will only be used to respond to this trip enquiry.",
    saving: "Saving your enquiry…",
    success: "Thanks! Your enquiry has been saved.",
    error: "We couldn’t save your enquiry. Please try again.",
    "error-config": "Firestore is not configured for this build.",
  };

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="contact-intro">
        <p className="eyebrow">LET’S MAKE A PLAN</p>
        <h2 id="contact-title">Your next trip starts <em>here.</em></h2>
        <p>Share a few details about your trip and we’ll help you find a good place to begin.</p>
        <span className="contact-detail-note">A small first step toward somewhere new.</span>
      </div>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-fields">
          <label className="contact-field" htmlFor="contact-name">
            <span>Your name</span>
            <input id="contact-name" name="name" type="text" maxLength="100" placeholder="Full name" autoComplete="name" required onChange={() => setSubmissionStatus("idle")} />
          </label>
          <label className="contact-field" htmlFor="contact-email">
            <span>Email address</span>
            <input id="contact-email" name="email" type="email" maxLength="254" placeholder="you@example.com" autoComplete="email" required onChange={() => setSubmissionStatus("idle")} />
          </label>
          <label className="contact-field" htmlFor="contact-phone">
            <span>Phone number</span>
            <input id="contact-phone" name="phone" type="tel" minLength="7" maxLength="30" placeholder="+91 98765 43210" autoComplete="tel" required onChange={() => setSubmissionStatus("idle")} />
          </label>
          <label className="contact-field" htmlFor="contact-destination">
            <span>Where would you like to go?</span>
            <select id="contact-destination" name="destination" defaultValue="" required onChange={() => setSubmissionStatus("idle")}>
              <option value="" disabled>Select a destination</option>
              {destinations.map((destination) => <option value={destination.id} key={destination.id}>{destination.name}</option>)}
              <option value="not-sure">I’m not sure yet</option>
            </select>
          </label>
          <label className="contact-field" htmlFor="contact-package">
            <span>Tour package <small>Optional</small></span>
            <select id="contact-package" name="packageId" value={selectedPackageId} onChange={(event) => { setSelectedPackageId(event.target.value); setSubmissionStatus("idle"); }}>
              <option value="">Choose a package</option>
              {packageOptions.map((trip) => <option value={trip.id} key={trip.id}>{trip.name} — {trip.destination.name}</option>)}
            </select>
          </label>
          <label className="contact-field" htmlFor="contact-date">
            <span>Preferred travel date <small>Optional</small></span>
            <input id="contact-date" name="travelDate" type="date" min={minDate} onChange={() => setSubmissionStatus("idle")} />
          </label>
          <label className="contact-field" htmlFor="contact-travelers">
            <span>Travellers</span>
            <select id="contact-travelers" name="travelers" defaultValue="2" onChange={() => setSubmissionStatus("idle")}>
              <option value="1">1 traveller</option>
              <option value="2">2 travellers</option>
              <option value="3">3 travellers</option>
              <option value="4">4+ travellers</option>
            </select>
          </label>
          <label className="contact-field contact-message" htmlFor="contact-message">
            <span>Anything else we should know? <small>Optional</small></span>
            <textarea id="contact-message" name="message" rows="4" maxLength="1500" placeholder="Tell us what kind of trip you have in mind…" onChange={() => setSubmissionStatus("idle")}></textarea>
          </label>
        </div>
        <div className="contact-submit-row">
          <p className={`contact-demo-note${submissionStatus === "error" || submissionStatus === "error-config" ? " is-error" : ""}`} role="status" aria-live="polite">{statusMessages[submissionStatus]}</p>
          <button className="contact-submit" type="submit" disabled={submissionStatus === "saving" || !firebaseConfigured}>{submissionStatus === "saving" ? "Saving…" : "Send trip enquiry"} <span aria-hidden="true">↗</span></button>
        </div>
      </form>
      <div className="contact-details">
        <a className="contact-detail" href={`tel:${siteConfig.phone.dial}`}><span>Call us</span><strong>{siteConfig.phone.display}</strong></a>
        <div className="contact-detail"><span>Visit us</span><address>{siteAddress}</address></div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubscribed(true);
    setEmail("");
  }

  return (
    <section className="newsletter" id="newsletter">
      <div><p className="eyebrow">A GOOD THING IN YOUR INBOX</p><h2>Postcards from <em>elsewhere.</em></h2><p>Fresh places, thoughtful stories, and a little nudge to use your vacation days.</p></div>
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="email-input">Your email address</label>
        <input id="email-input" type="email" placeholder="Your email address" value={email} onChange={(event) => { setEmail(event.target.value); setSubscribed(false); }} required />
        <button type="submit" aria-label="Subscribe to the newsletter">Count me in <span aria-hidden="true">↗</span></button>
        <p className="newsletter-status" aria-live="polite">{subscribed ? "Thanks! Newsletter sign-up is a demo for now." : "No spam. Just good places."}</p>
      </form>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <Brand footer />
      <p>Take the long way around.</p>
      <a className="footer-contact" href={`tel:${siteConfig.phone.dial}`}>{siteConfig.phone.display}</a>
      <span className="footer-address">{siteAddress}</span>
      <a className="footer-about" href="/#about">About</a>
      <span>© {new Date().getFullYear()} {siteConfig.companyName}</span>
      <a className="back-top" href="/#top">Back to top ↑</a>
    </footer>
  );
}

function HomePage() {
  const [search, setSearch] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const resultsRef = useRef(null);
  const detailRef = useRef(null);

  const searchResults = useMemo(() => {
    if (!search) return [];
    const query = search.query.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!query) return destinations;
    return destinations.filter((destination) => `${destination.name} ${destination.country} ${destination.tags}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").includes(query));
  }, [search]);

  function handleSearch(criteria) {
    setSearch(criteria);
    setSelectedDestination(null);
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function openDestination(destination) {
    setSelectedDestination(destination);
    requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function toggleSaved(id) {
    setSavedIds((current) => current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id]);
  }

  return (
    <main id="main">
      <Hero />
      <TripSearch onSearch={handleSearch} />
      {search && (
        <div ref={resultsRef}>
          <SearchResults query={search.query} results={searchResults} onExplore={openDestination} savedIds={savedIds} onToggleSave={toggleSaved} />
        </div>
      )}
      {selectedDestination && (
        <div ref={detailRef}>
          <DestinationDetails key={selectedDestination.id} destination={selectedDestination} onClose={() => setSelectedDestination(null)} />
        </div>
      )}
      <section className="destinations section-shell" id="destinations" aria-labelledby="destinations-title">
        <div className="section-heading">
          <div><p className="eyebrow">A LITTLE INSPIRATION</p><h2 id="destinations-title">Somewhere <em>calling?</em></h2></div>
          <a className="text-link section-link" href="#packages">See all places <span aria-hidden="true">↗</span></a>
        </div>
        <DestinationCards items={destinations} onExplore={openDestination} savedIds={savedIds} onToggleSave={toggleSaved} />
      </section>
      <FeaturedPackages />
      <section className="manifesto" id="our-way">
        <div className="manifesto-image" role="img" aria-label="Mountain peaks and forested slopes in the Himalayas"></div>
        <div className="manifesto-copy"><p className="eyebrow">TRAVEL, A LITTLE MORE HUMAN</p><h2>Go beyond<br />the <em>postcard.</em></h2><p>We believe the best trips aren’t about ticking places off a list. They’re about the long lunch that turns into dinner, the road you didn’t plan to take, and the people who make you feel at home.</p><a className="text-link" href="#newsletter">Get to know us <span aria-hidden="true">↗</span></a></div>
        <span className="manifesto-note">TAKE THE SCENIC ROUTE</span>
      </section>
      <AboutSection />
      <Experiences />
      <ContactForm />
      <Newsletter />
    </main>
  );
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/packages/:packageId" element={<PackageDetailPage />} />
        <Route path="*" element={<PackageDetailPage />} />
      </Routes>
      <Footer />
    </>
  );
}
