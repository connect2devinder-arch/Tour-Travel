import React from "react";
import { Link } from "react-router-dom";
import { destinationImageCredits } from "./destinationImageCredits.js";
import { useSeo } from "./seo.js";

const DESTINATIONS = {
  dharamshala: "Dharamshala",
  chamba: "Chamba",
  palampur: "Palampur",
};

function destinationForPath(path) {
  return DESTINATIONS[path.split("/")[1]] ?? "Himachal Pradesh";
}

export function ImageCreditsPage() {
  useSeo({ title: "Image credits", url: `${window.location.origin}/image-credits` });

  const groups = Object.entries(DESTINATIONS).map(([id, name]) => ({
    id,
    name,
    images: destinationImageCredits.filter((credit) => destinationForPath(credit.path) === name),
  }));

  return (
    <main id="main" className="image-credits-page">
      <header className="section-shell image-credits-header">
        <p className="eyebrow">IMAGE CREDITS</p>
        <h1>Thank you to the <em>photographers.</em></h1>
        <p>These destination photos are hosted in our Firebase Storage. Original authors and licenses are listed below.</p>
      </header>

      <div className="section-shell image-credit-groups">
        {groups.map((group) => (
          <section className="image-credit-group" key={group.id} aria-labelledby={`credits-${group.id}`}>
            <h2 id={`credits-${group.id}`}>{group.name}</h2>
            <ul>
              {group.images.map((credit) => (
                <li key={credit.path}>
                  <img src={`https://firebasestorage.googleapis.com/v0/b/tour-83b6c.firebasestorage.app/o/${encodeURIComponent(credit.path)}?alt=media`} alt="" loading="lazy" />
                  <div>
                    <strong>{credit.title}</strong>
                    <p>
                      Photo by {credit.author} · {credit.license} ·{" "}
                      <a href={credit.licenseUrl} target="_blank" rel="noreferrer">license</a>
                      {" · "}<a href={credit.sourceUrl} target="_blank" rel="noreferrer">original source</a>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <Link className="text-link" to="/">Back to the site <span aria-hidden="true">↗</span></Link>
      </div>
    </main>
  );
}
