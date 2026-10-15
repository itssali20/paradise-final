import "server-only";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db, s } from "@/db";
import { activeBooking } from "./events";
import { buildSchedule, depositAvailable } from "./pricing";
import { bookingRef, dateRange, money } from "./format";
import { stripe, paymentsMode, siteUrl } from "./stripe";
import { layout, notifyAdmin, sendEmail } from "./email";
import { audit } from "./audit";
import { getDestination } from "@/content/destinations";

export class BookingError extends Error {}

export type HoldInput = {
  userId: string;
  eventId: string;
  roomTypeId: string;
  withLady: boolean;
  plan: "FULL" | "DEPOSIT";
  contact: { name: string; email: string; phone?: string; country?: string };
  lady?: { name: string; email?: string; country?: string };
  notes?: string;
};

/**
 * Creates a booking that holds one room. Runs inside a transaction that locks the event and the
 * room-type rows, so two guests can never be sold the last room at the same time.
 */
export async function createHold(input: HoldInput) {
  return db.transaction(async (tx) => {
    const [ev] = await tx.select().from(s.events).where(eq(s.events.id, input.eventId)).for("update");
    if (!ev || ev.status !== "PUBLISHED") throw new BookingError("Reservations for this event are closed.");
    if (new Date(ev.startDate) <= new Date()) throw new BookingError("This event has already started.");
    const [rt] = await tx.select().from(s.roomTypes).where(and(eq(s.roomTypes.id, input.roomTypeId), eq(s.roomTypes.eventId, ev.id))).for("update");
    if (!rt) throw new BookingError("Room type not found.");
    if (input.withLady && rt.maxGuests < 2) throw new BookingError("This room is for one guest only.");

    // release any unfinished checkout by the same member for this event (retry-friendly)
    await tx.update(s.bookings)
      .set({ status: "EXPIRED", holdExpiresAt: null })
      .where(and(eq(s.bookings.eventId, ev.id), eq(s.bookings.userId, input.userId), inArray(s.bookings.status, ["HOLD", "PENDING_PAYMENT"])));

    const [{ used }] = await tx.select({ used: sql<number>`count(*)::int` }).from(s.bookings).where(and(eq(s.bookings.roomTypeId, rt.id), activeBooking()));
    if (used >= rt.inventory) throw new BookingError(`Sorry — the last ${rt.name} has just been reserved. Please choose another room.`);

    const [ppl] = await tx
      .select({ men: sql<number>`coalesce(sum(${s.bookings.men}),0)::int`, women: sql<number>`coalesce(sum(${s.bookings.women}),0)::int` })
      .from(s.bookings).where(and(eq(s.bookings.eventId, ev.id), activeBooking()));
    if (ppl.men + 1 > ev.menCapacity) throw new BookingError("All gentlemen's places for this event are taken. Join the waitlist by contacting us.");
    if (input.withLady && ppl.women + 1 > ev.womenCapacity) throw new BookingError("All ladies' places for this event are taken.");

    const total = rt.priceCents + (input.withLady ? rt.companionCents : 0);
    const plan = input.plan === "DEPOSIT" && depositAvailable(ev) ? "DEPOSIT" : "FULL";
    const schedule = buildSchedule({ totalCents: total, event: ev, plan });
    const mode = paymentsMode();
    const holdMinutes = mode === "manual" ? 48 * 60 : mode === "stripe" ? Math.max(ev.holdMinutes, 31) : ev.holdMinutes;

    const [b] = await tx.insert(s.bookings).values({
      ref: bookingRef(),
      eventId: ev.id,
      roomTypeId: rt.id,
      userId: input.userId,
      status: "HOLD",
      packageType: input.withLady ? "GENTLEMAN_LADY" : rt.tier === 4 ? "VILLA" : "GENTLEMAN",
      plan,
      men: 1,
      women: input.withLady ? 1 : 0,
      totalCents: total,
      currency: ev.currency,
      holdExpiresAt: new Date(Date.now() + holdMinutes * 60000),
      contactName: input.contact.name,
      contactEmail: input.contact.email,
      contactPhone: input.contact.phone,
      contactCountry: input.contact.country,
      notes: input.notes,
    }).returning();

    await tx.insert(s.guests).values([
      { bookingId: b.id, name: input.contact.name, email: input.contact.email, country: input.contact.country, gender: "GENTLEMAN", isPrimary: true },
      ...(input.withLady && input.lady ? [{ bookingId: b.id, name: input.lady.name, email: input.lady.email, country: input.lady.country, gender: "LADY" as const, isPrimary: false }] : []),
    ]);
    const pays = await tx.insert(s.payments).values(
      schedule.map((p, i) => ({ bookingId: b.id, kind: p.kind, sequence: p.sequence, amountCents: p.amountCents, dueDate: p.dueDate, status: i === 0 ? ("PENDING" as const) : ("SCHEDULED" as const) })),
    ).returning();

    return { booking: b, event: ev, roomType: rt, firstPayment: pays.find((p) => p.sequence === 0)! };
  });
}

