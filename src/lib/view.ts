import type { EventView } from "./events";
import type { StripEvent } from "@/components/home/EventStrip";
import { getDestination } from "@/content/destinations";
import { ROOM_TIERS } from "@/content/program";
import { dateRange, money, monthTag } from "./format";

export function toStrip(events: EventView[]): StripEvent[] {
  return events.map((e) => {
    const m = monthTag(e.startDate);
    const d = getDestination(e.destinationSlug);
    return {
      slug: e.slug,
      dest: d?.name.split(" · ")[0] ?? e.location,
      month: m.month,
      year: m.year,
      dates: dateRange(e.startDate, e.endDate),
      image: e.heroImage || d?.image || null,
      fromPrice: money(e.fromCents, e.currency),
      roomsLeft: e.roomTypes.reduce((a, r) => a + r.available, 0),
      roomsTotal: e.roomTypes.reduce((a, r) => a + r.inventory, 0),
      start: new Date(e.startDate).toISOString(),
    };
  });
}

/** Lowest current price per tier across upcoming events (falls back to the default rate card). */
export function tierPrices(events: EventView[]) {
  return ROOM_TIERS.map((t) => {
    const prices = events.flatMap((e) => e.roomTypes.filter((r) => r.tier === t.tier).map((r) => r.priceCents));
    return { ...t, from: money(prices.length ? Math.min(...prices) : t.priceCents) };
  });
}

export function nextEvent(events: EventView[]) {
  const e = events[0];
  if (!e) return null;
  const d = getDestination(e.destinationSlug);
  return { title: d?.name.split(" · ")[0] ?? e.title, dates: dateRange(e.startDate, e.endDate), href: `/events/${e.slug}` };
}
