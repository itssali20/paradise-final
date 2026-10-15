import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db, s } from "@/db";
import { requireUser } from "@/lib/auth";
import { bookingDetail } from "@/lib/booking";
import { getDestination } from "@/content/destinations";
import { dateRange, fmtDate, money } from "@/lib/format";
import { bookingTone, label, paymentTone } from "@/lib/status";
import { refundPercent, type PolicyTier } from "@/lib/pricing";
import { bookActivity, payNow, requestCancel } from "@/actions/booking";
import { img } from "@/content/media";

export default async function BookingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const u = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const b = await bookingDetail(id);
  if (!b || b.userId !== u.id) notFound();
  const d = getDestination(b.event.destinationSlug);
  const active = b.status === "DEPOSIT_PAID" || b.status === "PAID";
  const acts = active ? await db.select().from(s.activities).where(eq(s.activities.eventId, b.eventId)).orderBy(s.activities.sortOrder) : [];
  const usage = acts.length
    ? await db.select({ id: s.activityBookings.activityId, n: sql<number>`coalesce(sum(${s.activityBookings.quantity}),0)::int` }).from(s.activityBookings)
        .where(and(inArray(s.activityBookings.activityId, acts.map((a) => a.id)), inArray(s.activityBookings.status, ["PAID", "PENDING"]))).groupBy(s.activityBookings.activityId)
    : [];
  const refundPct = refundPercent(b.event.cancellationPolicy as PolicyTier[], b.event.startDate);
  const roomPayments = b.payments.filter((p) => p.kind !== "ACTIVITY");

  return (
    <div className="stack">
      {sp.paid && <p className="notice">Thank you — your payment was received.</p>}
      {sp.activity && <p className="notice">Activity reserved. You&apos;ll find it below once payment is confirmed.</p>}
      {sp.full && <p className="notice notice--warn">{sp.full} is fully booked for this event.</p>}
      {sp.cancel && <p className="notice">Your cancellation request was sent. Our team will confirm the refund in writing.</p>}

      <div className="card" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)" }}>
        <div className="card__img" style={{ aspectRatio: "auto", minHeight: 240 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img(b.roomType.image || b.event.heroImage, 900)} alt="" />
        </div>
        <div className="card__b" style={{ alignContent: "center" }}>
          <span className="caps caps--aqua">Booking {b.ref}</span>
          <h3>{d?.name} · {b.roomType.name}</h3>
          <p>{dateRange(b.event.startDate, b.event.endDate)} · {b.event.resortName}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className={`status status--${bookingTone(b.status)}`}>{label(b.status)}</span>
            {b.room && <span className="chip chip--aqua">Room {b.room.label}</span>}
            {b.cancelRequestedAt && b.status !== "CANCELLED" && <span className="status status--warn">Cancellation requested</span>}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h2>Payment schedule</h2><span className="muted">Paid {money(b.paidCents, b.currency)} of {money(b.totalCents, b.currency)}{b.refundedCents ? ` · refunded ${money(b.refundedCents, b.currency)}` : ""}</span></div>
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>#</th><th>Type</th><th>Due</th><th className="num">Amount</th><th>Status</th><th /></tr></thead>
            <tbody>
              {roomPayments.map((p) => (
                <tr key={p.id}>
                  <td>{p.sequence}</td>
                  <td>{label(p.kind)}</td>
                  <td>{fmtDate(p.dueDate)}</td>
                  <td className="num">{money(p.amountCents, b.currency)}</td>
                  <td><span className={`status status--${paymentTone(p.status)}`}>{label(p.status)}</span></td>
                  <td>
                    {b.status === "DEPOSIT_PAID" && (p.status === "SCHEDULED" || p.status === "FAILED") && (
                      <form action={payNow}><input type="hidden" name="paymentId" value={p.id} /><button className="mini-btn mini-btn--aqua">Pay now</button></form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {b.plan === "DEPOSIT" && b.status === "DEPOSIT_PAID" && <p className="fine" style={{ marginTop: 14 }}>Scheduled instalments are charged automatically to your saved card. You&apos;ll receive a reminder 7 days before each date.</p>}
      </div>

      <div className="panel">
        <h2>Guests</h2>
        <div className="kv" style={{ marginTop: 16 }}>
          {b.guests.map((g) => <div key={g.id}><span>{g.isPrimary ? "Lead guest" : "Companion"}</span><b>{g.name}</b><div className="fine">{g.country}</div></div>)}
        </div>
      </div>

      {active && acts.length > 0 && (
        <div className="panel">
          <div className="panel-head"><h2>Activities for your week</h2><Link className="mini-btn" href="/activities">About activities</Link></div>
          <div className="cards-3">
            {acts.map((a) => {
              const used = usage.find((x) => x.id === a.id)?.n ?? 0;
              const mine = b.activities.filter((x) => x.activityId === a.id && x.status !== "CANCELLED");
              return (
                <div key={a.id} className="card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div className="card__img" style={{ aspectRatio: "16/10" }}><img src={img(a.image, 600)} alt="" loading="lazy" /></div>
                  <div className="card__b">
                    <span className="caps caps--aqua">{a.category} · {Math.max(0, a.capacity - used)} places left</span>
                    <h3 style={{ fontSize: "1.5rem" }}>{a.name}</h3>
                    {mine.map((m) => <span key={m.id} className={`status status--${m.status === "PAID" ? "ok" : "warn"}`}>{m.quantity} × {label(m.status)}</span>)}
                    <form action={bookActivity} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                      <input type="hidden" name="bookingId" value={b.id} />
                      <input type="hidden" name="activityId" value={a.id} />
                      <select name="quantity" className="mini-btn" defaultValue="1" aria-label="Quantity">{[1, 2].map((q) => <option key={q}>{q}</option>)}</select>
                      <button className="mini-btn mini-btn--aqua" disabled={used >= a.capacity}>Reserve · {money(a.priceCents, b.currency)}</button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(active || b.status === "HOLD" || b.status === "PENDING_PAYMENT") && !b.cancelRequestedAt && (
        <details className="panel">
          <summary style={{ cursor: "pointer" }}><b>Cancel this booking</b></summary>
          <p className="muted" style={{ marginTop: 12 }}>
            {active ? <>If you cancel today, the policy for this event refunds <b style={{ color: "var(--ink)" }}>{refundPct}%</b> of amounts paid ({money(Math.round((b.paidCents * refundPct) / 100), b.currency)}). Our team confirms every cancellation in writing.</> : "This reservation hasn't been paid yet — cancelling releases the room immediately."}
          </p>
          <form action={requestCancel} className="form" style={{ marginTop: 14 }}>
            <input type="hidden" name="bookingId" value={b.id} />
            <div className="f f--full"><label htmlFor="c-r">Reason (optional)</label><textarea id="c-r" name="reason" /></div>
            <div className="f--full"><button className="mini-btn mini-btn--bad">{active ? "Request cancellation" : "Release this room"}</button> <Link className="fine link-line" href="/legal/cancellation">Policy</Link></div>
          </form>
        </details>
      )}
    </div>
  );
}