/** Starts payment for a single Payment row (deposit, full, instalment, or activity). Returns a redirect URL. */
export async function checkoutForPayment(opts: {
  paymentId: string;
  label: string;
  email: string;
  customerId?: string | null;
  saveCard: boolean;
  successPath: string;
  cancelPath: string;
}) {
  const [p] = await db.select().from(s.payments).where(eq(s.payments.id, opts.paymentId));
  const mode = paymentsMode();
  if (mode === "demo") {
    await markPaymentPaid(p.id, { demo: true });
    return siteUrl() + opts.successPath;
  }
  if (mode === "manual" || !stripe) return siteUrl() + opts.successPath + (opts.successPath.includes("?") ? "&" : "?") + "manual=1";

  const [b] = await db.select().from(s.bookings).where(eq(s.bookings.id, p.bookingId));
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    ...(opts.customerId ? { customer: opts.customerId } : { customer_email: opts.email, customer_creation: "always" as const }),
    line_items: [{ quantity: 1, price_data: { currency: b.currency, unit_amount: p.amountCents, product_data: { name: opts.label } } }],
    payment_intent_data: {
      ...(opts.saveCard ? { setup_future_usage: "off_session" as const } : {}),
      metadata: { paymentId: p.id, bookingId: b.id, ref: b.ref },
      description: `${b.ref} · ${opts.label}`,
    },
    metadata: { paymentId: p.id, bookingId: b.id, ref: b.ref },
    success_url: siteUrl() + opts.successPath,
    cancel_url: siteUrl() + opts.cancelPath,
    expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
  });
  await db.update(s.payments).set({ stripeCheckoutSessionId: session.id, status: "PENDING" }).where(eq(s.payments.id, p.id));
  if (b.status === "HOLD") await db.update(s.bookings).set({ status: "PENDING_PAYMENT" }).where(eq(s.bookings.id, b.id));
  return session.url!;
}

/** Marks a payment as paid and moves the booking forward. Idempotent. */
export async function markPaymentPaid(paymentId: string, extra: { paymentIntentId?: string; customerId?: string | null; paymentMethodId?: string | null; demo?: boolean } = {}) {
  const result = await db.transaction(async (tx) => {
    const [p] = await tx.select().from(s.payments).where(eq(s.payments.id, paymentId)).for("update");
    if (!p) return null;
    if (p.status === "PAID") {
      // the other webhook got here first — still remember the card for future instalments
      if (extra.customerId || extra.paymentMethodId) {
        const [bk] = await tx.select().from(s.bookings).where(eq(s.bookings.id, p.bookingId));
        await tx.update(s.bookings).set({
          stripeCustomerId: bk.stripeCustomerId ?? extra.customerId ?? null,
          stripePaymentMethodId: extra.paymentMethodId ?? bk.stripePaymentMethodId,
        }).where(eq(s.bookings.id, p.bookingId));
      }
      return null;
    }
    await tx.update(s.payments).set({ status: "PAID", paidAt: new Date(), stripePaymentIntentId: extra.paymentIntentId ?? p.stripePaymentIntentId, lastError: null }).where(eq(s.payments.id, p.id));
    const [b] = await tx.select().from(s.bookings).where(eq(s.bookings.id, p.bookingId)).for("update");
    if (p.kind === "ACTIVITY") {
      await tx.update(s.activityBookings).set({ status: "PAID" }).where(eq(s.activityBookings.paymentId, p.id));
      return { booking: b, payment: p, first: false };
    }
    const paid = b.paidCents + p.amountCents;
    const first = b.paidCents === 0;
    const wasExpired = b.status === "EXPIRED" || b.status === "CANCELLED";
    await tx.update(s.bookings).set({
      paidCents: paid,
      status: paid >= b.totalCents ? "PAID" : "DEPOSIT_PAID",
      holdExpiresAt: null,
      stripeCustomerId: extra.customerId ?? b.stripeCustomerId,
      stripePaymentMethodId: extra.paymentMethodId ?? b.stripePaymentMethodId,
    }).where(eq(s.bookings.id, b.id));
    if (wasExpired) console.warn(`[booking] payment arrived for ${b.status} booking ${b.ref} — reinstated; check inventory`);
    return { booking: { ...b, paidCents: paid }, payment: p, first };
  });
  if (result && result.payment.kind !== "ACTIVITY") await sendBookingEmail(result.booking.id, result.first ? "confirmed" : "payment", result.payment.amountCents);
  if (result) await audit(null, extra.demo ? "payment.demo_paid" : "payment.paid", "payment", paymentId, { amount: result.payment.amountCents });
  return result;
}

