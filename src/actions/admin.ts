"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db, s } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { BookingError, cancelBooking, chargeScheduled, markPaymentPaid, sendBookingEmail } from "@/lib/booking";
import { bookingRef } from "@/lib/format";
import { activeBooking } from "@/lib/events";
import { sql } from "drizzle-orm";
import { getDestination } from "@/content/destinations";
import { ROOM_TIERS } from "@/content/program";
import type { PolicyTier } from "@/db/schema";
import { layout, sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/stripe";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string, d = 0) => { const n = Number(fd.get(k)); return Number.isFinite(n) ? n : d; };
const cents = (fd: FormData, k: string) => Math.round(num(fd, k) * 100);

// ─────────────────────────── Events ───────────────────────────
const eventSchema = z.object({
  destinationSlug: z.string().min(1),
  title: z.string().trim().min(3),
  resortName: z.string().trim().min(2),
  location: z.string().trim().min(2),
  startDate: z.string().min(8),
  endDate: z.string().min(8),
  status: z.enum(["DRAFT", "PUBLISHED", "SOLD_OUT", "CLOSED", "CANCELLED"]),
});

function parsePolicy(fd: FormData): PolicyTier[] {
  const days = fd.getAll("policyDays").map(Number);
  const pct = fd.getAll("policyPct").map(Number);
  const out = days.map((d, i) => ({ daysBefore: d, refundPercent: Math.max(0, Math.min(100, pct[i] ?? 0)) })).filter((t) => Number.isFinite(t.daysBefore) && t.daysBefore >= 0);
  return out.length ? out.sort((a, b) => b.daysBefore - a.daysBefore) : [{ daysBefore: 0, refundPercent: 0 }];
}

function eventValues(fd: FormData) {
  const v = eventSchema.parse({
    destinationSlug: str(fd, "destinationSlug"), title: str(fd, "title"), resortName: str(fd, "resortName"), location: str(fd, "location"),
    startDate: str(fd, "startDate"), endDate: str(fd, "endDate"), status: str(fd, "status") || "DRAFT",
  });
  const depositType = str(fd, "depositType") === "FIXED" ? "FIXED" as const : "PERCENT" as const;
  return {
    ...v,
    startDate: new Date(v.startDate + "T15:00:00Z"),
    endDate: new Date(v.endDate + "T11:00:00Z"),
    resortSummary: str(fd, "resortSummary") || null,
    heroImage: str(fd, "heroImage") || getDestination(v.destinationSlug)?.image || null,
    menCapacity: num(fd, "menCapacity", 100),
    womenCapacity: num(fd, "womenCapacity", 100),
    currency: (str(fd, "currency") || "usd").toLowerCase(),
    depositType,
    depositValue: depositType === "FIXED" ? cents(fd, "depositValue") : Math.max(1, Math.min(100, num(fd, "depositValue", 25))),
    installments: Math.max(1, Math.min(12, num(fd, "installments", 2))),
    balanceDueDays: Math.max(0, num(fd, "balanceDueDays", 45)),
    holdMinutes: Math.max(10, num(fd, "holdMinutes", 15)),
    cancellationPolicy: parsePolicy(fd),
  };
}

export async function createEvent(fd: FormData) {
  const admin = await requireAdmin();
  let id: string;
  try {
    const v = eventValues(fd);
    const slug = `${v.destinationSlug}-${v.startDate.toISOString().slice(0, 7)}`;
    const exists = await db.select({ id: s.events.id }).from(s.events).where(eq(s.events.slug, slug));
    const [ev] = await db.insert(s.events).values({ ...v, slug: exists.length ? `${slug}-${Date.now().toString(36)}` : slug }).returning();
    id = ev.id;
    if (fd.get("defaultTiers") === "on") {
      await db.insert(s.roomTypes).values(ROOM_TIERS.map((t, i) => ({
        eventId: ev.id, name: t.name, tier: t.tier, description: t.description, image: t.image, features: t.features,
        priceCents: t.priceCents, companionCents: t.companionCents, maxGuests: t.maxGuests, inventory: [40, 30, 20, 6][i], sortOrder: i,
      })));
    }
    await audit(admin.id, "event.created", "event", ev.id, { slug: ev.slug });
  } catch (e) {
    redirect(`/admin/events/new?error=${encodeURIComponent(e instanceof z.ZodError ? "Please complete all required fields." : (e as Error).message)}`);
  }
  redirect(`/admin/events/${id}?tab=rooms&created=1`);
}

export async function updateEvent(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  try {
    const v = eventValues(fd);
    await db.update(s.events).set(v).where(eq(s.events.id, id));
    await audit(admin.id, "event.updated", "event", id);
  } catch (e) {
    redirect(`/admin/events/${id}?error=${encodeURIComponent(e instanceof z.ZodError ? "Please complete all required fields." : (e as Error).message)}`);
  }
  revalidatePath("/events");
  redirect(`/admin/events/${id}?saved=1`);
}

/** Copies an event (room types, physical rooms, activities) one month later — perfect for the monthly cadence. */
export async function duplicateEvent(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  const src = await db.query.events.findFirst({ where: eq(s.events.id, id), with: { roomTypes: { with: { rooms: true } }, activities: true } });
  if (!src) redirect("/admin/events");
  const shift = (d: Date) => { const x = new Date(d); x.setUTCMonth(x.getUTCMonth() + 1); return x; };
  const start = shift(src.startDate), end = shift(src.endDate);
  const { id: _i, slug: _s, createdAt: _c, updatedAt: _u, roomTypes, activities, ...rest } = src;
  void _i; void _s; void _c; void _u;
  const [ev] = await db.insert(s.events).values({ ...rest, status: "DRAFT", startDate: start, endDate: end, title: `${src.title} (copy)`, slug: `${src.destinationSlug}-${start.toISOString().slice(0, 7)}-${Date.now().toString(36)}` }).returning();
  for (const rt of roomTypes) {
    const { id: rid, eventId: _e, rooms, ...r } = rt;
    void rid; void _e;
    const [n] = await db.insert(s.roomTypes).values({ ...r, eventId: ev.id }).returning();
    if (rooms.length) await db.insert(s.rooms).values(rooms.map((x) => ({ eventId: ev.id, roomTypeId: n.id, label: x.label, notes: x.notes })));
  }
  if (activities.length) await db.insert(s.activities).values(activities.map(({ id: _a, eventId: _b, ...a }) => { void _a; void _b; return { ...a, eventId: ev.id }; }));
  await audit(admin.id, "event.duplicated", "event", ev.id, { from: id });
  redirect(`/admin/events/${ev.id}?created=1`);
}

// ─────────────────────────── Room types, rooms, activities ───────────────────────────
export async function saveRoomType(fd: FormData) {
  const admin = await requireAdmin();
  const eventId = str(fd, "eventId");
  const id = str(fd, "id");
  const values = {
    name: str(fd, "name") || "Room",
    tier: num(fd, "tier", 1),
    description: str(fd, "description") || null,
    image: str(fd, "image") || null,
    features: str(fd, "features").split(",").map((x) => x.trim()).filter(Boolean),
    priceCents: cents(fd, "price"),
    companionCents: cents(fd, "companion"),
    maxGuests: Math.max(1, num(fd, "maxGuests", 2)),
    inventory: Math.max(0, num(fd, "inventory", 0)),
    sortOrder: num(fd, "sortOrder", 0),
  };
  if (id) await db.update(s.roomTypes).set(values).where(and(eq(s.roomTypes.id, id), eq(s.roomTypes.eventId, eventId)));
  else await db.insert(s.roomTypes).values({ ...values, eventId });
  await audit(admin.id, id ? "roomtype.updated" : "roomtype.created", "event", eventId, values);
  revalidatePath(`/admin/events/${eventId}`);
  redirect(`/admin/events/${eventId}?tab=rooms&saved=1`);
}

export async function deleteRoomType(fd: FormData) {
  const admin = await requireAdmin();
  const eventId = str(fd, "eventId");
  const id = str(fd, "id");
  const used = await db.select({ id: s.bookings.id }).from(s.bookings).where(eq(s.bookings.roomTypeId, id)).limit(1);
  if (used.length) redirect(`/admin/events/${eventId}?tab=rooms&error=${encodeURIComponent("This room type has bookings — set its inventory to 0 instead.")}`);
  await db.delete(s.roomTypes).where(eq(s.roomTypes.id, id));
  await audit(admin.id, "roomtype.deleted", "event", eventId, { id });
  redirect(`/admin/events/${eventId}?tab=rooms`);
}

export async function generateRooms(fd: FormData) {
  const admin = await requireAdmin();
  const eventId = str(fd, "eventId");
  const roomTypeId = str(fd, "roomTypeId");
  const prefix = str(fd, "prefix") || "R";
  const start = num(fd, "start", 101);
  const count = Math.min(400, Math.max(1, num(fd, "count", 1)));
  const labels = str(fd, "labels").split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);
  const list = labels.length ? labels : Array.from({ length: count }, (_, k) => `${prefix}${start + k}`);
  await db.insert(s.rooms).values(list.map((label) => ({ eventId, roomTypeId, label }))).onConflictDoNothing();
  await audit(admin.id, "rooms.generated", "event", eventId, { count: list.length });
  redirect(`/admin/events/${eventId}?tab=inventory`);
}

