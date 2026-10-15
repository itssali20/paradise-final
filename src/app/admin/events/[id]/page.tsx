import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, inArray, isNotNull } from "drizzle-orm";
import { db, s } from "@/db";
import { getEventById } from "@/lib/events";
import { getDestination } from "@/content/destinations";
import { dateRange, money } from "@/lib/format";
import EventForm from "@/components/admin/EventForm";
import { deleteActivity, deleteRoom, deleteRoomType, duplicateEvent, generateRooms, saveActivity, saveRoomType, updateEvent } from "@/actions/admin";

export const metadata = { title: "Edit event" };

const TABS = [
  { k: "details", l: "Details & payment rules" },
  { k: "rooms", l: "Room types & prices" },
  { k: "inventory", l: "Physical rooms" },
  { k: "activities", l: "Activities" },
];

export default async function EditEvent({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const [raw] = await db.select().from(s.events).where(eq(s.events.id, id));
  if (!raw) notFound();
  const e = (await getEventById(id))!;
  const tab = sp.tab ?? "details";
  const rooms = tab === "inventory" ? await db.select().from(s.rooms).where(eq(s.rooms.eventId, id)).orderBy(asc(s.rooms.label)) : [];
  const assigned = rooms.length ? await db.select({ roomId: s.bookings.roomId, ref: s.bookings.ref }).from(s.bookings).where(and(eq(s.bookings.eventId, id), isNotNull(s.bookings.roomId))) : [];
  const acts = tab === "activities" ? await db.select().from(s.activities).where(eq(s.activities.eventId, id)).orderBy(asc(s.activities.sortOrder)) : [];
  void inArray;

  return (
    <>
      <div className="admin__head">
        <div>
          <Link className="caps caps--dim" href="/admin/events">← Events</Link>
          <h1>{getDestination(e.destinationSlug)?.name ?? e.title}</h1>
          <p className="muted">{dateRange(e.startDate, e.endDate)} · {e.status.toLowerCase()} · <Link className="link-line" href={`/events/${e.slug}`} target="_blank">/events/{e.slug}</Link></p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="mini-btn mini-btn--aqua" href={`/admin/events/${id}/guests`}>Guests & room assignment</Link>
          <Link className="mini-btn" href={`/admin/bookings?event=${id}`}>Bookings</Link>
          <form action={duplicateEvent}><input type="hidden" name="id" value={id} /><button className="mini-btn">Duplicate → next month</button></form>
        </div>
      </div>
      {sp.created && <p className="notice" style={{ marginBottom: 14 }}>Event created. Set prices and inventory, then switch the status to PUBLISHED.</p>}
      {sp.saved && <p className="notice" style={{ marginBottom: 14 }}>Saved.</p>}
      {sp.error && <p className="notice notice--warn" style={{ marginBottom: 14 }}>{sp.error}</p>}

      <div className="tabs">
        {TABS.map((t) => <Link key={t.k} href={`/admin/events/${id}?tab=${t.k}`} className={tab === t.k ? "on" : ""}>{t.l}</Link>)}
      </div>

      {tab === "details" && <EventForm e={raw} action={updateEvent} submit="Save event" />}

      {tab === "rooms" && (
        <div className="stack">
          <div className="table-wrap">
            <table className="t">
              <thead><tr><th>Room type</th><th className="num">Gentleman price</th><th className="num">+ Lady</th><th className="num">Inventory</th><th className="num">Sold / held</th><th className="num">Available</th><th /></tr></thead>
              <tbody>
                {e.roomTypes.map((r) => (
                  <tr key={r.id}>
                    <td><b>{r.name}</b><div className="fine">Tier {r.tier} · max {r.maxGuests} guests</div></td>
                    <td className="num">{money(r.priceCents, e.currency)}</td>
                    <td className="num">{money(r.companionCents, e.currency)}</td>
                    <td className="num">{r.inventory}</td>
                    <td className="num">{r.inventory - r.available}</td>
                    <td className="num"><span className={`status status--${r.available ? "ok" : "bad"}`}>{r.available}</span></td>
                    <td><a className="mini-btn" href={`#rt-${r.id}`}>Edit</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {[...e.roomTypes, null].map((r) => (
            <details key={r?.id ?? "new"} id={r ? `rt-${r.id}` : "rt-new"} className="panel" open={!r && !e.roomTypes.length}>
              <summary style={{ cursor: "pointer" }}><b>{r ? `Edit · ${r.name}` : "+ Add a room type"}</b></summary>
              <form className="form" action={saveRoomType} style={{ marginTop: 16 }}>
                <input type="hidden" name="eventId" value={id} />
                {r && <input type="hidden" name="id" value={r.id} />}
                <div className="f"><label>Name</label><input name="name" defaultValue={r?.name ?? ""} required /></div>
                <div className="f"><label>Tier (1–4)</label><input name="tier" type="number" min={1} max={9} defaultValue={r?.tier ?? 1} /></div>
                <div className="f"><label>Gentleman price ({e.currency.toUpperCase()})</label><input name="price" type="number" step="0.01" min={0} defaultValue={r ? r.priceCents / 100 : ""} required /></div>
                <div className="f"><label>Lady companion add-on</label><input name="companion" type="number" step="0.01" min={0} defaultValue={r ? r.companionCents / 100 : 0} /></div>
                <div className="f"><label>Rooms to sell (inventory)</label><input name="inventory" type="number" min={0} defaultValue={r?.inventory ?? 10} required /></div>
                <div className="f"><label>Max guests per room</label><input name="maxGuests" type="number" min={1} max={4} defaultValue={r?.maxGuests ?? 2} /></div>
                <div className="f f--full"><label>Description</label><textarea name="description" defaultValue={r?.description ?? ""} /></div>
                <div className="f f--full"><label>Features (comma separated)</label><input name="features" defaultValue={r?.features.join(", ") ?? ""} /></div>
                <div className="f"><label>Image</label><input name="image" defaultValue={r?.image ?? ""} placeholder="/media/… or un:id or https://" /></div>
                <div className="f"><label>Sort order</label><input name="sortOrder" type="number" defaultValue={r ? e.roomTypes.indexOf(r) : e.roomTypes.length} /></div>
                <div className="f--full" style={{ display: "flex", gap: 10 }}><button className="mini-btn mini-btn--solid">{r ? "Save room type" : "Add room type"}</button></div>
              </form>
              {r && (
                <form action={deleteRoomType} style={{ marginTop: 10 }}><input type="hidden" name="eventId" value={id} /><input type="hidden" name="id" value={r.id} /><button className="mini-btn mini-btn--bad">Delete room type</button></form>
              )}
            </details>
          ))}
          <p className="fine">Inventory is enforced at checkout inside a locked database transaction — the last room can never be sold twice. Reducing inventory never cancels existing bookings.</p>
        </div>
      )}

      {tab === "inventory" && (
        <div className="stack">
          <p className="muted">Physical rooms are used for room assignment on the guest board. Generate numbered rooms per type, or paste the hotel&apos;s room list.</p>
          <form className="form form--card" action={generateRooms}>
            <input type="hidden" name="eventId" value={id} />
            <div className="f"><label>Room type</label><select name="roomTypeId">{e.roomTypes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
            <div className="f"><label>Prefix</label><input name="prefix" defaultValue="R" /></div>
            <div className="f"><label>First number</label><input name="start" type="number" defaultValue={101} /></div>
            <div className="f"><label>How many</label><input name="count" type="number" defaultValue={10} /></div>
            <div className="f f--full"><label>…or paste room labels (comma / new line)</label><textarea name="labels" placeholder="1201, 1202, Villa Azul" /></div>
            <div className="f--full"><button className="mini-btn mini-btn--solid">Add rooms</button></div>
          </form>
          {e.roomTypes.map((rt) => {
            const list = rooms.filter((r) => r.roomTypeId === rt.id);
            return (
              <div className="panel" key={rt.id}>
                <div className="panel-head"><h2 style={{ fontSize: "1.4rem" }}>{rt.name}</h2><span className="muted">{list.length} physical rooms · {rt.inventory} for sale</span></div>
                <div className="board">
                  {list.map((r) => {
                    const a = assigned.find((x) => x.roomId === r.id);
                    return (
                      <div key={r.id} className={`roomcell${a ? " is-taken" : ""}`}>
                        <b>{r.label}</b>
                        {a ? <span className="fine">{a.ref}</span> : (
                          <form action={deleteRoom}><input type="hidden" name="eventId" value={id} /><input type="hidden" name="id" value={r.id} /><button className="fine" style={{ color: "var(--ink-3)" }}>remove</button></form>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "activities" && (
        <div className="stack">
          <div className="table-wrap">
            <table className="t">
              <thead><tr><th>Activity</th><th>Category</th><th className="num">Price</th><th className="num">Capacity</th><th /></tr></thead>
              <tbody>
                {acts.map((a) => (
                  <tr key={a.id}>
                    <td><b>{a.name}</b></td><td>{a.category}</td><td className="num">{money(a.priceCents, e.currency)}</td><td className="num">{a.capacity}</td>
                    <td><form action={deleteActivity}><input type="hidden" name="eventId" value={id} /><input type="hidden" name="id" value={a.id} /><button className="mini-btn mini-btn--bad">Delete</button></form></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {[...acts, null].map((a) => (
            <details key={a?.id ?? "new"} className="panel">
              <summary style={{ cursor: "pointer" }}><b>{a ? `Edit · ${a.name}` : "+ Add activity"}</b></summary>
              <form className="form" action={saveActivity} style={{ marginTop: 16 }}>
                <input type="hidden" name="eventId" value={id} />
                {a && <input type="hidden" name="id" value={a.id} />}
                <div className="f"><label>Name</label><input name="name" defaultValue={a?.name ?? ""} required /></div>
                <div className="f"><label>Category</label><select name="category" defaultValue={a?.category ?? "Ocean"}>{["Ocean", "Beach", "Excursion", "Evenings", "Wellness"].map((c) => <option key={c}>{c}</option>)}</select></div>
                <div className="f"><label>Price</label><input name="price" type="number" step="0.01" defaultValue={a ? a.priceCents / 100 : ""} required /></div>
                <div className="f"><label>Capacity</label><input name="capacity" type="number" defaultValue={a?.capacity ?? 20} /></div>
                <div className="f f--full"><label>Image</label><input name="image" defaultValue={a?.image ?? ""} /></div>
                <div className="f f--full"><label>Description</label><textarea name="description" defaultValue={a?.description ?? ""} /></div>
                <div className="f--full"><button className="mini-btn mini-btn--solid">Save activity</button></div>
              </form>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
