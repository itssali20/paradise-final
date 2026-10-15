import Link from "next/link";
import { asc, eq, gt } from "drizzle-orm";
import { db, s } from "@/db";
import { getDestination } from "@/content/destinations";
import { fmtDate, money } from "@/lib/format";
import { adminCreateBooking } from "@/actions/admin";

export const metadata = { title: "Manual booking" };

export default async function NewBooking({ searchParams }: { searchParams: Promise<{ event?: string; app?: string; error?: string }> }) {
  const sp = await searchParams;
  const events = await db.query.events.findMany({ where: gt(s.events.endDate, new Date()), with: { roomTypes: { orderBy: [asc(s.roomTypes.sortOrder)] } }, orderBy: [asc(s.events.startDate)] });
  const [app] = sp.app ? await db.select().from(s.applications).where(eq(s.applications.id, sp.app)) : [];
  const ev = events.find((e) => e.id === sp.event) ?? events[0];

  return (
    <>
      <div className="admin__head"><div><Link className="caps caps--dim" href="/admin/bookings">← Bookings</Link><h1>Manual & complimentary booking</h1></div></div>
      {sp.error && <p className="notice notice--warn" style={{ marginBottom: 14 }}>{sp.error}</p>}
      <p className="muted" style={{ marginBottom: 16 }}>Use this for ladies attending free (approved applications), phone or wire reservations, and VIPs. Bookings count against live room inventory.</p>
      <form className="toolbar" style={{ marginBottom: 14 }}>
        {app && <input type="hidden" name="app" value={app.id} />}
        <select name="event" defaultValue={ev?.id}>{events.map((e) => <option key={e.id} value={e.id}>{getDestination(e.destinationSlug)?.name} · {fmtDate(e.startDate)}</option>)}</select>
        <button className="mini-btn">Choose event</button>
      </form>
      {ev ? (
        <form className="form form--card" action={adminCreateBooking}>
          <input type="hidden" name="eventId" value={ev.id} />
          {app && <input type="hidden" name="applicationId" value={app.id} />}
          <div className="f f--full">
            <span className="label">Booking type</span>
            <div className="seg">
              <label><input type="radio" name="kind" value="LADY" defaultChecked /><b>Complimentary lady</b><span>No charge · confirmed immediately</span></label>
              <label><input type="radio" name="kind" value="MANUAL" /><b>Manual / phone</b><span>Payment collected by wire or link</span></label>
            </div>
          </div>
          <div className="f"><label>Room type</label><select name="roomTypeId">{ev.roomTypes.map((r) => <option key={r.id} value={r.id}>{r.name} · {money(r.priceCents, ev.currency)}</option>)}</select></div>
          <div className="f"><label>Total for manual booking (blank = list price)</label><input name="total" type="number" step="0.01" min={0} /></div>
          <div className="f"><label>Guest name *</label><input name="name" defaultValue={app?.name ?? ""} required /></div>
          <div className="f"><label>Email *</label><input name="email" type="email" defaultValue={app?.email ?? ""} required /></div>
          <div className="f"><label>Phone</label><input name="phone" defaultValue={app?.phone ?? ""} /></div>
          <div className="f"><label>Country</label><input name="country" defaultValue={app?.country ?? ""} /></div>
          <div className="f f--full"><label>Notes</label><textarea name="notes" placeholder="Shared room with…, flight details, what is covered…" /></div>
          <label className="check"><input type="checkbox" name="force" /> Override if this room type is sold out</label>
          <div className="f--full"><button className="btn btn--chrome">Create booking</button></div>
        </form>
      ) : <p className="muted">Create an event first.</p>}
    </>
  );
}