export async function bookingDetail(id: string) {
  const b = await db.query.bookings.findFirst({
    where: eq(s.bookings.id, id),
    with: { event: true, roomType: true, room: true, guests: true, payments: { orderBy: [asc(s.payments.sequence), asc(s.payments.createdAt)] }, activities: { with: { activity: true } } },
  });
  return b;
}

export async function sendBookingEmail(bookingId: string, kind: "confirmed" | "payment" | "cancelled" | "reminder" | "failed" | "held", amount?: number) {
  const b = await bookingDetail(bookingId);
  if (!b) return;
  const dest = getDestination(b.event.destinationSlug)?.name ?? b.event.title;
  const when = dateRange(b.event.startDate, b.event.endDate);
  const sched = b.payments.filter((p) => p.kind !== "ACTIVITY").map((p) => `<li>${money(p.amountCents, b.currency)} · ${new Date(p.dueDate).toDateString()} · ${p.status.toLowerCase()}</li>`).join("");
  const map = {
    confirmed: [`Your room in ${dest} is reserved`, `<p>Booking <b>${b.ref}</b> · ${b.roomType.name} · ${when}.</p><p>We received ${money(amount ?? 0, b.currency)}. Your payment schedule:</p><ul>${sched}</ul>`],
    payment: [`Payment received · ${b.ref}`, `<p>Thank you — we received ${money(amount ?? 0, b.currency)} for ${dest}, ${when}.</p><ul>${sched}</ul>`],
    reminder: [`Upcoming payment · ${b.ref}`, `<p>Your next instalment for ${dest} (${when}) will be charged automatically on the date below.</p><ul>${sched}</ul>`],
    failed: [`Action needed · payment for ${b.ref}`, `<p>We couldn't collect your scheduled payment for ${dest}. Please update your card or pay from your account to keep your room.</p>`],
    cancelled: [`Booking ${b.ref} cancelled`, `<p>Your booking for ${dest} (${when}) has been cancelled.${amount ? ` A refund of ${money(amount, b.currency)} is on its way to your original payment method.` : ""}</p>`],
    held: [`We're holding your room · ${b.ref}`, `<p>Your ${b.roomType.name} in ${dest} (${when}) is held for 48 hours. Our reservations team will contact you to complete payment.</p>`],
  } as const;
  const [title, body] = map[kind];
  await sendEmail(b.contactEmail, title, layout(title, body, { href: `${siteUrl()}/account/bookings/${b.id}`, label: "View booking" }));
  if (kind === "confirmed" || kind === "held") await notifyAdmin(`${kind === "held" ? "Room held" : "New booking"} ${b.ref} · ${dest}`, layout(title, `<p>${b.contactName} · ${b.contactEmail}</p>${body}`));
}