export async function deleteRoom(fd: FormData) {
  await requireAdmin();
  const eventId = str(fd, "eventId");
  await db.delete(s.rooms).where(and(eq(s.rooms.id, str(fd, "id")), eq(s.rooms.eventId, eventId)));
  redirect(`/admin/events/${eventId}?tab=inventory`);
}

export async function saveActivity(fd: FormData) {
  const admin = await requireAdmin();
  const eventId = str(fd, "eventId");
  const id = str(fd, "id");
  const values = { name: str(fd, "name") || "Activity", category: str(fd, "category") || "Ocean", description: str(fd, "description") || null, image: str(fd, "image") || null, priceCents: cents(fd, "price"), capacity: Math.max(0, num(fd, "capacity", 10)), sortOrder: num(fd, "sortOrder", 0) };
  if (id) await db.update(s.activities).set(values).where(eq(s.activities.id, id));
  else await db.insert(s.activities).values({ ...values, eventId });
  await audit(admin.id, "activity.saved", "event", eventId, values);
  redirect(`/admin/events/${eventId}?tab=activities`);
}

export async function deleteActivity(fd: FormData) {
  await requireAdmin();
  const eventId = str(fd, "eventId");
  await db.delete(s.activities).where(eq(s.activities.id, str(fd, "id")));
  redirect(`/admin/events/${eventId}?tab=activities`);
}

