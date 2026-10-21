import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { useSeo } from "./seo.js";
import { destinations } from "./mockData.js";
import {
  POST_LANGS,
  POST_TYPES,
  deletePost,
  getPostById,
  listAllPostsForAdmin,
  savePost,
  slugify,
  uploadCoverImage,
} from "./blog.js";

const EMPTY_POST = {
  translationGroup: "",
  lang: "en",
  type: "guide",
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  coverImage: "",
  coverAlt: "",
  tags: [],
  destinationId: "",
  packageId: "",
  status: "draft",
  authorName: "Elsewhere Travel Co.",
  featured: false,
  seo: { metaTitle: "", metaDescription: "" },
};

function AdminGate({ children }) {
  const { user, isAdmin, checking, signOut } = useAuth();

  if (checking) {
    return <main id="main" className="admin-page"><p className="journal-status section-shell">Checking access…</p></main>;
  }

  if (!user) {
    return (
      <main id="main" className="admin-page">
        <div className="section-shell admin-locked">
          <p className="eyebrow">JOURNAL ADMIN</p>
          <h1>Sign in to write.</h1>
          <p>Use the “Sign in with Google” button in the header. Only allowlisted accounts can open the editor.</p>
          <Link className="text-link" to="/journal">Back to the journal <span aria-hidden="true">↗</span></Link>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main id="main" className="admin-page">
        <div className="section-shell admin-locked">
          <p className="eyebrow">JOURNAL ADMIN</p>
          <h1>You’re signed in, but not on the list.</h1>
          <p>Your account ({user.email}) is signed in but isn’t an admin. Ask the site owner to add it to the admin allowlist.</p>
          <button className="journal-filter-button" type="button" onClick={() => signOut()}>Sign out</button>
        </div>
      </main>
    );
  }

  return children;
}

