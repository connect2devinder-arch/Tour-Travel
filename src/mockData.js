const storageUrl = (path) =>
  `https://firebasestorage.googleapis.com/v0/b/tour-83b6c.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media`;

const galleryImage = (dest, n) => storageUrl(`destinations/${dest}/${n}.jpg`);
const placeImage = (dest, slug) => storageUrl(`destinations/${dest}/${slug}.jpg`);

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

// Famous places per destination. Used by the place carousel and, for some
// packages, as that package's own photo set.
const shimlaPlaces = [
  { name: "Mall Road", slug: "mall-road", image: placeImage("shimla", "mall-road"), alt: "Shimla Mall Road with the Indian flag and crowds at The Ridge" },
  { name: "The Ridge", slug: "the-ridge", image: placeImage("shimla", "the-ridge"), alt: "The Ridge in Shimla with colonial buildings and people" },
  { name: "Jakhu Temple", slug: "jakhu-temple", image: placeImage("shimla", "jakhu-temple"), alt: "Jakhu Temple on Jakhu Hill above Shimla" },
  { name: "Naldehra", slug: "naldehra", image: placeImage("shimla", "naldehra"), alt: "Naldehra golf course and deodar forest near Shimla" },
  { name: "Kufri", slug: "kufri", image: placeImage("shimla", "kufri"), alt: "Snow-covered hills and trails at Kufri near Shimla" },
];

const manaliPlaces = [
  { name: "Mall Road", slug: "mall-road", image: placeImage("manali", "mall-road"), alt: "Manali Mall Road with shops and visitors" },
  { name: "Hadimba Temple", slug: "hadimba-temple", image: placeImage("manali", "hadimba-temple"), alt: "Hadimba Devi Temple in the cedar forests of Manali" },
  { name: "Solang Valley", slug: "solang-valley", image: placeImage("manali", "solang-valley"), alt: "Solang Valley with snow-covered slopes near Manali" },
  { name: "Old Manali", slug: "old-manali", image: placeImage("manali", "old-manali"), alt: "Old Manali with traditional houses and the Beas river" },
  { name: "Vashisht Hot Springs", slug: "vashisht-hot-springs", image: placeImage("manali", "vashisht-hot-springs"), alt: "Vashisht Hot Springs temple near Manali" },
];

const spitiPlaces = [
  { name: "Key Monastery", slug: "key-monastery", image: placeImage("spiti", "key-monastery"), alt: "Key Monastery on a hillside above the Spiti valley" },
  { name: "Dhankar Monastery", slug: "dhankar-monastery", image: placeImage("spiti", "dhankar-monastery"), alt: "Dhankar Monastery perched on a cliff in Spiti" },
  { name: "Chandratal Lake", slug: "chandratal-lake", image: placeImage("spiti", "chandratal-lake"), alt: "Chandratal Lake surrounded by mountains in Spiti" },
  { name: "Kibber Village", slug: "kibber-village", image: placeImage("spiti", "kibber-village"), alt: "Kibber village houses on a mountain slope in Spiti" },
  { name: "Tabo Monastery", slug: "tabo-monastery", image: placeImage("spiti", "tabo-monastery"), alt: "Tabo Monastery in the Spiti valley" },
];

const mussooriePlaces = [
  { name: "Mall Road", slug: "mall-road", image: placeImage("mussoorie", "mall-road"), alt: "Mussoorie Mall Road with cycle rickshaws and shops" },
  { name: "Gun Hill", slug: "gun-hill", image: placeImage("mussoorie", "gun-hill"), alt: "Gun Hill viewpoint above Mussoorie" },
  { name: "Kempty Falls", slug: "kempty-falls", image: placeImage("mussoorie", "kempty-falls"), alt: "Kempty Falls cascading near Mussoorie" },
  { name: "Lal Tibba", slug: "lal-tibba", image: placeImage("mussoorie", "lal-tibba"), alt: "Lal Tibba viewpoint over the Doon Valley near Mussoorie" },
  { name: "Company Garden", slug: "company-garden", image: placeImage("mussoorie", "company-garden"), alt: "Company Garden and greenery in Mussoorie" },
];

/** Turns a place list into a package photo set. */
const toPhotos = (places) => places.map((place) => ({ src: place.image, alt: place.alt }));

