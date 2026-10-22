import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { GoogleMark } from "./AdminGate.jsx";
import { useSeo } from "./seo.js";
import { destinations } from "./mockData.js";
import {
  POST_LANGS,
  POST_TYPES,
  getPostById,
  listPostsByAuthor,
  savePost,
  slugify,
  uploadCoverImage,
} from "./blog.js";

const EMPTY_POST = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  coverImage: "",
  coverAlt: "",
  tags: [],
  type: "guide",
  lang: "en",
  destinationId: "",
  status: "draft",
  featured: false,
  seo: { metaTitle: "", metaDescription: "" },
};

const STATUS_LABELS = {
  draft: "Draft",
  pending: "In review",
  published: "Live",
  rejected: "Changes requested",
};

function SignInWall() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState("");

  return (
    <main id="main" className="admin-page">
      <div className="section-shell admin-locked">
        <p className="eyebrow">WRITE</p>
        <h1>Sign in to write.</h1>
        <p>Create an account with Google to write stories for the journal. Your post is reviewed by the team before it goes live.</p>
        <button
          className="admin-signin-button"
          type="button"
          onClick={() => {
            setError("");
            signInWithGoogle().catch((err) => {
              const messages = {
                "auth/operation-not-allowed": "Google sign-in is not enabled for this Firebase project yet.",
                "auth/unauthorized-domain": "This domain is not authorized for Firebase sign-in yet.",
                "auth/popup-closed-by-user": "Sign-in was cancelled.",
              };
              setError(messages[err?.code] || "Could not complete sign-in. Please try again.");
            });
          }}
        >
          <GoogleMark /> Sign in with Google
        </button>
        {error && <p className="admin-message is-error">{error}</p>}
        <Link className="text-link" to="/journal">Read the journal <span aria-hidden="true">↗</span></Link>
      </div>
    </main>
  );
}

