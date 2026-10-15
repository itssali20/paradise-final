import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";
import { DESTINATIONS } from "@/content/destinations";
import { COMPETITIONS } from "@/content/program";
import { LEGAL } from "@/content/legal";
import { getUpcomingEvents } from "@/lib/events";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();
  const statics = ["", "/events", "/destinations", "/rooms", "/villas", "/ladies", "/casting", "/gentlemen", "/competitions", "/experience", "/activities", "/membership", "/gallery", "/about", "/contact", "/register"];
  const events = await getUpcomingEvents().catch(() => []);
  return [
    ...statics.map((p) => ({ url: base + p, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 })),
    ...events.map((e) => ({ url: `${base}/events/${e.slug}`, lastModified: now, priority: 0.9 })),
    ...DESTINATIONS.map((d) => ({ url: `${base}/destinations/${d.slug}`, lastModified: now, priority: 0.7 })),
    ...COMPETITIONS.map((c) => ({ url: `${base}/competitions/${c.slug}`, lastModified: now, priority: 0.6 })),
    ...LEGAL.map((l) => ({ url: `${base}/legal/${l.slug}`, lastModified: now, priority: 0.2 })),
  ];
}
