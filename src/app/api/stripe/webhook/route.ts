import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import type Stripe from "stripe";
import { db, s } from "@/db";
import { stripe } from "@/lib/stripe";
import { markPaymentPaid } from "@/lib/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Stripe webhook: confirms deposits, instalments and activities; expires abandoned checkouts. */
export async function POST(req: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return NextResponse.json({ error: `Invalid signature: ${(e as Error).message}` }, { status: 400 });
  }

  // idempotency: process each Stripe event once
  const inserted = await db.insert(s.stripeEvents).values({ id: event.id, type: event.type }).onConflictDoNothing().returning();
  if (!inserted.length) return NextResponse.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status !== "paid") break;
        const paymentId = session.metadata?.paymentId;
        if (!paymentId) break;
        let pm: string | null = null;
        const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
        if (piId) {
          const pi = await stripe.paymentIntents.retrieve(piId);
          pm = typeof pi.payment_method === "string" ? pi.payment_method : pi.payment_method?.id ?? null;
        }
        const customer = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
        await markPaymentPaid(paymentId, { paymentIntentId: piId, customerId: customer, paymentMethodId: pm });
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentId = session.metadata?.paymentId;
        const bookingId = session.metadata?.bookingId;
        if (paymentId) await db.update(s.payments).set({ status: "CANCELLED" }).where(and(eq(s.payments.id, paymentId), eq(s.payments.status, "PENDING")));
        if (bookingId) {
          await db.update(s.bookings).set({ status: "EXPIRED", holdExpiresAt: null }).where(and(eq(s.bookings.id, bookingId), inArray(s.bookings.status, ["HOLD", "PENDING_PAYMENT"])));
          await db.update(s.payments).set({ status: "CANCELLED" }).where(and(eq(s.payments.bookingId, bookingId), eq(s.payments.status, "SCHEDULED")));
        }
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const paymentId = pi.metadata?.paymentId;
        if (paymentId) {
          const customer = typeof pi.customer === "string" ? pi.customer : pi.customer?.id ?? null;
          const pm = typeof pi.payment_method === "string" ? pi.payment_method : pi.payment_method?.id ?? null;
          await markPaymentPaid(paymentId, { paymentIntentId: pi.id, customerId: customer, paymentMethodId: pm });
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const paymentId = pi.metadata?.paymentId;
        if (paymentId) await db.update(s.payments).set({ status: "FAILED", lastError: pi.last_payment_error?.message?.slice(0, 300) ?? "Payment failed" }).where(and(eq(s.payments.id, paymentId), inArray(s.payments.status, ["PENDING", "SCHEDULED"])));
        break;
      }
    }
  } catch (e) {
    // allow Stripe to retry
    await db.delete(s.stripeEvents).where(eq(s.stripeEvents.id, event.id));
    console.error("[stripe-webhook]", e);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