export function AdminJournal() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useSeo({ title: "Journal admin", url: `${window.location.origin}/admin/journal` });

  const load = () => {
    setLoading(true);
    listAllPostsForAdmin()
      .then((result) => { setPosts(result); setError(""); })
      .catch(() => setError("Couldn’t load your posts."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const groups = useMemo(() => {
    const map = new Map();
    posts.forEach((post) => {
      const key = post.translationGroup || post.id;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(post);
    });
    return [...map.values()];
  }, [posts]);

  return (
    <AdminGate>
      <main id="main" className="admin-page">
        <header className="admin-header section-shell">
          <div>
            <p className="eyebrow">JOURNAL ADMIN</p>
            <h1>Write something <em>worth reading.</em></h1>
          </div>
          <Link className="admin-new-link" to="/admin/journal/new">+ New post</Link>
        </header>

        <section className="section-shell admin-list" aria-live="polite">
          {loading && <p className="journal-status">Loading your posts…</p>}
          {!loading && error && <p className="journal-status journal-status-error">{error}</p>}
          {!loading && !error && groups.length === 0 && (
            <p className="journal-status">No posts yet. Start with your first guide.</p>
          )}
          {groups.map((group) => (
            <article className="admin-group" key={group[0].translationGroup || group[0].id}>
              <div className="admin-group-head">
                <h2>{group[0].title || "Untitled post"}</h2>
                <span className={`admin-status-pill ${group.some((post) => post.status === "published") ? "is-published" : "is-draft"}`}>
                  {group.some((post) => post.status === "published") ? "Published" : "Draft"}
                </span>
              </div>
              <div className="admin-langs">
                {group.map((post) => (
                  <Link className="admin-lang" key={post.id} to={`/admin/journal/${post.id}`}>
                    {post.lang === "hi" ? "हिन्दी" : "English"} · {post.type}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
    </AdminGate>
  );
}

export function AdminPostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState({ ...EMPTY_POST });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  useSeo({ title: id ? "Edit post" : "New post", url: `${window.location.origin}/admin/journal${id ? `/${id}` : "/new"}` });

  useEffect(() => {
    if (!id) {
      setPost((current) => ({ ...current, authorName: current.authorName || "Elsewhere Travel Co." }));
      return;
    }
    getPostById(id)
      .then((result) => { if (result) setPost(result); })
      .catch(() => setError("Couldn’t load that post."));
  }, [id]);

  function update(field, value) {
    setPost((current) => ({ ...current, [field]: value }));
  }

  function updateSeo(field, value) {
    setPost((current) => ({ ...current, seo: { ...current.seo, [field]: value } }));
  }

  async function handleCoverChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Uploading cover image…");
    try {
      const url = await uploadCoverImage(file, id || "new");
      setPost((current) => ({ ...current, coverImage: url, coverAlt: current.coverAlt || current.title }));
      setStatus("Cover uploaded.");
    } catch {
      setError("Cover upload failed. Check that Storage rules allow admin writes.");
    }
  }

  async function handleSave(nextStatus) {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const payload = { ...post, status: nextStatus, authorName: post.authorName || user?.displayName || "Elsewhere Travel Co." };
      const savedId = await savePost(payload, { id });
      setStatus(nextStatus === "published" ? "Published." : "Draft saved.");
      if (!id) navigate(`/admin/journal/${savedId}`, { replace: true });
      else setPost((current) => ({ ...current, id: savedId, status: nextStatus }));
    } catch (err) {
      setError(err?.message || "Couldn’t save the post.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try {
      await deletePost(id);
      navigate("/admin/journal");
    } catch {
      setError("Couldn’t delete the post.");
    }
  }

  async function createTranslation() {
    const siblingLang = post.lang === "en" ? "hi" : "en";
    try {
      const newId = await savePost({ ...post, lang: siblingLang, title: "", slug: "", status: "draft" }, { id: undefined });
      navigate(`/admin/journal/${newId}`);
    } catch {
      setError("Couldn’t create the translated version.");
    }
  }

  return (
    <AdminGate>
      <main id="main" className="admin-page">
        <header className="admin-header section-shell">
          <div>
            <p className="eyebrow">{id ? "EDIT POST" : "NEW POST"}</p>
            <h1>{id ? post.title || "Untitled post" : "Start a new story"}</h1>
          </div>
          <Link className="admin-new-link" to="/admin/journal">← All posts</Link>
        </header>

        <form className="section-shell admin-editor" onSubmit={(event) => event.preventDefault()}>
          <div className="admin-editor-main">
            <label className="admin-field">
              <span>Title</span>
              <input value={post.title} onChange={(event) => update("title", event.target.value)} placeholder="A good headline" required />
            </label>

            <label className="admin-field">
              <span>Slug</span>
              <input value={post.slug} onChange={(event) => update("slug", slugify(event.target.value))} placeholder="shimla-in-december" />
              <small>Public URL: /journal/{post.slug || slugify(post.title) || "…"}</small>
            </label>

            <label className="admin-field">
              <span>Excerpt</span>
              <textarea rows="3" value={post.excerpt} onChange={(event) => update("excerpt", event.target.value)} placeholder="One or two lines that make someone want to read on." />
            </label>

            <div className="admin-field">
              <span>Body (markdown)</span>
              <div className="admin-body-toolbar">
                <button type="button" className={!preview ? "is-active" : ""} onClick={() => setPreview(false)}>Write</button>
                <button type="button" className={preview ? "is-active" : ""} onClick={() => setPreview(true)}>Preview</button>
              </div>
              {preview ? (
                <div className="admin-preview">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[[rehypeSanitize, { ...defaultSchema, attributes: { ...defaultSchema.attributes, "*": [...(defaultSchema.attributes?.["*"] ?? []), "id"] } }]]}
                  >
                    {post.body || "_Nothing to preview yet._"}
                  </ReactMarkdown>
                </div>
              ) : (
                <textarea className="admin-body-input" rows="18" value={post.body} onChange={(event) => update("body", event.target.value)} placeholder={"# Heading\n\nWrite your guide here…"} />
              )}
            </div>
          </div>

          <aside className="admin-editor-side">
            <label className="admin-field">
              <span>Status</span>
              <select value={post.status} onChange={(event) => update("status", event.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>

            <label className="admin-field">
              <span>Language</span>
              <select value={post.lang} onChange={(event) => update("lang", event.target.value)}>
                {POST_LANGS.map((lang) => <option value={lang} key={lang}>{lang === "hi" ? "हिन्दी" : "English"}</option>)}
              </select>
            </label>

            <label className="admin-field">
              <span>Type</span>
              <select value={post.type} onChange={(event) => update("type", event.target.value)}>
                {POST_TYPES.map((type) => <option value={type} key={type}>{type}</option>)}
              </select>
            </label>

            <label className="admin-field">
              <span>Destination</span>
              <select value={post.destinationId || ""} onChange={(event) => update("destinationId", event.target.value)}>
                <option value="">None</option>
                {destinations.map((destination) => <option value={destination.id} key={destination.id}>{destination.name}</option>)}
              </select>
            </label>

            <label className="admin-field">
              <span>Tags (comma separated)</span>
              <input value={post.tags.join(", ")} onChange={(event) => update("tags", event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))} placeholder="shimla, winter, budget" />
            </label>

            <label className="admin-field">
              <span>Author</span>
              <input value={post.authorName} onChange={(event) => update("authorName", event.target.value)} />
            </label>

            <label className="admin-field">
              <span>Cover image</span>
              <input type="file" accept="image/*" onChange={handleCoverChange} />
              {post.coverImage && <img className="admin-cover-preview" src={post.coverImage} alt="Cover preview" />}
            </label>

            <label className="admin-field">
              <span>Cover alt text</span>
              <input value={post.coverAlt} onChange={(event) => update("coverAlt", event.target.value)} placeholder="Describe the photo" />
            </label>

            <label className="admin-check">
              <input type="checkbox" checked={post.featured} onChange={(event) => update("featured", event.target.checked)} />
              <span>Feature on the journal front page</span>
            </label>

            <label className="admin-field">
              <span>SEO title</span>
              <input value={post.seo?.metaTitle || ""} onChange={(event) => updateSeo("metaTitle", event.target.value)} placeholder={post.title} />
            </label>

            <label className="admin-field">
              <span>SEO description</span>
              <textarea rows="3" value={post.seo?.metaDescription || ""} onChange={(event) => updateSeo("metaDescription", event.target.value)} placeholder={post.excerpt} />
            </label>
          </aside>

          <div className="admin-editor-actions">
            <div className="admin-messages" aria-live="polite">
              {status && <p className="admin-message">{status}</p>}
              {error && <p className="admin-message is-error">{error}</p>}
            </div>
            <div className="admin-buttons">
              {id && (
                <button className="journal-filter-button" type="button" onClick={createTranslation}>
                  Create {post.lang === "en" ? "Hindi" : "English"} version
                </button>
              )}
              {id && (
                <button className="journal-filter-button" type="button" onClick={handleDelete}>Delete</button>
              )}
              <button className="admin-save-button" type="button" onClick={() => handleSave("draft")} disabled={saving}>Save draft</button>
              <button className="admin-save-button is-primary" type="button" onClick={() => handleSave("published")} disabled={saving}>
                {post.status === "published" ? "Update" : "Publish"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </AdminGate>
  );
}