/** Charges a scheduled instalment off-session with the saved card. */
export async function chargeScheduled(paymentId: string) {
  const [p] = await db.select().from(s.payments).where(eq(s.payments.id, paymentId));
  const [b] = await db.select().from(s.bookings).where(eq(s.bookings.id, p.bookingId));
  if (!["DEPOSIT_PAID"].includes(b.status)) return { ok: false, reason: "booking not active" };
  const mode = paymentsMode();
  if (mode === "demo") { await markPaymentPaid(p.id, { demo: true }); return { ok: true }; }
  if (!stripe || !b.stripeCustomerId || !b.stripePaymentMethodId) {
    await db.update(s.payments).set({ status: "FAILED", attempts: p.attempts + 1, lastError: "No saved card" }).where(eq(s.payments.id, p.id));
    await sendBookingEmail(b.id, "failed");
    return { ok: false, reason: "no saved card" };
  }
  try {
    const pi = await stripe.paymentIntents.create({
      amount: p.amountCents, currency: b.currency, customer: b.stripeCustomerId, payment_method: b.stripePaymentMethodId,
      off_session: true, confirm: true, description: `${b.ref} · instalment ${p.sequence}`,
      metadata: { paymentId: p.id, bookingId: b.id, ref: b.ref },
    }, { idempotencyKey: `pc-${p.id}-${p.attempts}` });
    await db.update(s.payments).set({ stripePaymentIntentId: pi.id }).where(eq(s.payments.id, p.id));
    if (pi.status === "succeeded") { await markPaymentPaid(p.id, { paymentIntentId: pi.id }); return { ok: true }; }
    await db.update(s.payments).set({ status: "PENDING" }).where(eq(s.payments.id, p.id));
    return { ok: true, pending: true };
  } catch (e) {
    const msg = (e as Error).message;
    await db.update(s.payments).set({ status: "FAILED", attempts: p.attempts + 1, lastError: msg.slice(0, 300) }).where(eq(s.payments.id, p.id));
    await sendBookingEmail(b.id, "failed");
    return { ok: false, reason: msg };
  }
}

/** Cancels a booking, refunds `refundCents` across paid payments (newest first) and frees the room. */
export async function cancelBooking(bookingId: string, refundCents: number, reason: string, actorId: string | null) {
  const b = await bookingDetail(bookingId);
  if (!b) throw new BookingError("Booking not found");
  if (b.status === "CANCELLED") throw new BookingError("Already cancelled");
  let remaining = Math.max(0, Math.min(refundCents, b.paidCents - b.refundedCents));
  let refunded = 0;
  const paid = b.payments.filter((p) => p.status === "PAID" || p.status === "PARTIALLY_REFUNDED").sort((x, y) => +new Date(y.paidAt!) - +new Date(x.paidAt!));
  for (const p of paid) {
    if (remaining <= 0) break;
    const amt = Math.min(remaining, p.amountCents - p.refundedCents);
    if (amt <= 0) continue;
    if (stripe && p.stripePaymentIntentId) {
      await stripe.refunds.create({ payment_intent: p.stripePaymentIntentId, amount: amt, metadata: { bookingId: b.id, paymentId: p.id } });
    } else if (paymentsMode() === "stripe") {
      throw new BookingError(`Payment ${p.id} has no Stripe reference — refund it manually in Stripe.`);
    }
    const newRef = p.refundedCents + amt;
    await db.update(s.payments).set({ refundedCents: newRef, status: newRef >= p.amountCents ? "REFUNDED" : "PARTIALLY_REFUNDED" }).where(eq(s.payments.id, p.id));
    remaining -= amt;
    refunded += amt;
  }
  await db.update(s.payments).set({ status: "CANCELLED" }).where(and(eq(s.payments.bookingId, b.id), inArray(s.payments.status, ["SCHEDULED", "PENDING", "FAILED"])));
  await db.update(s.bookings).set({ status: "CANCELLED", cancelledAt: new Date(), cancelReason: reason, refundedCents: b.refundedCents + refunded, roomId: null, holdExpiresAt: null }).where(eq(s.bookings.id, b.id));
  await db.update(s.activityBookings).set({ status: "CANCELLED" }).where(eq(s.activityBookings.bookingId, b.id));
  await audit(actorId, "booking.cancelled", "booking", b.id, { refunded, reason });
  await sendBookingEmail(b.id, "cancelled", refunded);
  return { refunded };
}
