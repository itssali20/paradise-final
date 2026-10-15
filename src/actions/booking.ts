"use server";
import { redirect } from "next/navigation";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db, s } from "@/db";
import { requireUser } from "@/lib/auth";
import { BookingError, checkoutForPayment, createHold, sendBookingEmail } from "@/lib/booking";
import { paymentsMode } from "@/lib/stripe";
import { getDestination } from "@/content/destinations";
import { notifyAdmin, layout } from "@/lib/email";
import { audit } from "@/lib/audit";

export type BookState = { ok: boolean; message: string };

const schema = z.object({
  eventId: z.string().min(1),
  roomTypeId: z.string().min(1, "Choose a room"),
  withLady: z.enum(["0", "1"]),
  plan: z.enum(["FULL", "DEPOSIT"]),
  name: z.string().trim().min(2, "Your full name"),
  phone: z.string().trim().min(5, "A phone or WhatsApp number"),
  country: z.string().trim().min(2, "Your country"),
  ladyName: z.string().trim().optional(),
  ladyEmail: z.string().trim().email().optional().or(z.literal("")),
  ladyCountry: z.string().trim().optional(),
  notes: z.string().trim().max(2000).optional(),
  terms: z.literal("on", { message: "Please accept the terms and cancellation policy" }),
});

export async function startBooking(_: BookState, fd: FormData): Promise<BookState> {
  const user = await requireUser();
  const raw = Object.fromEntries(fd.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const v = parsed.data;
  if (v.withLady === "1" && !v.ladyName) return { ok: false, message: "Please enter the lady's name." };

  let url: string;
  try {
    const hold = await createHold({
      userId: user.id, eventId: v.eventId, roomTypeId: v.roomTypeId, withLady: v.withLady === "1", plan: v.plan,
      contact: { name: v.name, email: user.email, phone: v.phone, country: v.country },
      lady: v.withLady === "1" ? { name: v.ladyName!, email: v.ladyEmail || undefined, country: v.ladyCountry } : undefined,
      notes: v.notes,
    });
    await db.update(s.users).set({ phone: user.phone ?? v.phone, country: user.country ?? v.country, gender: user.gender ?? "GENTLEMAN" }).where(eq(s.users.id, user.id));
    const dest = getDestination(hold.event.destinationSlug)?.name ?? hold.event.title;
    const kind = hold.firstPayment.kind === "DEPOSIT" ? "Deposit" : "Full payment";
    if (paymentsMode() === "manual") {
      await sendBookingEmail(hold.booking.id, "held");
      url = `/book/success?ref=${hold.booking.ref}&manual=1`;
    } else {
      url = await checkoutForPayment({
        paymentId: hold.firstPayment.id,
        label: `Paradise Club · ${dest} · ${hold.roomType.name} · ${kind}`,
        email: user.email,
        saveCard: hold.booking.plan === "DEPOSIT",
        successPath: `/book/success?ref=${hold.booking.ref}`,
        cancelPath: `/book/${hold.event.slug}?cancelled=1`,
      });
    }
    await audit(user.id, "booking.created", "booking", hold.booking.id, { ref: hold.booking.ref });
  } catch (e) {
    if (e instanceof BookingError) return { ok: false, message: e.message };
    console.error("[booking]", e);
    return { ok: false, message: "We couldn't start your reservation. Please try again or call us." };
  }
  redirect(url);
}

/** Pay a scheduled or failed instalment now. */
export async function payNow(fd: FormData) {
  const user = await requireUser();
  const id = String(fd.get("paymentId"));
  const [p] = await db.select().from(s.payments).where(eq(s.payments.id, id));
  const [b] = p ? await db.select().from(s.bookings).where(eq(s.bookings.id, p.bookingId)) : [];
  if (!p || !b || b.userId !== user.id || !["SCHEDULED", "FAILED"].includes(p.status) || b.status !== "DEPOSIT_PAID") redirect("/account/bookings");
  const url = await checkoutForPayment({
    paymentId: p.id, label: `Paradise Club · ${b.ref} · instalment ${p.sequence}`, email: user.email, customerId: b.stripeCustomerId,
    saveCard: true, successPath: `/account/bookings/${b.id}?paid=1`, cancelPath: `/account/bookings/${b.id}`,
  });
  redirect(url);
}

export async function requestCancel(fd: FormData) {
  const user = await requireUser();
  const id = String(fd.get("bookingId"));
  const reason = String(fd.get("reason") || "").slice(0, 1000);
  const [b] = await db.select().from(s.bookings).where(and(eq(s.bookings.id, id), eq(s.bookings.userId, user.id)));
  if (!b) redirect("/account/bookings");
  if (["HOLD", "PENDING_PAYMENT"].includes(b.status)) {
    await db.update(s.bookings).set({ status: "EXPIRED", holdExpiresAt: null }).where(eq(s.bookings.id, b.id));
    await db.update(s.payments).set({ status: "CANCELLED" }).where(and(eq(s.payments.bookingId, b.id), inArray(s.payments.status, ["SCHEDULED", "PENDING"])));
  } else {
    await db.update(s.bookings).set({ cancelRequestedAt: new Date(), cancelReason: reason || "Requested by guest" }).where(eq(s.bookings.id, b.id));
    await notifyAdmin(`Cancellation request ${b.ref}`, layout("Cancellation request", `<p>${b.contactName} asked to cancel ${b.ref}.</p><p>${reason}</p>`));
  }
  await audit(user.id, "booking.cancel_requested", "booking", b.id, { reason });
  redirect(`/account/bookings/${b.id}?cancel=1`);
}

export async function bookActivity(fd: FormData) {
  const user = await requireUser();
  const bookingId = String(fd.get("bookingId"));
  const activityId = String(fd.get("activityId"));
  const qty = Math.max(1, Math.min(4, Number(fd.get("quantity")) || 1));
  const [b] = await db.select().from(s.bookings).where(and(eq(s.bookings.id, bookingId), eq(s.bookings.userId, user.id)));
  if (!b || !["DEPOSIT_PAID", "PAID"].includes(b.status)) redirect("/account/bookings");

  const res = await db.transaction(async (tx) => {
    const [a] = await tx.select().from(s.activities).where(and(eq(s.activities.id, activityId), eq(s.activities.eventId, b.eventId))).for("update");
    if (!a) return null;
    const [{ n }] = await tx.select({ n: sql<number>`coalesce(sum(${s.activityBookings.quantity}),0)::int` }).from(s.activityBookings)
      .where(and(eq(s.activityBookings.activityId, a.id), inArray(s.activityBookings.status, ["PAID", "PENDING"])));
    if (n + qty > a.capacity) return { full: true as const, a };
    const [pay] = await tx.insert(s.payments).values({ bookingId: b.id, kind: "ACTIVITY", amountCents: a.priceCents * qty, dueDate: new Date(), status: "PENDING" }).returning();
    await tx.insert(s.activityBookings).values({ activityId: a.id, bookingId: b.id, quantity: qty, paymentId: pay.id });
    return { full: false as const, a, pay };
  });
  if (!res) redirect(`/account/bookings/${b.id}`);
  if (res.full) redirect(`/account/bookings/${b.id}?full=${encodeURIComponent(res.a.name)}`);
  const url = await checkoutForPayment({
    paymentId: res.pay.id, label: `Paradise Club · ${res.a.name} × ${qty}`, email: user.email, customerId: b.stripeCustomerId,
    saveCard: false, successPath: `/account/bookings/${b.id}?activity=1`, cancelPath: `/account/bookings/${b.id}`,
  });
  redirect(url);
}
