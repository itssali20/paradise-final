import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, s } from "@/db";
import { requireUser } from "@/lib/auth";
import { getDestination } from "@/content/destinations";
import { dateRange, money } from "@/lib/format";
import { bookingTone, label } from "@/lib/status";

export default async function MyBookings() {
  const u = await requireUser();
  const list = await db.query.bookings.findMany({ where: eq(s.bookings.userId, u.id), with: { event: true, roomType: true }, orderBy: [desc(s.bookings.createdAt)] });
  return (
    <div className="stack">
      <div className="panel-head"><h1 className="h2">Bookings & payments</h1><Link className="btn btn--chrome btn--sm" href="/events">New reservation</Link></div>
      {list.length ? (
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Ref</th><th>Event</th><th>Room</th><th>Status</th><th className="num">Paid / total</th><th /></tr></thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.id}>
                  <td><b>{b.ref}</b></td>
                  <td>{getDestination(b.event.destinationSlug)?.name}<br /><span className="fine">{dateRange(b.event.startDate, b.event.endDate)}</span></td>
                  <td>{b.roomType.name}{b.women ? " · + guest" : ""}</td>
                  <td><span className={`status status--${bookingTone(b.status)}`}>{label(b.status)}</span></td>
                  <td className="num">{money(b.paidCents, b.currency)} / {money(b.totalCents, b.currency)}</td>
                  <td><Link className="mini-btn" href={`/account/bookings/${b.id}`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="muted">No bookings yet.</p>}
    </div>
  );
}
