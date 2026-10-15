import Link from "next/link";
import { and, desc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";
import { db, s } from "@/db";
import { getDestination } from "@/content/destinations";
import { fmtDate, money } from "@/lib/format";
import { bookingTone, label } from "@/lib/status";

export const metadata = { title: "Bookings" };

const STATUSES = ["HOLD", "PENDING_PAYMENT", "DEPOSIT_PAID", "PAID", "CANCELLED", "EXPIRED"] as const;

export default async function AdminBookings({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; event?: string }> }) {
  const sp = await searchParams;
  const conds: SQL[] = [];
  if (sp.event) conds.push(eq(s.bookings.eventId, sp.event));
  if (sp.status && (STATUSES as readonly string[]).includes(sp.status)) conds.push(eq(s.bookings.status, sp.status as (typeof STATUSES)[number]));
  if (sp.status === "FAILED") {
    const ids = await db.select({ id: s.payments.bookingId }).from(s.payments).where(eq(s.payments.status, "FAILED"));
    conds.push(ids.length ? inArray(s.bookings.id, ids.map((x) => x.id)) : eq(s.bookings.id, "__none__"));
  }
  if (sp.q) conds.push(or(ilike(s.bookings.ref, `%${sp.q}%`), ilike(s.bookings.contactName, `%${sp.q}%`), ilike(s.bookings.contactEmail, `%${sp.q}%`))!);
  const [list, events] = await Promise.all([
    db.query.bookings.findMany({ where: conds.length ? and(...conds) : undefined, with: { event: true, roomType: true, room: true }, orderBy: [desc(s.bookings.createdAt)], limit: 300 }),
    db.select({ id: s.events.id, d: s.events.destinationSlug, start: s.events.startDate }).from(s.events).orderBy(s.events.startDate),
  ]);
  return (
    <>
      <div className="admin__head">
        <div><span className="caps caps--aqua">Reservations</span><h1>Bookings & payments</h1></div>
        <div style={{ display: "flex", gap: 8 }}>
          <a className="mini-btn" href={`/api/admin/export?type=bookings${sp.event ? `&event=${sp.event}` : ""}`}>Export CSV</a>
          <Link className="mini-btn mini-btn--solid" href="/admin/bookings/new">+ Manual booking</Link>
        </div>
      </div>
      <form className="toolbar">
        <input name="q" placeholder="Ref, name or email" defaultValue={sp.q ?? ""} />
        <select name="event" defaultValue={sp.event ?? ""}><option value="">All events</option>{events.map((e) => <option key={e.id} value={e.id}>{getDestination(e.d)?.name} · {fmtDate(e.start)}</option>)}</select>
        <select name="status" defaultValue={sp.status ?? ""}><option value="">All statuses</option>{STATUSES.map((x) => <option key={x} value={x}>{label(x)}</option>)}<option value="FAILED">Has failed payment</option></select>
        <button className="mini-btn mini-btn--solid">Filter</button>
      </form>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>Ref</th><th>Guest</th><th>Event</th><th>Room</th><th>Plan</th><th>Status</th><th className="num">Paid / total</th><th>Created</th></tr></thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id}>
                <td><Link href={`/admin/bookings/${b.id}`}><b>{b.ref}</b></Link>{b.cancelRequestedAt && b.status !== "CANCELLED" && <div><span className="status status--warn">Cancel req.</span></div>}</td>
                <td>{b.contactName}<div className="fine">{b.contactEmail}</div></td>
                <td>{getDestination(b.event.destinationSlug)?.name}<div className="fine">{fmtDate(b.event.startDate)}</div></td>
                <td>{b.roomType.name}{b.room ? <div className="fine">#{b.room.label}</div> : null}</td>
                <td>{b.packageType === "LADY_COMPLIMENTARY" ? "Complimentary" : label(b.plan)}</td>
                <td><span className={`status status--${bookingTone(b.status)}`}>{label(b.status)}</span></td>
                <td className="num">{money(b.paidCents, b.currency)} / {money(b.totalCents, b.currency)}</td>
                <td className="fine">{fmtDate(b.createdAt, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!list.length && <p className="muted" style={{ marginTop: 16 }}>No bookings match.</p>}
    </>
  );
}
