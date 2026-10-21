// About section content. Edit here to change the story, values, or image.
const storageUrl = (path) =>
  `https://firebasestorage.googleapis.com/v0/b/tour-83b6c.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media`;

export const aboutContent = {
  eyebrow: "ABOUT ELSEWHERE",
  headingLead: "We started with a",
  headingHighlight: "taxi and a map.",
  paragraphs: [
    "Elsewhere began in Shimla with a borrowed Innova, a hand-marked map, and a hunch that the best holidays in the Himalaya are the ones nobody planned. We wanted the opposite of a package holiday — a trip that bends around the weather, the road, and whoever you happen to meet along the way.",
    "Today we’re a small team of Himachali and Uttarakhandi people who drive these roads for a living. We pick the stays we’d send our own family to, the trails we’d walk on a free day, and the tea stalls worth the stop. If a pass is shut because of a landslide, we’ll tell you — and we’ll show you something better on the way there.",
    "No coaches. No five-a.m. starts. No twenty-stop itineraries. Just small groups, honest prices, and enough time to actually be somewhere.",
  ],
  closing: "Come for the mountains. Stay for the people you meet on the way.",
  image: {
    src: storageUrl("destinations/shimla/1.jpg"),
    alt: "Aerial drone view of the colourful hill town of Shimla, where Elsewhere Travel began",
    note: "Shimla, Himachal Pradesh · where it started",
  },
  values: [
    {
      title: "Local knowledge",
      description: "Routes, stays and shortcuts we know from the road — not from a brochure.",
    },
    {
      title: "Slow by design",
      description: "Fewer places, longer days, and room for the weather to change the plan.",
    },
    {
      title: "Honest by default",
      description: "What we quote is what you pay. No hidden charges, no fine print surprises.",
    },
  ],
};
