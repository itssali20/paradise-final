import { NextResponse } from "next/server";
import { and, inArray, lt } from "drizzle-orm";
import { db, s } from "@/db";
import { cronAuthorized } from "@/lib/cron";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Every 30 min: release rooms from abandoned checkouts. */
export async function GET(req: Request) {
  if (!cronAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const expired = await db.update(s.bookings).set({ status: "EXPIRED" })
    .where(and(inArray(s.bookings.status, ["HOLD", "PENDING_PAYMENT"]), lt(s.bookings.holdExpiresAt, new Date())))
    .returning({ id: s.bookings.id });
  if (expired.length) {
    await db.update(s.payments).set({ status: "CANCELLED" })
      .where(and(inArray(s.payments.bookingId, expired.map((e) => e.id)), inArray(s.payments.status, ["SCHEDULED", "PENDING"])));
  }
  return NextResponse.json({ released: expired.length });
}
