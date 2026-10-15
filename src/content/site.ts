export const SITE = {
  name: "Paradise Club",
  tagline: "Elite Vacations · Where paradise meets romance",
  description:
    "Paradise Club Elite Vacations: seven days and six nights at an exclusive luxury beachfront resort with 100 successful men and 100 fascinating women. A new resort every month. Ladies always attend free.",
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
  { href: "/ladies", label: "Ladies Come Free", img: "/media/ladies.webp" },
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
      { href: "/villas", label: "Paradise Villa" },
      { href: "/experience", label: "The seven days" },
      { href: "/activities", label: "Activities" },
    ],
  },
  {
    title: "Join",
    links: [
      { href: "/ladies", label: "Ladies come free" },
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
      { href: "/about", label: "About Elite Vacations" },
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
