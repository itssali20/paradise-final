// Competitions, itinerary, evening events, activities, packages, room tiers, gallery, films.

export type Competition = {
  slug: string;
  name: string;
  short: string;
  prize: string;
  image: string;
  night: string;
  description: string;
  eligibility: string[];
  judging: string[];
  entry: string[];
};

export const COMPETITIONS: Competition[] = [
  {
    slug: "miss-paradise", name: "Miss Paradise", short: "Our signature pageant, crowned in front of every guest.",
    prize: "$10,000", image: "/media/ev-miss-paradise.webp", night: "Day 5",
    description:
      "The crown jewel of every Paradise Club event. Elegance, confidence, charisma and talent, judged live on stage in front of all 200 guests and streamed to our audience on YouTube and social media.",
    eligibility: ["Ladies 18 years or older on the day of the event", "Single and attending as a Paradise Club guest", "Signed participant and media release"],
    judging: ["Evening gown presentation", "Swimwear presentation", "On-stage question", "Stage presence and charisma"],
    entry: ["Apply online with two recent photos", "Short video introduction (optional)", "Selection call with our coordinators", "Invitation confirmed in writing"],
  },
  {
    slug: "bikini", name: "Bikini Contest", short: "On the beach, in front of the whole resort.",
    prize: "$10,000", image: "/media/comp-bikini.webp", night: "Day 4",
    description:
      "Sun, sand and the whole resort cheering from the beach. The Bikini Contest is the loudest afternoon of the week: a runway on the sand, live DJ and a panel of guest judges.",
    eligibility: ["Ladies 18 years or older", "Paradise Club guest at the event", "Signed participant and media release"],
    judging: ["Beach runway walk", "Confidence and presence", "Audience reaction", "Panel score"],
    entry: ["Apply online with two recent photos", "Choose your event", "Coordinator confirmation", "Rehearsal on day 3"],
  },
  {
    slug: "lingerie", name: "Lingerie Fashion", short: "A runway night of lingerie and evening fashion.",
    prize: "$10,000", image: "/media/lingerie-night.webp", night: "Day 4 · Night",
    description:
      "A glamorous runway night of lingerie and evening fashion, staged with lights, music and designers. Tasteful, elegant and unforgettable.",
    eligibility: ["Ladies 18 years or older", "Paradise Club guest at the event", "Signed participant and media release"],
    judging: ["Runway walk", "Styling", "Elegance", "Panel score"],
    entry: ["Apply online with portfolio or photos", "Fitting with our stylists on arrival", "Rehearsal", "Showtime"],
  },
  {
    slug: "talent", name: "International Talent", short: "Singing and dancing, judged live on stage.",
    prize: "$10,000", image: "/media/ev-rock-band.webp", night: "Day 6",
    description:
      "Singers, dancers and performers from around the world take the Paradise stage with a live band and full production. Many of our ladies perform as Paradise Club entertainers.",
    eligibility: ["Performers 18 years or older", "Paradise Club guest at the event", "Original or licensed performance"],
    judging: ["Technique", "Originality", "Stage presence", "Audience vote"],
    entry: ["Apply online with a performance video", "Technical rider call", "Sound check on day 5", "Live performance"],
  },
];

export const ITINERARY = [
  { day: "01", title: "Arrival", text: "Resort check-in and welcome reception.", image: "un:1780631742225-053ddbd9a9ca" },
  { day: "02", title: "Beach day", text: "Beach activities, snorkeling and the welcome celebration.", image: "/media/act-coral.webp" },
  { day: "03", title: "Adventure", text: "Water sports, excursions and Latin dance night.", image: "/media/act-jet-ski.webp" },
  { day: "04", title: "Fashion & bikini", text: "Fashion presentations and the Bikini Contest.", image: "/media/comp-bikini.webp" },
  { day: "05", title: "Miss Paradise", text: "Resort leisure, the Miss Paradise Contest and evening entertainment.", image: "/media/ev-miss-paradise.webp" },
  { day: "06", title: "Talent & awards", text: "Talent competition, awards and the farewell celebration.", image: "/media/ev-rock-band.webp" },
  { day: "07", title: "Departure", text: "Breakfast, goodbyes and departures.", image: "un:1520115736066-2190b58a4b9e" },
];

