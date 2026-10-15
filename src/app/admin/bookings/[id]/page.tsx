import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { db, s } from "@/db";
import { bookingDetail } from "@/lib/booking";
import { getDestination } from "@/content/destinations";
import { dateRange, fmtDate, money } from "@/lib/format";
import { bookingTone, label, paymentTone } from "@/lib/status";
import { refundPercent, type PolicyTier } from "@/lib/pricing";
import { adminCancel, adminChargeNow, adminExtendHold, adminMarkPaid, adminResend, assignRoomForm } from "@/actions/admin";

export const metadata = { title: "Booking" };

export default async function AdminBooking({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const b = await bookingDetail(id);
  if (!b) notFound();
  const [rooms, taken, log] = await Promise.all([
    db.select().from(s.rooms).where(eq(s.rooms.roomTypeId, b.roomTypeId)),
    db.select({ roomId: s.bookings.roomId }).from(s.bookings).where(eq(s.bookings.eventId, b.eventId)),
    db.select().from(s.auditLogs).where(eq(s.auditLogs.entityId, b.id)).orderBy(desc(s.auditLogs.createdAt)).limit(20),
  ]);
  void and; void isNull; void or;
  const free = rooms.filter((r) => r.id === b.roomId || !taken.some((t) => t.roomId === r.id));
  const pct = refundPercent(b.event.cancellationPolicy as PolicyTier[], b.event.startDate);
  const refundable = b.paidCents - b.refundedCents;
  const suggested = Math.round((refundable * pct) / 100);
  const active = b.status === "DEPOSIT_PAID" || b.status === "PAID";

  return (
    <>
      <div className="admin__head">
        <div>
          <Link className="caps caps--dim" href="/admin/bookings">← Bookings</Link>
          <h1>{b.ref} <span className={`status status--${bookingTone(b.status)}`} style={{ verticalAlign: "middle" }}>{label(b.status)}</span></h1>
          <p className="muted">{getDestination(b.event.destinationSlug)?.name} · {dateRange(b.event.startDate, b.event.endDate)} · {b.roomType.name} · {label(b.packageType)}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="mini-btn" href={`/admin/events/${b.eventId}/guests`}>Room board</Link>
          <form action={adminResend}><input type="hidden" name="bookingId" value={b.id} /><button className="mini-btn">Resend confirmation</button></form>
        </div>
      </div>
      {sp.saved && <p className="notice" style={{ marginBottom: 14 }}>Saved.</p>}
      {sp.created && <p className="notice" style={{ marginBottom: 14 }}>Booking created.</p>}
      {sp.cancelled && <p className="notice" style={{ marginBottom: 14 }}>Booking cancelled and refund issued.</p>}
      {sp.error && <p className="notice notice--warn" style={{ marginBottom: 14 }}>{sp.error}</p>}
      {b.cancelRequestedAt && b.status !== "CANCELLED" && <p className="notice notice--warn" style={{ marginBottom: 14 }}>Guest requested cancellation on {fmtDate(b.cancelRequestedAt, true)}: “{b.cancelReason}”.</p>}

      <div className="kpis">
        <div className="kpi"><span>Total</span><b>{money(b.totalCents, b.currency)}</b></div>
        <div className="kpi"><span>Paid</span><b className="chrome-static">{money(b.paidCents, b.currency)}</b></div>
        <div className="kpi"><span>Refunded</span><b>{money(b.refundedCents, b.currency)}</b></div>
        <div className="kpi"><span>Balance</span><b>{money(b.status === "CANCELLED" || b.status === "EXPIRED" ? 0 : Math.max(0, b.totalCents - b.paidCents), b.currency)}</b></div>
      </div>

      <div className="grid-2" style={{ gap: 18, alignItems: "start" }}>
        <div className="stack" style={{ gap: 18 }}>
          <div className="panel">
            <h2>Contact & guests</h2>
            <div className="kv" style={{ marginTop: 14 }}>
              <div><span>Lead</span><b>{b.contactName}</b><div className="fine">{b.contactEmail}</div><div className="fine">{b.contactPhone} · {b.contactCountry}</div></div>
              {b.guests.filter((g) => !g.isPrimary).map((g) => <div key={g.id}><span>Companion</span><b>{g.name}</b><div className="fine">{g.email} {g.country}</div></div>)}
            </div>
            {b.notes && <p className="muted" style={{ marginTop: 14, whiteSpace: "pre-wrap" }}>“{b.notes}”</p>}
          </div>

          <div className="panel">
            <h2>Room assignment</h2>
            <form action={assignRoomForm} className="toolbar" style={{ marginTop: 14 }}>
              <input type="hidden" name="bookingId" value={b.id} />
              <select name="roomId" defaultValue={b.roomId ?? ""}>
                <option value="">Not assigned</option>
                {free.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
              <button className="mini-btn mini-btn--solid">Save</button>
            </form>
            {!rooms.length && <p className="fine">No physical rooms for this room type yet.</p>}
          </div>

          {b.activities.length > 0 && (
            <div className="panel">
              <h2>Activities</h2>
              <ul className="ticks" style={{ marginTop: 10 }}>{b.activities.map((a) => <li key={a.id}>{a.activity.name} × {a.quantity} · {label(a.status)}</li>)}</ul>
            </div>
          )}
        </div>

        <div className="stack" style={{ gap: 18 }}>
          <div className="panel">
            <h2>Payments</h2>
            <div className="table-wrap" style={{ marginTop: 14 }}>
              <table className="t">
                <thead><tr><th>Type</th><th>Due</th><th className="num">Amount</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {b.payments.map((p) => (
                    <tr key={p.id}>
                      <td>{label(p.kind)} {p.sequence ? `#${p.sequence}` : ""}</td>
                      <td>{fmtDate(p.dueDate)}</td>
                      <td className="num">{money(p.amountCents, b.currency)}{p.refundedCents ? <div className="fine">−{money(p.refundedCents, b.currency)}</div> : null}</td>
                      <td><span className={`status status--${paymentTone(p.status)}`}>{label(p.status)}</span>{p.lastError && <div className="fine" title={p.lastError}>{p.lastError.slice(0, 40)}…</div>}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {["SCHEDULED", "FAILED", "PENDING"].includes(p.status) && b.status !== "CANCELLED" && (
                          <>
                            {b.status === "DEPOSIT_PAID" && p.kind === "INSTALLMENT" && <form action={adminChargeNow} style={{ display: "inline" }}><input type="hidden" name="paymentId" value={p.id} /><button className="mini-btn mini-btn--aqua">Charge now</button></form>}{" "}
                            <form action={adminMarkPaid} style={{ display: "inline" }}><input type="hidden" name="paymentId" value={p.id} /><button className="mini-btn" title="Received by wire / cash">Mark paid</button></form>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {b.stripeCustomerId && <p className="fine" style={{ marginTop: 10 }}>Stripe customer {b.stripeCustomerId}{b.stripePaymentMethodId ? " · card saved for instalments" : ""}</p>}
          </div>

          {(b.status === "HOLD" || b.status === "PENDING_PAYMENT" || b.status === "EXPIRED") && (
            <div className="panel">
              <h2>Hold</h2>
              <p className="muted" style={{ marginTop: 8 }}>{b.holdExpiresAt ? `Held until ${fmtDate(b.holdExpiresAt, true)}.` : "Not held."}</p>
              <form action={adminExtendHold} className="toolbar" style={{ marginTop: 10 }}>
                <input type="hidden" name="bookingId" value={b.id} />
                <select name="hours" defaultValue="48"><option value="24">24 h</option><option value="48">48 h</option><option value="168">7 days</option></select>
                <button className="mini-btn">Extend hold</button>
              </form>
            </div>
          )}

          {b.status !== "CANCELLED" && (
            <div className="panel" style={{ borderColor: "rgba(255,138,122,.3)" }}>
              <h2>Cancel & refund</h2>
              <p className="muted" style={{ marginTop: 8 }}>Policy today: <b style={{ color: "var(--ink)" }}>{pct}%</b> of {money(refundable, b.currency)} paid → suggested refund {money(suggested, b.currency)}. You can override the amount.</p>
              <form action={adminCancel} className="form" style={{ marginTop: 14 }}>
                <input type="hidden" name="bookingId" value={b.id} />
                <div className="f"><label>Refund amount ({b.currency.toUpperCase()})</label><input name="refund" type="number" step="0.01" min={0} max={refundable / 100} defaultValue={active ? suggested / 100 : 0} /></div>
                <div className="f"><label>Reason</label><input name="reason" defaultValue={b.cancelReason ?? ""} /></div>
                <div className="f--full"><button className="mini-btn mini-btn--bad">Cancel booking{active ? " & refund" : ""}</button></div>
              </form>
              <p className="fine" style={{ marginTop: 10 }}>Cancelling frees the room immediately, cancels future instalments and emails the guest.</p>
            </div>
          )}

          <div className="panel">
            <h2>History</h2>
            <ul className="ticks" style={{ marginTop: 10 }}>
              {log.map((l) => <li key={l.id} className="fine">{fmtDate(l.createdAt, true)} · {l.action}</li>)}
              <li className="fine">{fmtDate(b.createdAt, true)} · created</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
