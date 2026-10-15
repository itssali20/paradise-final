import { NextResponse } from "next/server";
import { and, eq, inArray, isNull, lt, lte, gte } from "drizzle-orm";
import { db, s } from "@/db";
import { chargeScheduled, sendBookingEmail } from "@/lib/booking";
import { cronAuthorized } from "@/lib/cron";
import { notifyAdmin, layout } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily: send 7-day reminders, charge instalments that are due, retry failed ones (max 3 attempts). */
export async function GET(req: Request) {
  if (!cronAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const now = new Date();
  const week = new Date(now.getTime() + 7 * 864e5);

  const remind = await db.select({ id: s.payments.id, bookingId: s.payments.bookingId }).from(s.payments)
    .where(and(eq(s.payments.status, "SCHEDULED"), isNull(s.payments.reminderSentAt), lte(s.payments.dueDate, week), gte(s.payments.dueDate, now)));
  for (const r of remind) {
    await sendBookingEmail(r.bookingId, "reminder");
    await db.update(s.payments).set({ reminderSentAt: now }).where(eq(s.payments.id, r.id));
  }

  const due = await db.select({ id: s.payments.id, status: s.payments.status, attempts: s.payments.attempts }).from(s.payments)
    .innerJoin(s.bookings, eq(s.bookings.id, s.payments.bookingId))
    .where(and(inArray(s.payments.status, ["SCHEDULED", "FAILED"]), lte(s.payments.dueDate, now), eq(s.bookings.status, "DEPOSIT_PAID"), lt(s.payments.attempts, 3), inArray(s.payments.kind, ["INSTALLMENT"])));
  const results = [];
  for (const p of due) results.push({ id: p.id, ...(await chargeScheduled(p.id)) });

  const overdue = await db.select({ ref: s.bookings.ref, name: s.bookings.contactName }).from(s.payments)
    .innerJoin(s.bookings, eq(s.bookings.id, s.payments.bookingId))
    .where(and(eq(s.payments.status, "FAILED"), gte(s.payments.attempts, 3), eq(s.bookings.status, "DEPOSIT_PAID")));
  if (overdue.length) await notifyAdmin(`${overdue.length} overdue balance(s)`, layout("Overdue balances", `<ul>${overdue.map((o) => `<li>${o.ref} · ${o.name}</li>`).join("")}</ul>`));

  return NextResponse.json({ reminders: remind.length, charged: results, overdue: overdue.length });
}
