import { useEffect } from "react";

const SITE_NAME = "Elsewhere Travel Co.";
const DEFAULT_DESCRIPTION = "Thoughtful Indian hill trips — Shimla, Manali, Lahaul & Spiti, and Mussoorie, planned by people who drive these roads for a living.";

function setMeta(attribute, key, content) {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setLink(rel, href) {
  if (!href) return;
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

/**
 * Keeps the document head in sync with the current page.
 * Works for a Vite SPA where each route renders client-side.
 */
export function useSeo({ title, description, image, url, type = "website", jsonLd } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — Indian mountain escapes`;
    const metaDescription = description || DEFAULT_DESCRIPTION;
    const canonical = url || window.location.href.split("#")[0];

    document.title = fullTitle;
    setMeta("name", "description", metaDescription);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", metaDescription);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", canonical);
    if (image) setMeta("property", "og:image", image);
    setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", metaDescription);
    if (image) setMeta("name", "twitter:image", image);
    setLink("canonical", canonical);

    const scriptId = "page-json-ld";
    document.getElementById(scriptId)?.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = scriptId;
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => document.getElementById(scriptId)?.remove();
  }, [title, description, image, url, type, jsonLd ? JSON.stringify(jsonLd) : ""]);
}