// Temporary front-end fixtures. Replace or expand these as requirements evolve.
export const destinations = [
  {
    id: "shimla",
    name: "Shimla",
    country: "Himachal Pradesh, India",
    tags: "shimla simla himachal india",
    tagline: "Pine walks & mountain mornings",
    description: "Take in Mall Road, old hill-town charm, and quiet views over the Himalayan slopes.",
    image: galleryImage("shimla", 1),
    imageAlt: "Aerial drone view of Shimla hill town with Jakhu Temple on the hilltop",
    photos: [
      { src: galleryImage("shimla", 1), alt: "Aerial drone view of Shimla hill town with Jakhu Temple on the hilltop" },
      { src: galleryImage("shimla", 2), alt: "Aerial view of Shimla city during the daytime" },
      { src: galleryImage("shimla", 3), alt: "Aerial view of a small hill town on a mountain" },
      { src: galleryImage("shimla", 4), alt: "White houses on a forested hill slope" },
      { src: galleryImage("shimla", 5), alt: "A small village on a hill in the Himalayas" },
    ],
    places: shimlaPlaces,
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
    image: galleryImage("manali", 1),
    imageAlt: "Aerial view of Manali town with green-roofed buildings below snow-covered mountains",
    photos: [
      { src: galleryImage("manali", 1), alt: "Aerial view of Manali town with green-roofed buildings below snow-covered mountains" },
      { src: galleryImage("manali", 2), alt: "Aerial view of a town near snow-covered mountains during the daytime" },
      { src: galleryImage("manali", 3), alt: "Scenic view of a mountain town with a river running through it" },
      { src: galleryImage("manali", 4), alt: "Houses sitting on the side of a mountain" },
      { src: galleryImage("manali", 5), alt: "Scenic view of a town in the Himalayan mountains" },
    ],
    places: manaliPlaces,
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
      photos: toPhotos(manaliPlaces),
    }],
  },
  {
    id: "lahaul-spiti",
    name: "Lahaul & Spiti",
    country: "Himachal Pradesh, India",
    tags: "lahaul spiti kaza himachal india",
    tagline: "High passes & quiet monasteries",
    description: "Discover high-altitude villages and monasteries at an unhurried pace. Mountain routes are seasonal.",
    image: galleryImage("spiti", 3),
    imageAlt: "Wide Spiti valley with a river surrounded by snow-capped mountains",
    photos: [
      { src: galleryImage("spiti", 1), alt: "Brown and green mountains under white clouds" },
      { src: galleryImage("spiti", 2), alt: "A river running through a rocky canyon" },
      { src: galleryImage("spiti", 3), alt: "Wide Spiti valley with a river surrounded by snow-capped mountains" },
      { src: galleryImage("spiti", 4), alt: "A village nestled at the foot of snow-capped mountains" },
      { src: galleryImage("spiti", 5), alt: "Buildings of a mountain village on a rugged slope" },
    ],
    places: spitiPlaces,
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
      photos: toPhotos(spitiPlaces),
    }],
  },
  {
    id: "mussoorie",
    name: "Mussoorie",
    country: "Uttarakhand, India",
    tags: "mussoorie masuri uttarakhand india",
    tagline: "Cloud-kissed walks & chai stops",
    description: "Take hillside walks, look out over the Doon Valley, and leave room for a slow café stop.",
    image: galleryImage("mussoorie", 1),
    imageAlt: "Aerial drone view of Mussoorie town surrounded by mountains",
    photos: [
      { src: galleryImage("mussoorie", 1), alt: "Aerial drone view of Mussoorie town surrounded by mountains" },
      { src: galleryImage("mussoorie", 2), alt: "A village on a hill with a mountain in the background" },
      { src: galleryImage("mussoorie", 3), alt: "A view of a small town with mountains in the background" },
      { src: galleryImage("mussoorie", 4), alt: "A scenic view of a valley and mountains under a cloudy sky" },
      { src: galleryImage("mussoorie", 5), alt: "Aerial view of a city on a mountain during the daytime" },
    ],
    places: mussooriePlaces,
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
      photos: toPhotos(mussooriePlaces),
    }],
  },
];

export const experiences = [
  { number: "01 / OUT THERE", icon: "⌁", title: "Wild & wide open", description: "For the ones who find their quiet on the trail." },
  { number: "02 / AT THE TABLE", icon: "◒", title: "Come hungry", description: "Local kitchens, market mornings, one more bite." },
  { number: "03 / TAKE IT SLOW", icon: "☼", title: "Time well spent", description: "Less itinerary. More see-where-the-day-goes." },
];
