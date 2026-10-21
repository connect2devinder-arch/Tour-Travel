// Hero background slides. All images are self-hosted on Firebase Storage.
const storageUrl = (path) =>
  `https://firebasestorage.googleapis.com/v0/b/tour-83b6c.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media`;

export const heroSlides = [
  {
    src: storageUrl("site/hero.jpg"),
    alt: "Aerial drone view of the colourful hill town of Shimla",
    label: "Shimla, Himachal Pradesh",
  },
  {
    src: storageUrl("destinations/spiti/3.jpg"),
    alt: "Wide Spiti valley with a river surrounded by snow-capped mountains",
    label: "Spiti Valley, Himachal Pradesh",
  },
  {
    src: storageUrl("destinations/manali/2.jpg"),
    alt: "Aerial view of a Manali valley town near snow-covered mountains",
    label: "Manali, Himachal Pradesh",
  },
  {
    src: storageUrl("destinations/mussoorie/1.jpg"),
    alt: "Aerial drone view of Mussoorie town surrounded by Himalayan mountains",
    label: "Mussoorie, Uttarakhand",
  },
  {
    src: storageUrl("destinations/shimla/2.jpg"),
    alt: "Aerial view of Shimla city during the daytime",
    label: "The Ridge, Shimla",
  },
];

export const heroAutoplay = {
  intervalMs: 6000,
  resumeDelayMs: 8000,
};