export function WriteHome() {
  const { user, checking } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useSeo({ title: "Write", url: `${window.location.origin}/write` });

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    listPostsByAuthor(user.uid)
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [user?.uid]);

  if (!checking && !user) {
    return <SignInWall />;
  }

  return (
    <main id="main" className="admin-page">
      <header className="admin-header section-shell">
        <div>
          <p className="eyebrow">WRITE</p>
          <h1>Your <em>stories.</em></h1>
          <p className="admin-demo-note">Draft karke rakho, review ke liye bhejo — team approve kare to journal me live ho jayega.</p>
        </div>
        <Link className="admin-new-link" to="/write/new">+ New post</Link>
      </header>

      <section className="section-shell admin-list" aria-live="polite">
        {loading && <p className="journal-status">Loading your posts…</p>}
        {!loading && posts.length === 0 && (
          <p className="journal-status">
            No posts yet. <Link to="/write/new">Write your first story</Link> — a guide, an itinerary, or a note from the road.
          </p>
        )}

        {posts.map((post) => (
          <article className="admin-group" key={post.id}>
            <div className="admin-group-head">
              <h2>{post.title || "Untitled post"}</h2>
              <span className={`admin-status-pill ${post.status === "published" ? "is-published" : "is-draft"}`}>
                {STATUS_LABELS[post.status] ?? post.status}
              </span>
            </div>
            <div className="admin-package-meta">
              <span>{post.type}</span>
              <span>{post.lang === "hi" ? "हिन्दी" : "English"}</span>
              <span>{post.readingMinutes} min read</span>
              <Link className="admin-lang" to={`/write/${post.id}`}>Edit</Link>
            </div>
            {post.status === "rejected" && post.reviewNote && (
              <p className="admin-notification-body">Review note: {post.reviewNote}</p>
            )}
            {post.status === "published" && (
              <div className="admin-package-meta">
                <Link className="admin-lang" to={`/journal/${post.slug}`}>View live post</Link>
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

export function WriteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, checking } = useAuth();
  const [post, setPost] = useState({ ...EMPTY_POST });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [loaded, setLoaded] = useState(!id);

  useSeo({ title: id ? "Edit your post" : "Write a story", url: `${window.location.origin}/write${id ? `/${id}` : "/new"}` });

  useEffect(() => {
    if (!id || !user?.uid) return;
    getPostById(id)
      .then((result) => {
        if (!result) {
          setError("That post could not be found.");
          return;
        }
        if (result.authorUid && result.authorUid !== user.uid) {
          setError("You can only edit your own posts.");
          return;
        }
        setPost(result);
        setLoaded(true);
      })
      .catch(() => setError("We couldn’t load that post."));
  }, [id, user?.uid]);

  function update(field, value) {
    setPost((current) => ({ ...current, [field]: value }));
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
      setError("Cover upload failed. Check that Storage rules allow your writes.");
    }
  }

  async function handleSave(requestedStatus) {
    if (!user) return;
    // Editing a live post sends it back for review.
    const nextStatus = post.status === "published" ? "pending" : requestedStatus;
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const savedId = await savePost(
        { ...post, status: nextStatus },
        {
          id,
          actorUid: user.uid,
          actorName: post.authorName || user.displayName || "Community writer",
          actorPhoto: post.authorPhoto || user.photoURL || "",
          canPublish: false,
        },
      );
      setStatus(nextStatus === "pending" ? "Sent for review — the team will take a look." : "Draft saved.");
      if (!id) navigate(`/write/${savedId}`, { replace: true });
      else setPost((current) => ({ ...current, id: savedId, status: nextStatus }));
    } catch (err) {
      setError(err?.message || "We couldn’t save your post.");
    } finally {
      setSaving(false);
    }
  }

  if (!checking && !user) {
    return <SignInWall />;
  }

  if (id && !loaded) {
    return (
      <main id="main" className="admin-page">
        <div className="section-shell admin-locked">
          <p className="eyebrow">WRITE</p>
          <h1>{error ? "We couldn’t open that post." : "Loading your post…"}</h1>
          {error && <p className="admin-message is-error">{error}</p>}
          <Link className="text-link" to="/write">Back to your posts <span aria-hidden="true">↗</span></Link>
        </div>
      </main>
    );
  }

  const isLive = post.status === "published";

  return (
    <main id="main" className="admin-page">
      <header className="admin-header section-shell">
        <div>
          <p className="eyebrow">{id ? "EDIT YOUR POST" : "NEW POST"}</p>
          <h1>{id ? post.title || "Untitled post" : "Tell a good story"}</h1>
        </div>
        <Link className="admin-new-link" to="/write">← Your posts</Link>
      </header>

      <form className="section-shell admin-editor" onSubmit={(event) => event.preventDefault()}>
        <div className="admin-editor-main">
          <label className="admin-field">
            <span>Title</span>
            <input
              value={post.title}
              onChange={(event) => setPost((current) => ({ ...current, title: event.target.value, slug: slugify(event.target.value) }))}
              placeholder="A good headline"
              required
            />
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
          <div className="admin-field">
            <span>Status</span>
            <p className="admin-demo-note">
              {isLive
                ? "This post is live. Saving changes sends it back for review."
                : post.status === "pending"
                  ? "With the team for review."
                  : post.status === "rejected"
                    ? "Changes were requested — see the note on your posts list."
                    : "Only you can see drafts."}
            </p>
          </div>

          <label className="admin-field">
            <span>Type</span>
            <select value={post.type} onChange={(event) => update("type", event.target.value)}>
              {POST_TYPES.map((type) => (
                <option value={type} key={type}>{type}</option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>Language</span>
            <select value={post.lang} onChange={(event) => update("lang", event.target.value)}>
              {POST_LANGS.map((lang) => (
                <option value={lang} key={lang}>{lang === "hi" ? "हिन्दी" : "English"}</option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>Destination</span>
            <select value={post.destinationId || ""} onChange={(event) => update("destinationId", event.target.value)}>
              <option value="">None</option>
              {destinations.map((destination) => (
                <option value={destination.id} key={destination.id}>{destination.name}</option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>Tags (comma separated)</span>
            <input value={post.tags.join(", ")} onChange={(event) => update("tags", event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))} placeholder="shimla, winter, budget" />
          </label>

          <label className="admin-field">
            <span>Your name</span>
            <input value={post.authorName || ""} onChange={(event) => update("authorName", event.target.value)} placeholder={user?.displayName || "Your name"} />
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
        </aside>

        <div className="admin-editor-actions">
          <div className="admin-messages" aria-live="polite">
            {status && <p className="admin-message">{status}</p>}
            {error && <p className="admin-message is-error">{error}</p>}
          </div>
          <div className="admin-buttons">
            <button className="admin-save-button" type="button" onClick={() => handleSave("draft")} disabled={saving}>Save draft</button>
            <button className="admin-save-button is-primary" type="button" onClick={() => handleSave("pending")} disabled={saving}>
              {post.status === "pending" ? "Resubmit for review" : "Submit for review"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