export const EVENINGS = [
  { n: "I", tag: "Latin dance night", title: "Tango Night", text: "Tango, salsa and bachata with live music under the stars.", image: "un:1575448913281-98e9e5d3f193" },
  { n: "II", tag: "Themed parties", title: "Masquerade", text: "Masks, costumes and a different theme every night.", image: "/media/ev-masquerade.webp" },
  { n: "III", tag: "After dark", title: "Nightclub Parties", text: "DJs, lights and dancing until the early hours.", image: "/media/ev-nightclub.webp" },
  { n: "IV", tag: "Live music", title: "Live Music", text: "Concerts and live bands on the resort stage.", image: "/media/ev-rock-band.webp" },
  { n: "V", tag: "Comedy", title: "Stand-up Comedy", text: "Guests and entertainers take the mic.", image: "/media/ev-comedy.webp" },
  { n: "VI", tag: "Costume night", title: "Costume Party", text: "Dress up, play a role, win the night.", image: "/media/ev-costume.webp" },
  { n: "VII", tag: "Golden hour", title: "Sunset Cruise", text: "Turquoise water and white sand on the horizon.", image: "un:1552600337-6f42e4fb2e78" },
  { n: "VIII", tag: "Every day", title: "Pool Parties", text: "Music, drinks and 200 guests who came to meet.", image: "un:1696668827476-8c99c513805c" },
  { n: "IX", tag: "The final night", title: "Awards & Farewell", text: "Miss Paradise is crowned. The farewell begins.", image: "un:1671541830281-1f2e4d10dfb1" },
];

export const ACTIVITIES = [
  { name: "Jet Ski", cat: "Ocean", image: "/media/act-jet-ski.webp", text: "Full-throttle runs across the bay." },
  { name: "Parasailing", cat: "Ocean", image: "/media/act-parasailing.webp", text: "Float above the turquoise water." },
  { name: "Scuba Diving", cat: "Ocean", image: "/media/act-scuba.webp", text: "Guided dives for every level." },
  { name: "Snorkeling", cat: "Ocean", image: "/media/act-coral.webp", text: "Coral gardens and tropical fish." },
  { name: "Water Skiing", cat: "Ocean", image: "/media/act-water-ski.webp", text: "Behind the boat, across the lagoon." },
  { name: "Wakeboarding", cat: "Ocean", image: "/media/act-wakeboard.webp", text: "Carve the wake at sunrise." },
  { name: "Sunset Cruise", cat: "Ocean", image: "un:1552600337-6f42e4fb2e78", text: "Champagne at golden hour." },
  { name: "Beach Volleyball", cat: "Beach", image: "un:1634501087922-c01c76ed66d6", text: "Tournaments on the sand." },
  { name: "Horseback at Sunset", cat: "Beach", image: "un:1618066860737-df4d383c98c3", text: "Ride the shoreline at dusk." },
  { name: "Latin Dance", cat: "Evenings", image: "un:1575448913281-98e9e5d3f193", text: "Salsa, bachata and tango lessons." },
  { name: "Fashion Shows", cat: "Evenings", image: "un:1762430815576-6b69de7a1f5f", text: "Swimwear and tropical fashion nights." },
  { name: "Themed Parties", cat: "Evenings", image: "/media/ev-masquerade.webp", text: "Masquerade, costume and white nights." },
];

export const ROOM_TIERS = [
  {
    tier: 1, name: "Luxury Room", image: "un:1668277155881-9d3bccb1683a",
    description: "An elegant king room in the heart of the resort, steps from the pool and the beach.",
    features: ["King bed or twin beds", "Garden or pool view", "Rain shower", "All-inclusive dining & drinks"],
    priceCents: 490000, companionCents: 240000, maxGuests: 2,
  },
  {
    tier: 2, name: "Ocean-View Room", image: "un:1776876648949-63ccabf63b10",
    description: "Wake up to the sea. Floor-to-ceiling windows and a private balcony over the water.",
    features: ["King bed", "Private balcony", "Ocean view", "All-inclusive dining & drinks"],
    priceCents: 590000, companionCents: 260000, maxGuests: 2,
  },
  {
    tier: 3, name: "Ocean-View Suite", image: "un:1779942578833-5f00dc79d6d1",
    description: "A separate living room, a freestanding tub facing the ocean and a terrace for sunsets.",
    features: ["Separate living room", "Soaking tub with a view", "Large terrace", "Priority event seating"],
    priceCents: 790000, companionCents: 290000, maxGuests: 2,
  },
  {
    tier: 4, name: "Paradise Villa", image: "un:1596178067639-5c6e68aea6dc",
    description: "A grandiose private villa: the high life of Paradise by day, your own mansion by night.",
    features: ["Private pool", "Butler service", "VIP table at every event", "Very limited availability"],
    priceCents: 1490000, companionCents: 350000, maxGuests: 2,
  },
];

