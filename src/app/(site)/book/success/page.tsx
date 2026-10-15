import Link from "next/link";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db, hasDb, s } from "@/db";
import { getSession } from "@/lib/auth";
import { getDestination } from "@/content/destinations";
import { dateRange, money } from "@/lib/format";
import { SITE } from "@/content/site";

export const metadata: Metadata = { title: "Reservation received", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ ref?: string; manual?: string }> }) {
  const sp = await searchParams;
  const sess = await getSession();
  const b = hasDb && sp.ref && sess
    ? await db.query.bookings.findFirst({ where: eq(s.bookings.ref, sp.ref), with: { event: true, roomType: true } })
    : null;
  const mine = b && b.userId === sess?.uid ? b : null;
  const d = mine ? getDestination(mine.event.destinationSlug) : null;
  const paid = mine && (mine.status === "PAID" || mine.status === "DEPOSIT_PAID");

  return (
    <section className="screen" style={{ display: "grid", placeItems: "center", position: "relative" }}>
      <div className="media" style={{ opacity: 0.35 }}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/media/dest-bahamas.webp" alt="" /></div>
      <div className="container center stack" style={{ position: "relative", zIndex: 2, maxWidth: 820, paddingBlock: 140 }}>
        <span className="caps caps--aqua">{sp.manual ? "Room held" : paid ? "Payment received" : "Reservation received"}</span>
        <h1 className="display chrome" data-split="chars">{sp.manual ? "Almost there." : "Welcome to Paradise."}</h1>
        {mine ? (
          <p className="lead">
            Booking <b style={{ color: "var(--ink)" }}>{mine.ref}</b> · {mine.roomType.name} · {d?.name} · {dateRange(mine.event.startDate, mine.event.endDate)}.{" "}
            {sp.manual
              ? `We're holding your room for 48 hours — our team will call you to complete payment, or call us on ${SITE.phone}.`
              : paid
                ? `We received ${money(mine.paidCents, mine.currency)}. A confirmation email is on its way.`
                : "We're confirming your payment with the bank — this usually takes a few seconds. You'll receive an email as soon as it's done."}
          </p>
        ) : (
          <p className="lead">Thank you. Your confirmation will arrive by email.</p>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {mine && <Link className="btn btn--chrome" href={`/account/bookings/${mine.id}`}>View my booking</Link>}
          <Link className="btn" href="/account/profile">Create your member profile</Link>
        </div>
      </div>
    </section>
  );
}
