// Central media helpers.
// Remote stock media (Unsplash photos, Mixkit clips) is used until `npm run media:pull`
// downloads every file into /public/media/cdn and writes media-local.json — then the
// site serves everything from its own domain automatically.
import local from "./media-local.json";

const map = local as Record<string, string>;

/** Unsplash photo by id at a given width. */
export function un(id: string, w = 1600): string {
  const key = `un:${id}`;
  if (map[key]) return map[key];
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=78`;
}

/** Mixkit clip by id. */
export function mx(id: string, q: "360" | "720" = "720"): string {
  const key = `mx:${id}:${q}`;
  if (map[key]) return map[key];
  return `https://assets.mixkit.co/videos/${id}/${id}-${q}.mp4`;
}

export function mxPoster(id: string): string {
  const key = `mxp:${id}`;
  if (map[key]) return map[key];
  return `https://assets.mixkit.co/videos/${id}/${id}-thumb-720-0.jpg`;
}

/** Resolve an image reference: "un:<id>" → Unsplash, "/media/..." → local. */
export function img(ref: string | null | undefined, w = 1600): string {
  if (!ref) return un("1559956144-83a135c9872e", w);
  if (ref.startsWith("un:")) return un(ref.slice(3), w);
  return ref;
}

export const VIDEO = {
  heroDesktop: "/media/v/hero-reel-1600.mp4",
  heroMobile: "/media/v/hero-reel-960.mp4",
  heroPoster: "/media/hero-reel.webp",
  ladiesDesktop: "/media/v/ladies-1280.mp4",
  ladiesMobile: "/media/v/ladies-854.mp4",
  ladiesPoster: "/media/hero.webp",
  promo: "/media/v/promo.mp4",
  promoPoster: "/media/promo.webp",
};

/** Mixkit stock clip ids used across the site (free licence, no attribution required). */
export const CLIPS = {
  turquoise: "1114",
  underwater: "37021",
  stage: "48653",
  beach: "24926",
  pool: "40105",
  horseback: "46807",
  couple: "44495",
};
