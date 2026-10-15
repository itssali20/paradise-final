import Link from "next/link";
import { and, count, desc, eq, gt, inArray, isNotNull, ne, sql } from "drizzle-orm";
import { db, s } from "@/db";
import { hydrateAny } from "@/lib/events";
import { getDestination } from "@/content/destinations";
import { dateRange, fmtDate, money } from "@/lib/format";
import { bookingTone, label } from "@/lib/status";

export const metadata = { title: "Dashboard" };

export default async function AdminHome() {
  const now = new Date();
  const [[rev], [outstanding], [active], [apps], [profiles], [failed], cancelReqs, recent, upcomingRows] = await Promise.all([
    db.select({ paid: sql<number>`coalesce(sum(${s.payments.amountCents}),0)::int`, refunded: sql<number>`coalesce(sum(${s.payments.refundedCents}),0)::int` }).from(s.payments).where(inArray(s.payments.status, ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"])),
    db.select({ v: sql<number>`coalesce(sum(${s.payments.amountCents}),0)::int` }).from(s.payments).innerJoin(s.bookings, eq(s.bookings.id, s.payments.bookingId)).where(and(inArray(s.payments.status, ["SCHEDULED", "FAILED"]), eq(s.bookings.status, "DEPOSIT_PAID"))),
    db.select({ n: count() }).from(s.bookings).where(inArray(s.bookings.status, ["DEPOSIT_PAID", "PAID"])),
    db.select({ n: count() }).from(s.applications).where(eq(s.applications.status, "NEW")),
    db.select({ n: count() }).from(s.profiles).where(eq(s.profiles.status, "PENDING")),
    db.select({ n: count() }).from(s.payments).where(eq(s.payments.status, "FAILED")),
    db.select().from(s.bookings).where(and(isNotNull(s.bookings.cancelRequestedAt), ne(s.bookings.status, "CANCELLED"))).limit(10),
    db.query.bookings.findMany({ with: { event: true, roomType: true }, orderBy: [desc(s.bookings.createdAt)], limit: 8 }),
    db.select().from(s.events).where(and(gt(s.events.endDate, now), ne(s.events.status, "CANCELLED"))).orderBy(s.events.startDate).limit(4),
  ]);
  const upcoming = await hydrateAny(upcomingRows);

  return (
    <>
      <div className="admin__head">
        <div>
          <span className="caps caps--aqua">{now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          <h1>Welcome back</h1>
          <p className="muted">Here&apos;s what&apos;s happening across your upcoming Paradise Club events.</p>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi"><span>Collected (net)</span><b className="chrome-static">{money(rev.paid - rev.refunded)}</b><small>Refunded {money(rev.refunded)}</small></div>
        <div className="kpi"><span>Scheduled balances</span><b>{money(outstanding.v)}</b><small>To be charged automatically</small></div>
        <div className="kpi"><span>Confirmed bookings</span><b>{active.n}</b><small><Link href="/admin/bookings">All bookings →</Link></small></div>
        <div className="kpi"><span>New applications</span><b>{apps.n}</b><small><Link href="/admin/applications">Review →</Link></small></div>
        <div className="kpi"><span>Profiles to review</span><b>{profiles.n}</b><small><Link href="/admin/members">Moderate →</Link></small></div>
        <div className="kpi"><span>Failed payments</span><b style={{ color: failed.n ? "var(--danger)" : undefined }}>{failed.n}</b><small><Link href="/admin/bookings?status=FAILED">Resolve →</Link></small></div>
      </div>

      {cancelReqs.length > 0 && (
        <div className="panel" style={{ marginBottom: 18, borderColor: "rgba(255,199,102,.4)" }}>
          <div className="panel-head"><h2>Cancellation requests</h2></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {cancelReqs.map((b) => <Link key={b.id} className="mini-btn" href={`/admin/bookings/${b.id}`}>{b.ref} · {b.contactName}</Link>)}
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-head"><h2>Upcoming events</h2><Link className="mini-btn" href="/admin/events">Manage</Link></div>
        <div style={{ display: "grid", gap: 18 }}>
          {upcoming.map((e) => {
            const sold = e.roomTypes.reduce((a, r) => a + (r.inventory - r.available), 0);
            const total = e.roomTypes.reduce((a, r) => a + r.inventory, 0);
            const men = e.menCapacity - e.menLeft, women = e.womenCapacity - e.womenLeft;
            return (
              <div key={e.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1.6fr) minmax(0,1fr)", gap: 20, alignItems: "center", paddingBottom: 18, borderBottom: "1px solid var(--line)" }}>
                <div>
                  <Link href={`/admin/events/${e.id}`} className="h3" style={{ textDecoration: "none", fontSize: "1.5rem" }}>{getDestination(e.destinationSlug)?.name ?? e.title}</Link>
                  <div className="fine">{dateRange(e.startDate, e.endDate)} · <span className={`status status--${e.status === "PUBLISHED" ? "ok" : "warn"}`}>{label(e.status)}</span></div>
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  {e.roomTypes.map((r) => (
                    <div key={r.id} style={{ display: "grid", gridTemplateColumns: "130px 1fr 60px", gap: 10, alignItems: "center", fontSize: ".82rem" }}>
                      <span className="muted">{r.name}</span>
                      <div className="bar"><i className="w" style={{ width: `${r.inventory ? ((r.inventory - r.available) / r.inventory) * 100 : 0}%` }} /></div>
                      <span className="tnum">{r.inventory - r.available}/{r.inventory}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gap: 8, fontSize: ".82rem" }}>
                  <span className="muted">Rooms {sold}/{total}</span>
                  <div className="bar"><i className="m" style={{ width: `${(men / e.menCapacity) * 100}%` }} /></div>
                  <span className="muted">Gentlemen {men}/{e.menCapacity}</span>
                  <div className="bar"><i className="w" style={{ width: `${(women / e.womenCapacity) * 100}%` }} /></div>
                  <span className="muted">Ladies {women}/{e.womenCapacity}</span>
                </div>
              </div>
            );
          })}
          {!upcoming.length && <p className="muted">No upcoming events. <Link className="link-line" href="/admin/events/new">Create one</Link>.</p>}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h2>Latest bookings</h2><Link className="mini-btn" href="/admin/bookings">All</Link></div>
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Ref</th><th>Guest</th><th>Event</th><th>Room</th><th>Status</th><th className="num">Paid / total</th><th>Created</th></tr></thead>
            <tbody>
              {recent.map((b) => (
                <tr key={b.id}>
                  <td><Link href={`/admin/bookings/${b.id}`}><b>{b.ref}</b></Link></td>
                  <td>{b.contactName}<div className="fine">{b.contactEmail}</div></td>
                  <td>{getDestination(b.event.destinationSlug)?.name}</td>
                  <td>{b.roomType.name}</td>
                  <td><span className={`status status--${bookingTone(b.status)}`}>{label(b.status)}</span></td>
                  <td className="num">{money(b.paidCents, b.currency)} / {money(b.totalCents, b.currency)}</td>
                  <td className="fine">{fmtDate(b.createdAt, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
