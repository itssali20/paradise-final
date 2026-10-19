export const SITE = {
  name: "Paradise Club",
  program: "Elite Vacations by Paradise Club",
  slogan: "Where Paradise Meets Romance",
  headline: "100 Extraordinary Women. 100 Successful Men. One Unforgettable Paradise.",
  pillars: "Luxury. Adventure. Friendship. Romance.",
  tagline: "Elite Vacations · Where Paradise Meets Romance",
  description:
    "Elite Vacations by Paradise Club: seven days and six nights at an exclusive luxury resort with approximately 100 successful gentlemen and 100 extraordinary women. Luxury singles vacations, international competitions and exclusive resorts.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://paradise-club-premium.vercel.app",
  phone: "1-877-677-7795",
  phoneHref: "tel:18776777795",
  whatsapp: "https://wa.me/18776777795",
  email: "reservations@paradise-club.com",
  company: "Diversified Global Ventures, Corp.",
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "TikTok", href: "https://tiktok.com" },
    { label: "Facebook", href: "https://facebook.com" },
  ],
};

export const NAV = [
  { href: "/", label: "Home", img: "/media/hero-reel.webp" },
  { href: "/events", label: "Events", img: "un:1749183563789-ae17d4a952d2" },
  { href: "/destinations", label: "Destinations", img: "un:1661887561486-1f771e7b2cab" },
  { href: "/rooms", label: "Rooms & Villas", img: "un:1779942578833-5f00dc79d6d1" },
  { href: "/ladies", label: "For Ladies", img: "/media/ladies.webp" },
  { href: "/gentlemen", label: "For Gentlemen", img: "un:1520115736066-2190b58a4b9e" },
  { href: "/casting", label: "Paradise Casting", img: "/media/ev-miss-paradise.webp" },
  { href: "/competitions", label: "Competitions", img: "/media/comp-bikini.webp" },
  { href: "/experience", label: "The Experience", img: "/media/ev-masquerade.webp" },
  { href: "/activities", label: "Activities", img: "/media/act-jet-ski.webp" },
  { href: "/membership", label: "Membership", img: "un:1552600337-6f42e4fb2e78" },
  { href: "/gallery", label: "Gallery", img: "/media/club-rain.webp" },
  { href: "/about", label: "About", img: "un:1780631742225-053ddbd9a9ca" },
  { href: "/contact", label: "Contact", img: "un:1559956144-83a135c9872e" },
];

export const FOOTER_NAV = [
  {
    title: "Paradise",
    links: [
      { href: "/events", label: "Upcoming events" },
      { href: "/destinations", label: "Destinations" },
      { href: "/rooms", label: "Rooms & villas" },
      { href: "/villas", label: "Paradise Villas" },
      { href: "/experience", label: "The seven days" },
      { href: "/activities", label: "Activities" },
    ],
  },
  {
    title: "Join",
    links: [
      { href: "/ladies", label: "For ladies" },
      { href: "/casting", label: "Paradise Casting" },
      { href: "/gentlemen", label: "For gentlemen" },
      { href: "/competitions", label: "Competitions" },
      { href: "/membership", label: "Membership" },
      { href: "/register", label: "Create an account" },
      { href: "/account", label: "My account" },
    ],
  },
  {
    title: "Club",
    links: [
      { href: "/about", label: "About Paradise Club" },
      { href: "/gallery", label: "Gallery & films" },
      { href: "/contact", label: "Contact" },
      { href: "/contact?type=partner", label: "Hotel partners" },
      { href: "/contact?type=sponsor", label: "Sponsors" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of service" },
      { href: "/legal/privacy", label: "Privacy policy" },
      { href: "/legal/cancellation", label: "Cancellation & refunds" },
      { href: "/legal/contest-rules", label: "Contest rules" },
      { href: "/legal/community", label: "Community standards" },
    ],
  },
];
