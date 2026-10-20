const unsplash = (photoId, width = 1000) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=85`;

const samplePackageFaqs = [
  {
    question: "Are these package details and prices final?",
    answer: "No. This is illustrative sample content; confirm final rates, availability, and inclusions before booking.",
  },
  {
    question: "Can I ask about different travel dates?",
    answer: "Yes. Use the enquiry form to share your preferred dates; availability is not live in this demo.",
  },
  {
    question: "Can the itinerary be changed?",
    answer: "The itinerary shown is a sample plan. Any changes would need to be discussed and confirmed with the travel team.",
  },
];

// Temporary front-end fixtures. Replace or expand these as requirements evolve.
export const destinations = [
  {
    id: "shimla",
    name: "Shimla",
    country: "Himachal Pradesh, India",
    tags: "shimla simla himachal india",
    tagline: "Pine walks & mountain mornings",
    description: "Take in Mall Road, old hill-town charm, and quiet views over the Himalayan slopes.",
    image: unsplash("photo-1597074866923-dc0589150358", 1200),
    imageAlt: "Shimla hillside town surrounded by mountain slopes",
    photos: [
      { src: unsplash("photo-1597074866923-dc0589150358", 1200), alt: "Shimla hillside town surrounded by mountain slopes" },
      { src: unsplash("photo-1626621341517-bbf3d9990a23", 900), alt: "Snow-dusted Himalayan mountain scenery" },
    ],
    attractions: ["Mall Road", "Jakhu Temple", "Kufri"],
    packages: [{
      id: "shimla-escape",
      name: "Shimla Hill Escape",
      price: "₹15,999*",
      duration: "4 days",
      summary: "A relaxed hill-town stay with a heritage walk and a Kufri day trip.",
      itinerary: [
        "Arrive in Shimla and check in",
        "Explore Mall Road, The Ridge, and Jakhu Temple",
        "Visit Kufri and enjoy a free evening",
        "Breakfast, check out, and departure",
      ],
      inclusions: ["3 nights in a sample hill hotel", "Daily breakfast", "Local sightseeing transfers"],
      hotel: { category: "Sample 3-star hill hotel", nights: "3 nights", details: "Property name and availability are illustrative and need confirmation." },
      transport: { mode: "Private AC cab (sample)", details: "Local sightseeing transfers; pickup and drop details to be confirmed." },
      faqs: samplePackageFaqs,
    }],
  },
  {
    id: "manali",
    name: "Manali",
    country: "Himachal Pradesh, India",
    tags: "manali kullu himachal india",
    tagline: "River air & mountain roads",
    description: "Mix riverside downtime and cedar forests with a day out in Solang Valley.",
    image: unsplash("photo-1626621341517-bbf3d9990a23", 1000),
    imageAlt: "Snow-covered peaks above the Manali region",
    photos: [
      { src: unsplash("photo-1626621341517-bbf3d9990a23", 1200), alt: "Snow-covered peaks above the Manali region" },
      { src: unsplash("photo-1464822759023-fed622ff2c3b", 900), alt: "Snow-covered Himalayan peaks" },
    ],
    attractions: ["Hadimba Temple", "Solang Valley", "Old Manali"],
    packages: [{
      id: "manali-valley",
      name: "Manali Valley Break",
      price: "₹21,999*",
      duration: "5 days",
      summary: "Explore Old Manali, visit Hadimba Temple, and spend a day in Solang Valley.",
      itinerary: [
        "Arrive in Manali and check in",
        "Visit Hadimba Temple and explore Old Manali",
        "Day trip to Solang Valley",
        "Free day for the Beas riverside and local cafes",
        "Breakfast, check out, and departure",
      ],
      inclusions: ["4 nights in a sample valley hotel", "Daily breakfast", "Local sightseeing transfers"],
      hotel: { category: "Sample 3-star valley hotel", nights: "4 nights", details: "Sample accommodation only; exact property and availability to be confirmed." },
      transport: { mode: "Private AC cab (sample)", details: "Manali local transfers and Solang excursion; routes depend on conditions." },
      faqs: samplePackageFaqs,
    }],
  },
  {
    id: "lahaul-spiti",
    name: "Lahaul & Spiti",
    country: "Himachal Pradesh, India",
    tags: "lahaul spiti kaza himachal india",
    tagline: "High passes & quiet monasteries",
    description: "Discover high-altitude villages and monasteries at an unhurried pace. Mountain routes are seasonal.",
    image: unsplash("photo-1500530855697-b586d89ba3ee", 1000),
    imageAlt: "A remote high-altitude Himalayan valley",
    photos: [
      { src: unsplash("photo-1500530855697-b586d89ba3ee", 1200), alt: "A remote high-altitude Himalayan valley" },
      { src: unsplash("photo-1519681393784-d120267933ba", 900), alt: "Himalayan peaks beneath a starry sky" },
    ],
    attractions: ["Key Monastery", "Dhankar Monastery", "Chandratal Lake (seasonal)"],
    packages: [{
      id: "spiti-road-trip",
      name: "Spiti Slow Road Trip",
      price: "₹36,999*",
      duration: "8 days",
      summary: "A sample high-altitude road trip with monastery visits and time to acclimatize.",
      itinerary: [
        "Arrive in Shimla and acclimatize",
        "Drive to Kalpa with scenic stops",
        "Travel to Tabo and visit the village",
        "Continue to Kaza and rest",
        "Visit Key Monastery and Kibber",
        "Explore Dhankar and nearby villages",
        "Flexible acclimatization / weather day",
        "Begin the return journey",
      ],
      inclusions: ["7 nights in sample guesthouses/homestays", "Breakfast (sample)", "High-clearance vehicle for listed route (sample)"],
      hotel: { category: "Sample guesthouses and homestays", nights: "7 nights", details: "Illustrative stays only; exact properties depend on seasonal availability." },
      transport: { mode: "High-clearance vehicle (sample)", details: "Route and pickup points are subject to season, road, and weather conditions." },
      faqs: samplePackageFaqs,
    }],
  },
  {
    id: "mussoorie",
    name: "Mussoorie",
    country: "Uttarakhand, India",
    tags: "mussoorie masuri uttarakhand india",
    tagline: "Cloud-kissed walks & chai stops",
    description: "Take hillside walks, look out over the Doon Valley, and leave room for a slow café stop.",
    image: unsplash("photo-1501785888041-af3ef285b470", 1000),
    imageAlt: "A mountain lake and green hills",
    photos: [
      { src: unsplash("photo-1501785888041-af3ef285b470", 1200), alt: "A mountain lake and green hills" },
      { src: unsplash("photo-1597074866923-dc0589150358", 900), alt: "A hill town among forested mountain slopes" },
    ],
    attractions: ["Mall Road", "Lal Tibba", "Kempty Falls"],
    packages: [{
      id: "mussoorie-weekend",
      name: "Mussoorie Weekend",
      price: "₹12,999*",
      duration: "3 days",
      summary: "A short hill escape with Landour walks and a Lal Tibba viewpoint visit.",
      itinerary: [
        "Arrive in Mussoorie and check in",
        "Explore Landour, Mall Road, and Lal Tibba",
        "Breakfast, check out, and departure",
      ],
      inclusions: ["2 nights in a sample hillside hotel", "Daily breakfast", "Local sightseeing transfers"],
      hotel: { category: "Sample 3-star hillside hotel", nights: "2 nights", details: "Property and room category are illustrative; confirm before booking." },
      transport: { mode: "Local cab transfers (sample)", details: "Pickup and sightseeing route details to be confirmed." },
      faqs: samplePackageFaqs,
    }],
  },
];

export const experiences = [
  { number: "01 / OUT THERE", icon: "⌁", title: "Wild & wide open", description: "For the ones who find their quiet on the trail." },
  { number: "02 / AT THE TABLE", icon: "◒", title: "Come hungry", description: "Local kitchens, market mornings, one more bite." },
  { number: "03 / TAKE IT SLOW", icon: "☼", title: "Time well spent", description: "Less itinerary. More see-where-the-day-goes." },
];
