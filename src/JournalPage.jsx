import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { Link, useParams } from "react-router-dom";
import { useSeo } from "./seo.js";
import { destinations } from "./mockData.js";
import { extractHeadings, getPublishedPostBySlug, getTranslationSiblings, listPublishedPosts, slugify } from "./blog.js";
import { POST_LANGS } from "./blog.js";

const LANG_LABELS = { en: "English", hi: "हिन्दी" };

function textOf(children) {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(textOf).join("");
  return "";
}

function formatDate(value) {
  if (!value) return "";
  const date = value.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function PostCard({ post, featured = false }) {
  return (
    <article className={`journal-card${featured ? " journal-card-featured" : ""}`}>
      {post.coverImage && (
        <Link className="journal-card-media" to={`/journal/${post.slug}`} aria-label={`Read ${post.title}`}>
          <img src={post.coverImage} alt={post.coverAlt || post.title} loading="lazy" />
        </Link>
      )}
      <div className="journal-card-body">
        <p className="journal-card-meta">
          <span>{post.type}</span>
          <span>{post.lang === "hi" ? "हिन्दी" : "English"}</span>
          {post.authorName && <span>by {post.authorName}</span>}
          <span>{post.readingMinutes} min read</span>
        </p>
        <h3><Link to={`/journal/${post.slug}`}>{post.title}</Link></h3>
        {post.excerpt && <p className="journal-card-excerpt">{post.excerpt}</p>}
        <Link className="journal-card-link" to={`/journal/${post.slug}`}>Read the story <span aria-hidden="true">↗</span></Link>
      </div>
    </article>
  );
}

export function JournalPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  useSeo({
    title: "The Journal",
    description: "Travel guides, itineraries, and stories from the Indian Himalaya — written by the people who drive these roads.",
    url: `${window.location.origin}/journal`,
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listPublishedPosts()
      .then((result) => { if (!cancelled) { setPosts(result); setError(""); } })
      .catch(() => { if (!cancelled) setError("We couldn’t load the journal just now. Please try again."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const allTags = useMemo(() => [...new Set(posts.flatMap((post) => post.tags))].sort(), [posts]);
  const filtered = useMemo(() => posts.filter((post) => {
    if (destinationFilter && post.destinationId !== destinationFilter) return false;
    if (tagFilter && !post.tags.includes(tagFilter)) return false;
    return true;
  }), [posts, destinationFilter, tagFilter]);

  const featured = filtered.find((post) => post.featured) || filtered[0];
  const rest = featured ? filtered.filter((post) => post.id !== featured.id) : [];

  return (
    <main id="main" className="journal-page">
      <header className="journal-header section-shell">
        <p className="eyebrow">THE JOURNAL</p>
        <h1>Stories from the <em>long way round.</em></h1>
        <p className="journal-intro">Guides, itineraries and honest notes on travelling the Indian Himalaya — written by the people who drive these roads for a living.</p>
      </header>

      <div className="journal-filters section-shell">
        <label className="journal-filter">
          <span>Destination</span>
          <select value={destinationFilter} onChange={(event) => setDestinationFilter(event.target.value)} aria-label="Filter by destination">
            <option value="">All destinations</option>
            {destinations.map((destination) => <option value={destination.id} key={destination.id}>{destination.name}</option>)}
          </select>
        </label>
        <label className="journal-filter">
          <span>Topic</span>
          <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} aria-label="Filter by topic">
            <option value="">All topics</option>
            {allTags.map((tag) => <option value={tag} key={tag}>{tag}</option>)}
          </select>
        </label>
      </div>

      <section className="section-shell journal-results" aria-live="polite">
        {loading && <p className="journal-status">Loading stories…</p>}
        {!loading && error && <p className="journal-status journal-status-error">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="journal-status">
            {posts.length === 0 ? "No stories published yet — check back soon." : "No stories match those filters yet."}
          </p>
        )}
        {!loading && !error && featured && (
          <>
            <PostCard post={featured} featured />
            {rest.length > 0 && (
              <div className="journal-grid">
                {rest.map((post) => <PostCard post={post} key={post.id} />)}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export function ArticlePage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [siblings, setSiblings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const headings = useMemo(() => extractHeadings(post?.body), [post?.body]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPublishedPostBySlug(slug)
      .then(async (result) => {
        if (cancelled) return;
        if (!result) { setNotFound(true); return; }
        setPost(result);
        setNotFound(false);
        const translations = await getTranslationSiblings(result.translationGroup);
        if (!cancelled) setSiblings(translations);
        const all = await listPublishedPosts();
        if (!cancelled) {
          setRelated(all.filter((item) => item.id !== result.id && (item.destinationId === result.destinationId || item.tags.some((tag) => result.tags.includes(tag)))).slice(0, 3));
        }
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  useSeo({
    title: post?.seo?.metaTitle || post?.title || "The Journal",
    description: post?.seo?.metaDescription || post?.excerpt,
    image: post?.coverImage,
    type: "article",
    url: post ? `${window.location.origin}/journal/${post.slug}` : undefined,
    jsonLd: post ? {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      image: post.coverImage ? [post.coverImage] : undefined,
      datePublished: post.publishedAt?.toDate?.().toISOString?.() ?? undefined,
      author: { "@type": "Organization", name: post.authorName || "Elsewhere Travel Co." },
      publisher: { "@type": "Organization", name: "Elsewhere Travel Co." },
    } : undefined,
  });

  if (loading) {
    return <main id="main" className="journal-page"><p className="journal-status section-shell">Loading story…</p></main>;
  }

  if (notFound || !post) {
    return (
      <main id="main" className="journal-page">
        <div className="section-shell journal-not-found">
          <p className="eyebrow">STORY NOT FOUND</p>
          <h1>This one’s off the map.</h1>
          <Link className="text-link" to="/journal">Back to the journal <span aria-hidden="true">↗</span></Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="article-page">
      <article className="article section-shell">
        <nav className="article-breadcrumb" aria-label="Breadcrumb">
          <Link to="/journal">The Journal</Link><span aria-hidden="true">/</span><span aria-current="page">{post.title}</span>
        </nav>

        <header className="article-header">
          <p className="journal-card-meta">
            <span>{post.type}</span>
            <span>{LANG_LABELS[post.lang]}</span>
            {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
            <span>{post.readingMinutes} min read</span>
          </p>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="article-excerpt">{post.excerpt}</p>}
          <div className="article-actions">
            <div className="article-lang-switch" role="group" aria-label="Language">
              {POST_LANGS.map((lang) => {
                const sibling = siblings.find((item) => item.lang === lang);
                if (!sibling) {
                  return <span key={lang} className="article-lang is-missing" title="Not available in this language">{LANG_LABELS[lang]} — not available in this language</span>;
                }
                if (sibling.id === post.id) {
                  return <span key={lang} className="article-lang is-active" aria-current="true">{LANG_LABELS[lang]}</span>;
                }
                return <Link key={lang} className="article-lang" to={`/journal/${sibling.slug}`}>{LANG_LABELS[lang]}</Link>;
              })}
            </div>
            <button className="journal-filter-button" type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Copy link</button>
            <a className="journal-filter-button" href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${window.location.href}`)}`} target="_blank" rel="noreferrer noopener">Share on WhatsApp</a>
            <Link className="journal-filter-button" to="/journal">All stories</Link>
          </div>
        </header>

        {post.coverImage && (
          <figure className="article-cover">
            <img src={post.coverImage} alt={post.coverAlt || post.title} />
          </figure>
        )}

        <div className="article-layout">
          {headings.length > 1 && (
            <nav className="article-toc" aria-label="On this page">
              <p className="eyebrow">ON THIS PAGE</p>
              <ul>{headings.map((heading) => <li key={heading.id} className={heading.level === 3 ? "is-nested" : ""}><a href={`#${heading.id}`}>{heading.text}</a></li>)}</ul>
            </nav>
          )}
          <div className="article-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[[rehypeSanitize, { ...defaultSchema, attributes: { ...defaultSchema.attributes, "*": [...(defaultSchema.attributes?.["*"] ?? []), "id"] } }]]}
              components={{
                h2: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
                h3: ({ children }) => <h3 id={slugify(textOf(children))}>{children}</h3>,
                a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer noopener">{children}</a>,
              }}
            >
              {post.body}
            </ReactMarkdown>
          </div>
        </div>

        {related.length > 0 && (
          <section className="article-related" aria-labelledby="related-title">
            <h2 id="related-title">Keep reading</h2>
            <div className="journal-grid">
              {related.map((item) => <PostCard post={item} key={item.id} />)}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