// ─────────────────────────── Bookings ───────────────────────────
/** Assigns a physical room. The unique constraint on bookings.room_id makes double assignment impossible. */
export async function assignRoom(bookingId: string, roomId: string | null) {
  const admin = await requireAdmin();
  try {
    if (roomId) {
      const [b] = await db.select().from(s.bookings).where(eq(s.bookings.id, bookingId));
      const [r] = await db.select().from(s.rooms).where(eq(s.rooms.id, roomId));
      if (!b || !r || r.eventId !== b.eventId) return { ok: false, message: "Room belongs to another event." };
      const [taken] = await db.select({ id: s.bookings.id }).from(s.bookings).where(eq(s.bookings.roomId, roomId));
      if (taken && taken.id !== bookingId) return { ok: false, message: `Room ${r.label} is already assigned.` };
    }
    await db.update(s.bookings).set({ roomId }).where(eq(s.bookings.id, bookingId));
    await audit(admin.id, "room.assigned", "booking", bookingId, { roomId });
    return { ok: true, message: "Saved" };
  } catch {
    return { ok: false, message: "That room was just assigned to someone else." };
  }
}

export async function assignRoomForm(fd: FormData) {
  const r = await assignRoom(str(fd, "bookingId"), str(fd, "roomId") || null);
  redirect(`/admin/bookings/${str(fd, "bookingId")}?${r.ok ? "saved=1" : `error=${encodeURIComponent(r.message)}`}`);
}

