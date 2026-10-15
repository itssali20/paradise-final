import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db, s } from "@/db";
import { getDestination } from "@/content/destinations";
import { dateRange, money } from "@/lib/format";
import { bookingTone, label } from "@/lib/status";
import RoomBoard from "@/components/admin/RoomBoard";

export const metadata = { title: "Guests & rooms" };

export default async function GuestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e] = await db.select().from(s.events).where(eq(s.events.id, id));
  if (!e) notFound();
  const [types, rooms, bookings] = await Promise.all([
    db.select().from(s.roomTypes).where(eq(s.roomTypes.eventId, id)).orderBy(asc(s.roomTypes.sortOrder)),
    db.select().from(s.rooms).where(eq(s.rooms.eventId, id)).orderBy(asc(s.rooms.label)),
    db.query.bookings.findMany({ where: and(eq(s.bookings.eventId, id), inArray(s.bookings.status, ["DEPOSIT_PAID", "PAID", "HOLD", "PENDING_PAYMENT"])), with: { guests: true, roomType: true }, orderBy: [asc(s.bookings.createdAt)] }),
  ]);
  const confirmed = bookings.filter((b) => b.status === "DEPOSIT_PAID" || b.status === "PAID");
  const men = confirmed.reduce((a, b) => a + b.men, 0), women = confirmed.reduce((a, b) => a + b.women, 0);

  return (
    <>
      <div className="admin__head">
        <div>
          <Link className="caps caps--dim" href={`/admin/events/${id}`}>← {getDestination(e.destinationSlug)?.name}</Link>
          <h1>Guests & room assignment</h1>
          <p className="muted">{dateRange(e.startDate, e.endDate)} · {confirmed.length} confirmed bookings · {men} gentlemen · {women} ladies</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a className="mini-btn mini-btn--aqua" href={`/api/admin/export?type=guests&event=${id}`}>Export guest list (CSV)</a>
          <Link className="mini-btn" href={`/admin/bookings/new?event=${id}`}>+ Complimentary / manual</Link>
        </div>
      </div>

      <RoomBoard
        types={types.map((t) => ({ id: t.id, name: t.name }))}
        rooms={rooms.map((r) => ({ id: r.id, label: r.label, roomTypeId: r.roomTypeId }))}
        bookings={confirmed.map((b) => ({ id: b.id, ref: b.ref, roomTypeId: b.roomTypeId, roomId: b.roomId, guests: b.guests.map((g) => g.name).join(" & "), lady: b.packageType === "LADY_COMPLIMENTARY" }))}
      />

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head"><h2>Guest list</h2></div>
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Guest</th><th>Gender</th><th>Country</th><th>Booking</th><th>Room type</th><th>Room</th><th>Status</th><th className="num">Balance</th></tr></thead>
            <tbody>
              {bookings.flatMap((b) => b.guests.map((g) => (
                <tr key={g.id}>
                  <td><b>{g.name}</b>{g.email && <div className="fine">{g.email}</div>}</td>
                  <td>{g.gender === "LADY" ? "Lady" : "Gentleman"}</td>
                  <td>{g.country ?? "—"}</td>
                  <td><Link href={`/admin/bookings/${b.id}`}>{b.ref}</Link></td>
                  <td>{b.roomType.name}</td>
                  <td>{rooms.find((r) => r.id === b.roomId)?.label ?? <span className="muted">—</span>}</td>
                  <td><span className={`status status--${bookingTone(b.status)}`}>{label(b.status)}</span></td>
                  <td className="num">{money(b.totalCents - b.paidCents, b.currency)}</td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
