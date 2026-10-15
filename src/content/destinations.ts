export type Region = "Caribbean & Americas" | "Mediterranean & Europe" | "Indian Ocean & Pacific";

export type Destination = {
  slug: string;
  name: string;
  region: Region;
  area: string;
  image: string;
  gallery: string[];
  tagline: string;
  story: string;
  highlights: string[];
};

export const REGIONS: Region[] = ["Caribbean & Americas", "Mediterranean & Europe", "Indian Ocean & Pacific"];

export const DESTINATIONS: Destination[] = [
  {
    slug: "cancun", name: "Cancún", region: "Caribbean & Americas", area: "Mexico · Caribbean",
    image: "un:1602088113235-229c19758e9f",
    gallery: ["un:1640617547871-15e4fb41d0c5", "/media/act-coral.webp", "/media/act-jet-ski.webp"],
    tagline: "Turquoise lagoons and the world's second-largest barrier reef.",
    story: "A tropical paradise that remains one of the world's top destinations, with great weather, pumping nightlife and some of the coolest activities in Mexico. Home to the world's second-largest barrier reef, Cancún is ideal for scuba diving and snorkeling.",
    highlights: ["Mesoamerican Reef", "Hotel Zone nightlife", "Isla Mujeres by boat"],
  },
  {
    slug: "playa-del-carmen", name: "Playa del Carmen", region: "Caribbean & Americas", area: "Mexico · Riviera Maya",
    image: "un:1640617547871-15e4fb41d0c5",
    gallery: ["un:1602088113235-229c19758e9f", "/media/act-scuba.webp", "/media/act-parasailing.webp"],
    tagline: "Soft white sand, cenotes and Quinta Avenida.",
    story: "Just south of Cancún on the Riviera Maya: soft white-sand beaches, the lively Quinta Avenida, cenotes for swimming, and a short ferry to the reefs of Cozumel.",
    highlights: ["Cenote swims", "Cozumel reefs", "Quinta Avenida"],
  },
  {
    slug: "bahamas", name: "Bahamas", region: "Caribbean & Americas", area: "Nassau · Paradise Island",
    image: "/media/dest-bahamas.webp",
    gallery: ["un:1559956144-83a135c9872e", "/media/act-parasailing.webp", "/media/act-water-ski.webp"],
    tagline: "Powdery sand, indigo sea and the trade-wind breeze.",
    story: "Mirages of powdery white sand against an indigo sea, and leaning palms rustling in the cooling trade breeze. Secluded, untouched beaches, and stunning beaches with activities galore within a sun-kissed arm's reach.",
    highlights: ["Paradise Island", "Swimming with sharks", "Exuma day trips"],
  },
  {
    slug: "jamaica", name: "Jamaica", region: "Caribbean & Americas", area: "Caribbean",
    image: "/media/dest-jamaica.webp",
    gallery: ["un:1559956144-83a135c9872e", "/media/act-wakeboard.webp", "/media/ev-rock-band.webp"],
    tagline: "Rainforest, mountains and pulsating music.",
    story: "One of the Caribbean's most iconic islands: rainforest, soaring mountains and dramatic coastlines. The scenery is breathtaking, the cuisine is scrumptious, the music is pulsating and the people are unforgettable.",
    highlights: ["Seven Mile Beach", "Dunn's River Falls", "Reggae nights"],
  },
  {
    slug: "st-lucia", name: "St Lucia", region: "Caribbean & Americas", area: "Eastern Caribbean",
    image: "un:1706645616928-1902d9a6b929",
    gallery: ["un:1559956144-83a135c9872e", "/media/act-coral.webp", "/media/act-scuba.webp"],
    tagline: "The Pitons rising majestically from the surf.",
    story: "Greeted by the Piton Mountains rising majestically from the surf, fringed by coral reefs and swaying palms. Exquisite reefs for divers and snorkelers, and trade winds for kite-boarding and windsurfing.",
    highlights: ["The Pitons", "Reef diving", "Kite-boarding"],
  },
  {
    slug: "dominican-republic", name: "Dominican Republic", region: "Caribbean & Americas", area: "Caribbean",
    image: "un:1705507972578-78537a2dda73",
    gallery: ["un:1559956144-83a135c9872e", "/media/act-jet-ski.webp", "/media/act-coral.webp"],
    tagline: "Coral reefs, waterfalls and secluded islands.",
    story: "Vast coral reefs, waterfalls, jungles and secluded islands. Raft the Río Yaque del Norte, then snorkel, dive, kayak, kite-board, sail and surf along the coast.",
    highlights: ["Saona Island", "Waterfall hikes", "Surf & kite"],
  },
  {
    slug: "costa-rica", name: "Costa Rica", region: "Caribbean & Americas", area: "Central America",
    image: "/media/dest-costa-rica.webp",
    gallery: ["un:1559956144-83a135c9872e", "/media/act-parasailing.webp", "/media/act-wakeboard.webp"],
    tagline: "Infinity pools facing the Pacific Ring of Fire.",
    story: "Exquisite beaches lead up to fiery volcanoes through some of the most verdant forest in the world. On the Pacific Ring of Fire, remarkably different from coast to coast.",
    highlights: ["Volcano views", "Rainforest canopy", "Pacific sunsets"],
  },
  {
    slug: "puerto-vallarta", name: "Puerto Vallarta", region: "Caribbean & Americas", area: "Mexico · Pacific",
    image: "/media/dest-puerto-vallarta.webp",
    gallery: ["un:1640617547871-15e4fb41d0c5", "/media/act-jet-ski.webp", "/media/ev-nightclub.webp"],
    tagline: "Cobblestones, a yacht marina and miles of sand.",
    story: "Mexico's prettiest resort town is also one of its most diverse: the cobblestone streets of Old Vallarta, the yacht marina, and from Costalegre to the Riviera Nayarit, miles of sandy beaches, stellar restaurants and lively nightclubs.",
    highlights: ["Old Vallarta", "Marina yachts", "Riviera Nayarit"],
  },
  {
    slug: "panama", name: "Panamá", region: "Caribbean & Americas", area: "Central America",
    image: "un:1632505702897-cc41b0ba3b64",
    gallery: ["un:1559956144-83a135c9872e", "/media/act-scuba.webp", "/media/ev-nightclub.webp"],
    tagline: "Two oceans and a sophisticated skyline in one week.",
    story: "Two oceans, mountains and rainforest, native cultures and vibrant urban life in a single week. Panamá City is a modern, sophisticated metropolis of commerce, arts, fashion and dining.",
    highlights: ["San Blas islands", "Casco Viejo", "Rooftop nights"],
  },
  {
    slug: "hawaii", name: "Hawaii", region: "Indian Ocean & Pacific", area: "Pacific",
    image: "un:1505852679233-d9fd70aff56d",
    gallery: ["un:1559956144-83a135c9872e", "/media/act-water-ski.webp", "/media/act-coral.webp"],
    tagline: "Blue water, hula and the Coconut Coast.",
    story: "Good weather, magnificent views, blue waters, hula and exquisite cuisine. Kauai's wild beauty and the beaches of the Coconut Coast are perfect for a romantic escapade.",
    highlights: ["Nā Pali Coast", "Sunset luau", "Snorkel coves"],
  },
  {
    slug: "bora-bora", name: "Bora Bora", region: "Indian Ocean & Pacific", area: "French Polynesia",
    image: "un:1738762932370-468a90e0ff68",
    gallery: ["un:1601604451607-332d3203d425", "un:1589197331516-4d84b72ebde3", "/media/act-coral.webp"],
    tagline: "Overwater bungalows beneath Mount Otemanu.",
    story: "The jewel of the South Pacific: a lagoon in every shade of blue, overwater bungalows on stilts and the green peak of Mount Otemanu above it all. Snorkel with rays by day and dine over the water by night.",
    highlights: ["Overwater bungalows", "Lagoon safari", "Motu picnics"],
  },
  {
    slug: "maldives", name: "Maldives", region: "Indian Ocean & Pacific", area: "Indian Ocean",
    image: "un:1590523277543-a94d2e4eb00b",
    gallery: ["un:1738762932370-468a90e0ff68", "/media/act-scuba.webp", "/media/act-coral.webp"],
    tagline: "Overwater villas and lagoons in every shade of blue.",
    story: "Overwater villas, white-sand islands and lagoons in every shade of blue: the most romantic setting on Earth.",
    highlights: ["Overwater villas", "Manta dives", "Sandbank dinners"],
  },
  {
    slug: "capri", name: "Capri", region: "Mediterranean & Europe", area: "Italy · Bay of Naples",
    image: "un:1559509354-1c00ed744bcb",
    gallery: ["un:1612698093158-e07ac200d44e", "un:1520115736066-2190b58a4b9e", "/media/act-scuba.webp"],
    tagline: "The island whose charms have seduced for millennia.",
    story: "A breathtaking island whose seductive charms have drawn visitors for thousands of years, from the colourful harbour of Marina Grande up to the famous Piazzetta.",
    highlights: ["Blue Grotto", "The Piazzetta", "Faraglioni by boat"],
  },
  {
    slug: "amalfi-coast", name: "Amalfi Coast", region: "Mediterranean & Europe", area: "Italy · Campania",
    image: "un:1612698093158-e07ac200d44e",
    gallery: ["un:1559509354-1c00ed744bcb", "un:1520115736066-2190b58a4b9e", "/media/ev-masquerade.webp"],
    tagline: "Pastel villages clinging to the cliffs.",
    story: "Pastel villages such as Positano, Amalfi and Ravello cling to the cliffs above the Tyrrhenian Sea. Lemon groves, cliffside terraces and boat trips to hidden coves.",
    highlights: ["Positano", "Ravello terraces", "Hidden coves"],
  },
  {
    slug: "greek-islands", name: "Greek Islands", region: "Mediterranean & Europe", area: "Aegean · Ionian",
    image: "/media/dest-greek-islands.webp",
    gallery: ["un:1520115736066-2190b58a4b9e", "/media/act-water-ski.webp", "/media/ev-nightclub.webp"],
    tagline: "1,400 islands and the most picturesque seascapes on Earth.",
    story: "1,400 islands, 230 of them inhabited, among the Mediterranean's most beautiful assets, with some of the most picturesque seascapes on Earth.",
    highlights: ["Mykonos nights", "Santorini sunsets", "Island hopping"],
  },
  {
    slug: "monaco", name: "Monaco", region: "Mediterranean & Europe", area: "Côte d'Azur",
    image: "un:1595138320174-a64d168e9970",
    gallery: ["un:1691770128504-d02718c998ae", "un:1520115736066-2190b58a4b9e", "/media/ev-nightclub.webp"],
    tagline: "Pristine water, warm weather and high rollers.",
    story: "Pristine blue waters, warm weather and high rollers. Beautiful, chic, great weather and even better food.",
    highlights: ["Monte-Carlo", "Port Hercule yachts", "Casino nights"],
  },
  {
    slug: "cannes", name: "Cannes", region: "Mediterranean & Europe", area: "Côte d'Azur · France",
    image: "un:1691770128504-d02718c998ae",
    gallery: ["un:1595138320174-a64d168e9970", "/media/ev-miss-paradise.webp", "un:1520115736066-2190b58a4b9e"],
    tagline: "La Croisette and the most famous red carpet in the world.",
    story: "The glamour capital of the Riviera: La Croisette, golden beaches, yachts in the Old Port and the most famous red carpet in the world.",
    highlights: ["La Croisette", "Old Port", "Îles de Lérins"],
  },
  {
    slug: "barcelona", name: "Barcelona", region: "Mediterranean & Europe", area: "Spain · Catalonia",
    image: "un:1599484233778-5bdc6b69bbe3",
    gallery: ["/media/dest-malaga.webp", "/media/ev-nightclub.webp", "/media/ev-rock-band.webp"],
    tagline: "Gaudí, tapas and a beachside metropolis.",
    story: "Striking architecture, world-class museums and the rhythms of Catalonia. A beachside metropolis of tapas bars and Gaudí, from hillside parks to public buildings.",
    highlights: ["Sagrada Família", "Barceloneta", "Late-night tapas"],
  },
  {
    slug: "malaga", name: "Málaga · Costa del Sol", region: "Mediterranean & Europe", area: "Spain · Andalusia",
    image: "/media/dest-malaga.webp",
    gallery: ["un:1512753360435-329c4535a9a7", "/media/act-parasailing.webp", "/media/ev-costume.webp"],
    tagline: "Andalusia's city of culture above the Costa del Sol.",
    story: "Andalusia's city of culture, its 'mile of art' compared to Madrid and its dining to Barcelona, crowned by the 11th-century Gibralfaro castle above the Costa del Sol.",
    highlights: ["Gibralfaro", "Marbella beach clubs", "Flamenco nights"],
  },
  {
    slug: "ibiza", name: "Ibiza", region: "Mediterranean & Europe", area: "Balearic Islands · Spain",
    image: "un:1661887561486-1f771e7b2cab",
    gallery: ["/media/ev-nightclub.webp", "un:1696668827476-8c99c513805c", "/media/act-jet-ski.webp"],
    tagline: "Turquoise coves, legendary sunsets and nightlife.",
    story: "Turquoise coves, pine-covered cliffs and legendary sunsets, followed by the most famous nightlife in the Mediterranean.",
    highlights: ["Café del Mar sunsets", "Formentera by boat", "Superclubs"],
  },
  {
    slug: "croatia", name: "Croatia", region: "Mediterranean & Europe", area: "Adriatic",
    image: "un:1593890349122-90a890752e10",
    gallery: ["un:1614122027743-50a9e6e8002f", "un:1520115736066-2190b58a4b9e", "/media/act-scuba.webp"],
    tagline: "A thousand islands on the clearest water in Europe.",
    story: "A thousand islands on the clearest water in Europe: the walls of Dubrovnik, the harbour of Hvar and secluded coves reachable only by boat.",
    highlights: ["Dubrovnik walls", "Hvar harbour", "Boat-only coves"],
  },
  {
    slug: "montenegro", name: "Montenegro", region: "Mediterranean & Europe", area: "Adriatic",
    image: "un:1614122027743-50a9e6e8002f",
    gallery: ["un:1593890349122-90a890752e10", "un:1520115736066-2190b58a4b9e", "/media/act-wakeboard.webp"],
    tagline: "Mountains plunging into the Bay of Kotor.",
    story: "Mountains plunging into the Bay of Kotor, medieval towns on the water and the sandy beaches of the Budva Riviera.",
    highlights: ["Bay of Kotor", "Budva Riviera", "Sveti Stefan"],
  },
];

export const getDestination = (slug: string) => DESTINATIONS.find((d) => d.slug === slug);
