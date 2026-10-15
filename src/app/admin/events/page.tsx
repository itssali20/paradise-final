import Link from "next/link";
import { asc, sql, inArray, eq } from "drizzle-orm";
import { db, s } from "@/db";
import { hydrateAny } from "@/lib/events";
import { getDestination } from "@/content/destinations";
import { dateRange, money } from "@/lib/format";
import { label } from "@/lib/status";
import { duplicateEvent } from "@/actions/admin";

export const metadata = { title: "Events" };

export default async function AdminEvents() {
  const rows = await db.select().from(s.events).orderBy(asc(s.events.startDate));
  const events = await hydrateAny(rows);
  const revenue = rows.length
    ? await db.select({ e: s.bookings.eventId, v: sql<number>`coalesce(sum(${s.bookings.paidCents} - ${s.bookings.refundedCents}),0)::int` }).from(s.bookings).where(inArray(s.bookings.eventId, rows.map((r) => r.id))).groupBy(s.bookings.eventId)
    : [];
  void eq;
  return (
    <>
      <div className="admin__head">
        <div><span className="caps caps--aqua">One resort per month</span><h1>Events & inventory</h1></div>
        <Link className="mini-btn mini-btn--solid" href="/admin/events/new">+ New event</Link>
      </div>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>Event</th><th>Dates</th><th>Status</th><th className="num">Rooms sold</th><th className="num">Gentlemen</th><th className="num">Ladies</th><th className="num">Collected</th><th /></tr></thead>
          <tbody>
            {events.map((e) => {
              const total = e.roomTypes.reduce((a, r) => a + r.inventory, 0);
              const sold = e.roomTypes.reduce((a, r) => a + r.inventory - r.available, 0);
              return (
                <tr key={e.id}>
                  <td><Link href={`/admin/events/${e.id}`}><b>{getDestination(e.destinationSlug)?.name ?? e.title}</b></Link><div className="fine">{e.resortName}</div></td>
                  <td>{dateRange(e.startDate, e.endDate)}</td>
                  <td><span className={`status status--${e.status === "PUBLISHED" ? "ok" : e.status === "DRAFT" ? "warn" : "bad"}`}>{label(e.status)}</span></td>
                  <td className="num">{sold}/{total}</td>
                  <td className="num">{e.menCapacity - e.menLeft}/{e.menCapacity}</td>
                  <td className="num">{e.womenCapacity - e.womenLeft}/{e.womenCapacity}</td>
                  <td className="num">{money(revenue.find((r) => r.e === e.id)?.v ?? 0, e.currency)}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <Link className="mini-btn" href={`/admin/events/${e.id}`}>Edit</Link>{" "}
                    <Link className="mini-btn" href={`/admin/events/${e.id}/guests`}>Guests</Link>{" "}
                    <form action={duplicateEvent} style={{ display: "inline" }}><input type="hidden" name="id" value={e.id} /><button className="mini-btn mini-btn--aqua" title="Copy to next month">Duplicate → next month</button></form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!events.length && <p className="muted" style={{ marginTop: 20 }}>No events yet.</p>}
    </>
  );
}