export async function adminCancel(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "bookingId");
  try {
    await cancelBooking(id, cents(fd, "refund"), str(fd, "reason") || "Cancelled by Paradise Club", admin.id);
  } catch (e) {
    redirect(`/admin/bookings/${id}?error=${encodeURIComponent(e instanceof BookingError ? e.message : `Refund failed: ${(e as Error).message}`)}`);
  }
  redirect(`/admin/bookings/${id}?cancelled=1`);
}

export async function adminMarkPaid(fd: FormData) {
  const admin = await requireAdmin();
  const pid = str(fd, "paymentId");
  const [p] = await db.select().from(s.payments).where(eq(s.payments.id, pid));
  await markPaymentPaid(pid, {});
  await audit(admin.id, "payment.marked_paid", "payment", pid, { note: str(fd, "note") || "manual" });
  redirect(`/admin/bookings/${p.bookingId}?saved=1`);
}

export async function adminChargeNow(fd: FormData) {
  const admin = await requireAdmin();
  const pid = str(fd, "paymentId");
  const [p] = await db.select().from(s.payments).where(eq(s.payments.id, pid));
  const r = await chargeScheduled(pid);
  await audit(admin.id, "payment.charge_now", "payment", pid, r);
  redirect(`/admin/bookings/${p.bookingId}?${r.ok ? "saved=1" : `error=${encodeURIComponent(`Charge failed: ${r.reason}`)}`}`);
}

export async function adminExtendHold(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "bookingId");
  await db.update(s.bookings).set({ holdExpiresAt: new Date(Date.now() + num(fd, "hours", 48) * 3600e3), status: "HOLD" }).where(and(eq(s.bookings.id, id), inArray(s.bookings.status, ["HOLD", "PENDING_PAYMENT", "EXPIRED"])));
  await audit(admin.id, "booking.hold_extended", "booking", id);
  redirect(`/admin/bookings/${id}?saved=1`);
}

export async function adminResend(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "bookingId");
  await sendBookingEmail(id, "confirmed", 0);
  redirect(`/admin/bookings/${id}?saved=1`);
}

/** Manual booking: complimentary lady, phone/wire booking, or VIP. Counts against live inventory. */
export async function adminCreateBooking(fd: FormData) {
  const admin = await requireAdmin();
  const eventId = str(fd, "eventId");
  const roomTypeId = str(fd, "roomTypeId");
  const kind = str(fd, "kind"); // LADY | MANUAL
  const name = str(fd, "name"), email = str(fd, "email").toLowerCase();
  if (!eventId || !roomTypeId || !name || !email) redirect(`/admin/bookings/new?error=${encodeURIComponent("Event, room, name and email are required.")}`);
  const [rt] = await db.select().from(s.roomTypes).where(eq(s.roomTypes.id, roomTypeId));
  const [{ used }] = await db.select({ used: sql<number>`count(*)::int` }).from(s.bookings).where(and(eq(s.bookings.roomTypeId, roomTypeId), activeBooking()));
  if (used >= rt.inventory && fd.get("force") !== "on") redirect(`/admin/bookings/new?error=${encodeURIComponent(`${rt.name} is sold out (${used}/${rt.inventory}). Tick "override" to add anyway.`)}`);
  const [user] = await db.select().from(s.users).where(eq(s.users.email, email));
  const lady = kind === "LADY";
  const total = lady ? 0 : cents(fd, "total") || rt.priceCents;
  const [b] = await db.insert(s.bookings).values({
    ref: bookingRef(), eventId, roomTypeId, userId: user?.id ?? null, status: lady ? "PAID" : "PENDING_PAYMENT",
    holdExpiresAt: lady ? null : new Date(Date.now() + 14 * 864e5),
    packageType: lady ? "LADY_COMPLIMENTARY" : "GENTLEMAN", plan: "FULL", men: lady ? 0 : 1, women: lady ? 1 : 0,
    totalCents: total, paidCents: 0, contactName: name, contactEmail: email, contactPhone: str(fd, "phone") || null,
    contactCountry: str(fd, "country") || null, notes: str(fd, "notes") || null,
  }).returning();
  await db.insert(s.guests).values({ bookingId: b.id, name, email, country: str(fd, "country") || null, gender: lady ? "LADY" : "GENTLEMAN", isPrimary: true });
  if (!lady && total > 0) await db.insert(s.payments).values({ bookingId: b.id, kind: "FULL", amountCents: total, dueDate: new Date(), status: "SCHEDULED" });
  if (lady) {
    const appId = str(fd, "applicationId");
    if (appId) await db.update(s.applications).set({ status: "APPROVED" }).where(eq(s.applications.id, appId));
    await sendEmail(email, "Your invitation to Paradise", layout("You're invited.", `<p>Your complimentary place at Paradise Club is confirmed — booking <b>${b.ref}</b>. Your coordinator will send the full written invitation with everything that's covered.</p>`, { href: `${siteUrl()}/events`, label: "See the event" }));
  }
  await audit(admin.id, "booking.manual_created", "booking", b.id, { kind });
  redirect(`/admin/bookings/${b.id}?created=1`);
}

