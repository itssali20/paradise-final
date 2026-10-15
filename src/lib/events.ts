import "server-only";
import { and, asc, eq, gt, inArray, or, sql } from "drizzle-orm";
import { db, hasDb, s } from "@/db";
import { sampleEvents } from "@/content/sample-events";

export type RoomTypeView = {
  id: string;
  name: string;
  tier: number;
  description: string | null;
  image: string | null;
  features: string[];
  priceCents: number;
  companionCents: number;
  maxGuests: number;
  inventory: number;
  available: number;
};

export type EventView = {
  id: string;
  slug: string;
  title: string;
  destinationSlug: string;
  resortName: string;
  resortSummary: string | null;
  location: string;
  heroImage: string | null;
  startDate: Date;
  endDate: Date;
  status: string;
  currency: string;
  menCapacity: number;
  womenCapacity: number;
  menLeft: number;
  womenLeft: number;
  depositType: "PERCENT" | "FIXED";
  depositValue: number;
  installments: number;
  balanceDueDays: number;
  roomTypes: RoomTypeView[];
  fromCents: number;
  showcase: boolean;
};

/** SQL condition for bookings that currently consume inventory. */
export const activeBooking = () =>
  or(
    inArray(s.bookings.status, ["DEPOSIT_PAID", "PAID"]),
    and(inArray(s.bookings.status, ["HOLD", "PENDING_PAYMENT"]), gt(s.bookings.holdExpiresAt, new Date())),
  );

function fromSample(): EventView[] {
  return sampleEvents().map((e) => {
    const roomTypes = e.roomTypes.map((r, i) => ({
      id: `${e.slug}-${i}`, ...r, available: Math.max(1, r.inventory - Math.round(r.inventory * (0.25 + i * 0.12))),
    }));
    return {
      id: e.slug, slug: e.slug, title: e.title, destinationSlug: e.destinationSlug, resortName: e.resortName,
      resortSummary: e.resortSummary, location: e.location, heroImage: e.heroImage, startDate: e.startDate,
      endDate: e.endDate, status: e.status, currency: "usd", menCapacity: 100, womenCapacity: 100,
      menLeft: 100, womenLeft: 100, depositType: "PERCENT", depositValue: 25, installments: 2, balanceDueDays: 45,
      roomTypes, fromCents: Math.min(...roomTypes.map((r) => r.priceCents)), showcase: true,
    };
  });
}

async function hydrate(rows: (typeof s.events.$inferSelect)[]): Promise<EventView[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [rts, used, people] = await Promise.all([
    db.select().from(s.roomTypes).where(inArray(s.roomTypes.eventId, ids)).orderBy(asc(s.roomTypes.sortOrder)),
    db
      .select({ roomTypeId: s.bookings.roomTypeId, n: sql<number>`count(*)::int` })
      .from(s.bookings)
      .where(and(inArray(s.bookings.eventId, ids), activeBooking()))
      .groupBy(s.bookings.roomTypeId),
    db
      .select({
        eventId: s.bookings.eventId,
        men: sql<number>`coalesce(sum(${s.bookings.men}),0)::int`,
        women: sql<number>`coalesce(sum(${s.bookings.women}),0)::int`,
      })
      .from(s.bookings)
      .where(and(inArray(s.bookings.eventId, ids), activeBooking()))
      .groupBy(s.bookings.eventId),
  ]);
  const usedMap = new Map(used.map((u) => [u.roomTypeId, u.n]));
  return rows.map((e) => {
    const roomTypes = rts
      .filter((r) => r.eventId === e.id)
      .map((r) => ({
        id: r.id, name: r.name, tier: r.tier, description: r.description, image: r.image, features: r.features,
        priceCents: r.priceCents, companionCents: r.companionCents, maxGuests: r.maxGuests, inventory: r.inventory,
        available: Math.max(0, r.inventory - (usedMap.get(r.id) ?? 0)),
      }));
    const p = people.find((x) => x.eventId === e.id);
    return {
      id: e.id, slug: e.slug, title: e.title, destinationSlug: e.destinationSlug, resortName: e.resortName,
      resortSummary: e.resortSummary, location: e.location, heroImage: e.heroImage, startDate: e.startDate,
      endDate: e.endDate, status: e.status, currency: e.currency, menCapacity: e.menCapacity,
      womenCapacity: e.womenCapacity, menLeft: Math.max(0, e.menCapacity - (p?.men ?? 0)),
      womenLeft: Math.max(0, e.womenCapacity - (p?.women ?? 0)), depositType: e.depositType,
      depositValue: e.depositValue, installments: e.installments, balanceDueDays: e.balanceDueDays, roomTypes,
      fromCents: roomTypes.length ? Math.min(...roomTypes.map((r) => r.priceCents)) : 0, showcase: false,
    };
  });
}

/** Published upcoming events, soonest first. Falls back to the showcase calendar without a database. */
export async function getUpcomingEvents(): Promise<EventView[]> {
  if (!hasDb) return fromSample();
  try {
    const rows = await db
      .select()
      .from(s.events)
      .where(and(inArray(s.events.status, ["PUBLISHED", "SOLD_OUT"]), gt(s.events.endDate, new Date())))
      .orderBy(asc(s.events.startDate));
    return hydrate(rows);
  } catch (e) {
    console.error("[events] falling back to showcase:", (e as Error).message);
    return fromSample();
  }
}

export async function getEventBySlug(slug: string): Promise<EventView | null> {
  if (!hasDb) return fromSample().find((e) => e.slug === slug) ?? null;
  const rows = await db.select().from(s.events).where(eq(s.events.slug, slug)).limit(1);
  if (!rows.length || rows[0].status === "DRAFT") return null;
  return (await hydrate(rows))[0];
}

export async function getEventById(id: string): Promise<EventView | null> {
  const rows = await db.select().from(s.events).where(eq(s.events.id, id)).limit(1);
  return rows.length ? (await hydrate(rows))[0] : null;
}

export async function hydrateAny(rows: (typeof s.events.$inferSelect)[]) {
  return hydrate(rows);
}