export const PACKAGES = [
  {
    n: "I", name: "Gentleman", image: "un:1520115736066-2190b58a4b9e",
    points: ["7 days / 6 nights at the resort", "Every event: Bikini Contest, Miss Paradise, Tango Night, the Sunset Cruise", "Scuba, snorkeling, jet ski, parasailing, horseback riding", "A resort shared only with 200 elite singles"],
    cta: "Choose your room", href: "/events",
  },
  {
    n: "II", name: "Gentleman & Lady", image: "un:1772308113209-cf25636ddfd5",
    points: ["Everything in Gentleman", "Invite the lady you've been talking to online", "You cover her trip; we coordinate her stay", "Meet in person, without the pressure of a first date"],
    cta: "Invite her", href: "/events",
  },
  {
    n: "III", name: "Paradise Villa", image: "un:1543489822-c49534f3271f",
    points: ["All the perks of Paradise Club", "A grandiose private villa at the resort", "The high life by day, a private getaway by night", "Very limited availability"],
    cta: "Discover the villa", href: "/villas",
  },
];

export type GalleryItem = { src: string; cat: "Models" | "Nights" | "Resorts" | "Adventure"; ar: number; alt: string };

export const GALLERY: GalleryItem[] = [
  { src: "/media/comp-bikini.webp", cat: "Models", ar: 0.75, alt: "Bikini contest" },
  { src: "/media/act-jet-ski.webp", cat: "Adventure", ar: 0.51, alt: "Jet ski" },
  { src: "un:1780631742225-053ddbd9a9ca", cat: "Resorts", ar: 1.5, alt: "Infinity pool" },
  { src: "/media/ev-masquerade.webp", cat: "Nights", ar: 0.51, alt: "Masquerade night" },
  { src: "/media/club-rain.webp", cat: "Models", ar: 1.33, alt: "Paradise Club photoshoot" },
  { src: "/media/dest-costa-rica.webp", cat: "Resorts", ar: 1, alt: "Costa Rica resort" },
  { src: "/media/act-parasailing.webp", cat: "Adventure", ar: 0.9, alt: "Parasailing" },
  { src: "/media/ev-miss-paradise.webp", cat: "Nights", ar: 1.23, alt: "Miss Paradise contest" },
  { src: "/media/ladies.webp", cat: "Models", ar: 0.75, alt: "Ladies on the beach" },
  { src: "un:1596178067639-5c6e68aea6dc", cat: "Resorts", ar: 1.5, alt: "Private villa" },
  { src: "/media/act-coral.webp", cat: "Adventure", ar: 0.51, alt: "Coral reef" },
  { src: "/media/ev-nightclub.webp", cat: "Nights", ar: 1.3, alt: "Nightclub party" },
  { src: "/media/lingerie-night.webp", cat: "Models", ar: 1.5, alt: "Lingerie fashion night" },
  { src: "/media/dest-jamaica.webp", cat: "Resorts", ar: 1.6, alt: "Jamaica resort pool" },
  { src: "/media/act-water-ski.webp", cat: "Adventure", ar: 0.9, alt: "Water skiing" },
  { src: "/media/ev-costume.webp", cat: "Nights", ar: 0.99, alt: "Costume party" },
  { src: "/media/comp-lingerie.webp", cat: "Models", ar: 0.75, alt: "Fashion night backstage" },
  { src: "un:1590523277543-a94d2e4eb00b", cat: "Resorts", ar: 1.5, alt: "Maldives villas" },
  { src: "/media/act-wakeboard.webp", cat: "Adventure", ar: 1.75, alt: "Wakeboarding" },
  { src: "/media/ev-rock-band.webp", cat: "Nights", ar: 1.27, alt: "Live band" },
  { src: "/media/dest-greek-islands.webp", cat: "Resorts", ar: 1.33, alt: "Greek island harbour" },
  { src: "/media/act-scuba.webp", cat: "Adventure", ar: 0.9, alt: "Scuba diving" },
  { src: "/media/ev-comedy.webp", cat: "Nights", ar: 1.04, alt: "Comedy night" },
  { src: "un:1738762932370-468a90e0ff68", cat: "Resorts", ar: 1.5, alt: "Bora Bora lagoon" },
];

export const FILMS = [
  { id: "48719", title: "Pool day" },
  { id: "36167", title: "Pool party" },
  { id: "21236", title: "Drinks in the pool" },
  { id: "4446", title: "Yacht night" },
  { id: "49235", title: "Latin dance night" },
  { id: "47779", title: "On the runway" },
];