// ─────────────────────────── Applications ───────────────────────────
export async function updateApplication(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  const status = str(fd, "status") as "NEW" | "REVIEWING" | "APPROVED" | "REJECTED";
  const notes = str(fd, "adminNotes");
  const [a] = await db.update(s.applications).set({ status, adminNotes: notes || null }).where(eq(s.applications.id, id)).returning();
  if (fd.get("notify") === "on" && (status === "APPROVED" || status === "REJECTED")) {
    await sendEmail(a.email, status === "APPROVED" ? "Good news from Paradise Club" : "Your Paradise Club application",
      layout(status === "APPROVED" ? `Welcome, ${a.name.split(" ")[0]}.` : "Thank you for applying.",
        status === "APPROVED" ? "<p>Your application has been approved. Your coordinator will contact you with the next steps and your written invitation.</p>" : "<p>Thank you for your interest. We aren't able to offer a place this time, but we'd love to hear from you for future events.</p>"));
  }
  await audit(admin.id, "application.updated", "application", id, { status });
  redirect(`/admin/applications?open=${id}&saved=1`);
}

export async function deleteApplicationFiles(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  const [a] = await db.select().from(s.applications).where(eq(s.applications.id, id));
  if (a?.files.length && process.env.BLOB_READ_WRITE_TOKEN) {
    const { del } = await import("@vercel/blob");
    await del(a.files).catch(() => {});
  }
  await db.update(s.applications).set({ files: [] }).where(eq(s.applications.id, id));
  await audit(admin.id, "application.files_deleted", "application", id);
  redirect(`/admin/applications?open=${id}`);
}

// ─────────────────────────── Members ───────────────────────────
export async function moderateProfile(fd: FormData) {
  const admin = await requireAdmin();
  const userId = str(fd, "userId");
  const action = str(fd, "action");
  const set =
    action === "approve" ? { status: "APPROVED" as const } :
    action === "reject" ? { status: "REJECTED" as const } :
    action === "verify" ? { verified: true } :
    action === "unverify" ? { verified: false } : {};
  if (Object.keys(set).length) await db.update(s.profiles).set(set).where(eq(s.profiles.userId, userId));
  if (action === "suspend" || action === "unsuspend") await db.update(s.users).set({ suspended: action === "suspend" }).where(eq(s.users.id, userId));
  if (action === "make-admin") await db.update(s.users).set({ role: "ADMIN" }).where(eq(s.users.id, userId));
  if (action === "approve") {
    const [u] = await db.select().from(s.users).where(eq(s.users.id, userId));
    if (u) await sendEmail(u.email, "Your profile is live", layout("Your profile is live.", "<p>Members can now discover you and request introductions.</p>", { href: `${siteUrl()}/account/members`, label: "Browse members" }));
  }
  await audit(admin.id, `member.${action}`, "user", userId);
  revalidatePath("/admin/members");
  redirect(`/admin/members?tab=${str(fd, "tab") || "review"}`);
}

export async function resolveReport(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd, "id");
  await db.update(s.reports).set({ status: str(fd, "status") === "DISMISSED" ? "DISMISSED" : "RESOLVED" }).where(eq(s.reports.id, id));
  await audit(admin.id, "report.resolved", "report", id);
  redirect("/admin/members?tab=reports");
}
