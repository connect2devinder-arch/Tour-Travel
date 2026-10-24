import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminGate, AdminNav } from "./AdminGate.jsx";
import { usePackages } from "./PackagesContext.jsx";
import { useSeo } from "./seo.js";
import { slugify } from "./blog.js";
import { destinations as sampleDestinations } from "./mockData.js";
import { deletePackage, getPackageById, listAllPackagesForAdmin, savePackage, uploadPackageImage } from "./packages.js";

const EMPTY_PACKAGE = {
  name: "",
  slug: "",
  destinationId: sampleDestinations[0]?.id ?? "",
  priceLabel: "",
  priceAmount: 0,
  duration: "",
  summary: "",
  itinerary: [],
  inclusions: [],
  hotel: { category: "", nights: "", details: "" },
  transport: { mode: "", details: "" },
  faqs: [],
  photos: [],
  status: "draft",
  featured: false,
  position: 0,
};

function destinationName(destinationId) {
  return sampleDestinations.find((destination) => destination.id === destinationId)?.name ?? "—";
}

export function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useSeo({ title: "Package admin", url: `${window.location.origin}/admin/packages` });

  function load() {
    setLoading(true);
    listAllPackagesForAdmin()
      .then((result) => { setPackages(result); setError(""); })
      .catch(() => setError("Couldn’t load the packages."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <AdminGate>
      <main id="main" className="admin-page">
        <header className="admin-header section-shell">
          <div>
            <p className="eyebrow">PACKAGE ADMIN</p>
            <h1>Shape the <em>trip catalogue.</em></h1>
          </div>
          <Link className="admin-new-link" to="/admin/packages/new">+ New package</Link>
        </header>

        <AdminNav active="Packages" />

        <section className="section-shell admin-list" aria-live="polite">
          {loading && <p className="journal-status">Loading packages…</p>}
          {!loading && error && <p className="journal-status journal-status-error">{error}</p>}
          {!loading && !error && packages.length === 0 && (
            <p className="journal-status">
              No packages yet. Published packages replace the sample ones on the public site — <Link to="/admin/packages/new">create the first</Link>.
            </p>
          )}
          {packages.map((pkg) => (
            <article className="admin-group" key={pkg.id}>
              <div className="admin-group-head">
                <h2>{pkg.name || "Untitled package"}</h2>
                <span className={`admin-status-pill ${pkg.status === "published" ? "is-published" : "is-draft"}`}>
                  {pkg.status === "published" ? "Published" : "Draft"}
                </span>
              </div>
              <div className="admin-package-meta">
                <span>{destinationName(pkg.destinationId)}</span>
                <span>{pkg.priceLabel || "No price"}</span>
                <span>{pkg.duration || "No duration"}</span>
                <span>{pkg.photos.length} photo{pkg.photos.length === 1 ? "" : "s"}</span>
                <Link className="admin-lang" to={`/admin/packages/${pkg.id}`}>Edit</Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </AdminGate>
  );
}

export function AdminPackageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = usePackages();
  const [pkg, setPkg] = useState({ ...EMPTY_PACKAGE });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useSeo({ title: id ? "Edit package" : "New package", url: `${window.location.origin}/admin/packages${id ? `/${id}` : "/new"}` });

  useEffect(() => {
    if (!id) return;
    getPackageById(id)
      .then((result) => { if (result) setPkg(result); })
      .catch(() => setError("Couldn’t load that package."));
  }, [id]);

  const itineraryText = useMemo(() => pkg.itinerary.join("\n"), [pkg.itinerary]);
  const inclusionsText = useMemo(() => pkg.inclusions.join("\n"), [pkg.inclusions]);

  // Images that already exist for the selected destination — the picker lets an
  // admin build a package photo set without uploading anything.
  const destinationImages = useMemo(() => {
    const destination = sampleDestinations.find((item) => item.id === pkg.destinationId);
    if (!destination) return [];
    const images = [
      ...destination.photos.map((photo) => ({ src: photo.src, alt: photo.alt })),
      ...destination.places.map((place) => ({ src: place.image, alt: place.alt })),
    ];
    return [...new Map(images.map((image) => [image.src, image])).values()];
  }, [pkg.destinationId]);

  function update(field, value) {
    setPkg((current) => ({ ...current, [field]: value }));
  }

  function updatePhoto(index, value) {
    setPkg((current) => ({
      ...current,
      photos: current.photos.map((photo, photoIndex) => (photoIndex === index ? { ...photo, alt: value } : photo)),
    }));
  }

  function togglePhoto(image) {
    setPkg((current) => {
      const selected = current.photos.some((photo) => photo.src === image.src);
      return {
        ...current,
        photos: selected
          ? current.photos.filter((photo) => photo.src !== image.src)
          : [...current.photos, { src: image.src, alt: image.alt }],
      };
    });
  }

  function removePhoto(index) {
    setPkg((current) => ({ ...current, photos: current.photos.filter((_, photoIndex) => photoIndex !== index) }));
  }

  function addPhotoByUrl() {
    const url = photoUrl.trim();
    if (!url) return;
    setPkg((current) => ({ ...current, photos: [...current.photos, { src: url, alt: "" }] }));
    setPhotoUrl("");
  }

  async function handlePhotoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Uploading photo…");
    setError("");
    try {
      const url = await uploadPackageImage(file, id || "new");
      setPkg((current) => ({ ...current, photos: [...current.photos, { src: url, alt: current.name || "Package photo" }] }));
      setStatus("Photo uploaded.");
    } catch {
      setError("Photo upload failed. Check that Storage rules allow admin writes under packages/.");
    }
  }

  function updateNested(group, field, value) {
    setPkg((current) => ({ ...current, [group]: { ...current[group], [field]: value } }));
  }

  function updateFaq(index, field, value) {
    setPkg((current) => ({
      ...current,
      faqs: current.faqs.map((faq, faqIndex) => (faqIndex === index ? { ...faq, [field]: value } : faq)),
    }));
  }

  function addFaq() {
    setPkg((current) => ({ ...current, faqs: [...current.faqs, { question: "", answer: "" }] }));
  }

  function removeFaq(index) {
    setPkg((current) => ({ ...current, faqs: current.faqs.filter((_, faqIndex) => faqIndex !== index) }));
  }

  async function handleSave(nextStatus) {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const savedId = await savePackage({ ...pkg, status: nextStatus }, { id });
      await refresh();
      setStatus(nextStatus === "published" ? "Published." : "Draft saved.");
      if (!id) navigate(`/admin/packages/${savedId}`, { replace: true });
      else setPkg((current) => ({ ...current, id: savedId, status: nextStatus }));
    } catch (err) {
      setError(err?.message || "Couldn’t save the package.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm("Delete this package? This cannot be undone.")) return;
    try {
      await deletePackage(id);
      await refresh();
      navigate("/admin/packages");
    } catch {
      setError("Couldn’t delete the package.");
    }
  }

  return (
    <AdminGate>
      <main id="main" className="admin-page">
        <header className="admin-header section-shell">
          <div>
            <p className="eyebrow">{id ? "EDIT PACKAGE" : "NEW PACKAGE"}</p>
            <h1>{id ? pkg.name || "Untitled package" : "Add a trip"}</h1>
          </div>
          <Link className="admin-new-link" to="/admin/packages">← All packages</Link>
        </header>

        <AdminNav active="Packages" />

        <form className="section-shell admin-editor" onSubmit={(event) => event.preventDefault()}>
          <div className="admin-editor-main">
            <label className="admin-field">
              <span>Package name</span>
              <input
                value={pkg.name}
                onChange={(event) => setPkg((current) => ({ ...current, name: event.target.value, slug: slugify(event.target.value) }))}
                placeholder="Shimla Hill Escape"
                required
              />
            </label>

            <label className="admin-field">
              <span>Slug</span>
              <input value={pkg.slug} onChange={(event) => update("slug", slugify(event.target.value))} placeholder="shimla-hill-escape" />
              <small>Used on the package card and detail page.</small>
            </label>

            <div className="admin-field-row">
              <label className="admin-field">
                <span>Price label</span>
                <input value={pkg.priceLabel} onChange={(event) => update("priceLabel", event.target.value)} placeholder="₹15,999*" />
              </label>
              <label className="admin-field">
                <span>Price amount (₹ per traveller)</span>
                <input type="number" min="0" step="100" value={pkg.priceAmount} onChange={(event) => update("priceAmount", event.target.value)} placeholder="15999" />
                <small>Used to calculate the booking amount.</small>
              </label>
            </div>

            <label className="admin-field">
              <span>Duration</span>
              <input value={pkg.duration} onChange={(event) => update("duration", event.target.value)} placeholder="4 days" />
            </label>

            <label className="admin-field">
              <span>Summary</span>
              <textarea rows="3" value={pkg.summary} onChange={(event) => update("summary", event.target.value)} placeholder="One line about what this trip feels like." />
            </label>

            <label className="admin-field">
              <span>Itinerary (one day per line)</span>
              <textarea rows="8" value={itineraryText} onChange={(event) => update("itinerary", event.target.value.split("\n").map((line) => line.trim()).filter(Boolean))} placeholder={"Arrive in Shimla and check in\nExplore Mall Road, The Ridge, and Jakhu Temple"} />
            </label>

            <label className="admin-field">
              <span>Inclusions (one per line)</span>
              <textarea rows="5" value={inclusionsText} onChange={(event) => update("inclusions", event.target.value.split("\n").map((line) => line.trim()).filter(Boolean))} placeholder={"3 nights in a sample hill hotel\nDaily breakfast"} />
            </label>

            <div className="admin-field">
              <span>Package photos</span>
              <small>
                Every package has its own photo set. Pick from the destination images below, upload a new photo, or paste a URL.
                Without photos the package falls back to the destination gallery.
              </small>

              {pkg.photos.length > 0 && (
                <div className="admin-photo-list">
                  {pkg.photos.map((photo, index) => (
                    <div className="admin-photo-row" key={photo.src}>
                      <img src={photo.src} alt="" />
                      <input value={photo.alt} onChange={(event) => updatePhoto(index, event.target.value)} placeholder="Alt text" />
                      <button type="button" className="journal-filter-button" onClick={() => removePhoto(index)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}

              {destinationImages.length > 0 && (
                <div className="admin-photo-picker" role="group" aria-label="Destination images">
                  {destinationImages.map((image) => {
                    const selected = pkg.photos.some((photo) => photo.src === image.src);
                    return (
                      <button
                        type="button"
                        key={image.src}
                        className={`admin-photo-option${selected ? " is-selected" : ""}`}
                        aria-pressed={selected}
                        title={image.alt}
                        onClick={() => togglePhoto(image)}
                      >
                        <img src={image.src} alt="" loading="lazy" />
                      </button>
                    );
                  })}
                </div>
              )}

              <label className="admin-field">
                <span>Upload a photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} />
              </label>

              <div className="admin-field-row">
                <label className="admin-field">
                  <span>Or paste an image URL</span>
                  <input value={photoUrl} onChange={(event) => setPhotoUrl(event.target.value)} placeholder="https://…" />
                </label>
                <button type="button" className="journal-filter-button" onClick={addPhotoByUrl}>Add photo</button>
              </div>
            </div>

            <div className="admin-field">
              <span>FAQs</span>
              <div className="admin-faq-list">
                {pkg.faqs.map((faq, index) => (
                  <div className="admin-faq-row" key={`faq-${index}`}>
                    <input value={faq.question} onChange={(event) => updateFaq(index, "question", event.target.value)} placeholder="Question" />
                    <textarea rows="2" value={faq.answer} onChange={(event) => updateFaq(index, "answer", event.target.value)} placeholder="Answer" />
                    <button type="button" className="journal-filter-button" onClick={() => removeFaq(index)}>Remove</button>
                  </div>
                ))}
                <button type="button" className="journal-filter-button" onClick={addFaq}>+ Add FAQ</button>
              </div>
            </div>
          </div>

          <aside className="admin-editor-side">
            <label className="admin-field">
              <span>Destination</span>
              <select value={pkg.destinationId} onChange={(event) => update("destinationId", event.target.value)}>
                {sampleDestinations.map((destination) => (
                  <option value={destination.id} key={destination.id}>{destination.name}</option>
                ))}
              </select>
              <small>Destinations still come from the bundled sample data.</small>
            </label>

            <label className="admin-field">
              <span>Status</span>
              <select value={pkg.status} onChange={(event) => update("status", event.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>

            <label className="admin-field">
              <span>Position</span>
              <input type="number" min="0" value={pkg.position} onChange={(event) => update("position", event.target.value)} />
              <small>Lower numbers show first.</small>
            </label>

            <label className="admin-check">
              <input type="checkbox" checked={pkg.featured} onChange={(event) => update("featured", event.target.checked)} />
              <span>Feature this package</span>
            </label>

            <div className="admin-field">
              <span>Hotel</span>
              <input value={pkg.hotel.category} onChange={(event) => updateNested("hotel", "category", event.target.value)} placeholder="Sample 3-star hill hotel" />
              <input value={pkg.hotel.nights} onChange={(event) => updateNested("hotel", "nights", event.target.value)} placeholder="3 nights" />
              <textarea rows="2" value={pkg.hotel.details} onChange={(event) => updateNested("hotel", "details", event.target.value)} placeholder="Property name and availability are illustrative." />
            </div>

            <div className="admin-field">
              <span>Transport</span>
              <input value={pkg.transport.mode} onChange={(event) => updateNested("transport", "mode", event.target.value)} placeholder="Private AC cab (sample)" />
              <textarea rows="2" value={pkg.transport.details} onChange={(event) => updateNested("transport", "details", event.target.value)} placeholder="Local sightseeing transfers." />
            </div>
          </aside>

          <div className="admin-editor-actions">
            <div className="admin-messages" aria-live="polite">
              {status && <p className="admin-message">{status}</p>}
              {error && <p className="admin-message is-error">{error}</p>}
            </div>
            <div className="admin-buttons">
              {id && (
                <button className="journal-filter-button" type="button" onClick={handleDelete}>Delete</button>
              )}
              <button className="admin-save-button" type="button" onClick={() => handleSave("draft")} disabled={saving}>Save draft</button>
              <button className="admin-save-button is-primary" type="button" onClick={() => handleSave("published")} disabled={saving}>
                {pkg.status === "published" ? "Update" : "Publish"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </AdminGate>
  );
}
