"use client";
import { useState, useTransition } from "react";
import { assignRoom } from "@/actions/admin";

type T = { id: string; name: string };
type R = { id: string; label: string; roomTypeId: string };
type B = { id: string; ref: string; roomTypeId: string; roomId: string | null; guests: string; lady: boolean };

/** Drag a booking onto a room (or use the dropdown). Server enforces one booking per room. */
export default function RoomBoard({ types, rooms, bookings: initial }: { types: T[]; rooms: R[]; bookings: B[] }) {
  const [bookings, setBookings] = useState(initial);
  const [over, setOver] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const move = (bookingId: string, roomId: string | null) => {
    const prev = bookings;
    setBookings((bs) => bs.map((b) => (b.id === bookingId ? { ...b, roomId } : b)));
    start(async () => {
      const r = await assignRoom(bookingId, roomId);
      setMsg(r.message);
      if (!r.ok) setBookings(prev);
    });
  };

  return (
    <div className="stack">
      {msg && <p className={`notice${msg === "Saved" ? "" : " notice--warn"}`} role="status">{pending ? "Saving…" : msg}</p>}
      {types.map((t) => {
        const unassigned = bookings.filter((b) => b.roomTypeId === t.id && !b.roomId);
        const list = rooms.filter((r) => r.roomTypeId === t.id);
        return (
          <div className="panel" key={t.id}>
            <div className="panel-head"><h2 style={{ fontSize: "1.4rem" }}>{t.name}</h2><span className="muted">{unassigned.length} to assign · {list.length} rooms</span></div>
            <div
              style={{ display: "flex", gap: 8, flexWrap: "wrap", minHeight: 44, padding: 10, border: "1px dashed var(--line-2)", borderRadius: 14, marginBottom: 14 }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); move(e.dataTransfer.getData("text/plain"), null); }}
            >
              {unassigned.length ? unassigned.map((b) => (
                <div key={b.id} className="guestchip" draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", b.id)}>
                  <b>{b.ref}</b> · {b.guests}{b.lady ? " · comp." : ""}
                  <select aria-label={`Assign ${b.ref}`} style={{ marginLeft: 8, background: "transparent", color: "var(--ink)", border: "1px solid var(--line-2)", borderRadius: 8 }} value="" onChange={(e) => e.target.value && move(b.id, e.target.value)}>
                    <option value="">Assign…</option>
                    {list.filter((r) => !bookings.some((x) => x.roomId === r.id)).map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </div>
              )) : <span className="fine">Everyone in this room type has a room. Drag a guest here to unassign.</span>}
            </div>
            <div className="board">
              {list.map((r) => {
                const b = bookings.find((x) => x.roomId === r.id);
                return (
                  <div
                    key={r.id}
                    className={`roomcell${b ? " is-taken" : ""}${over === r.id ? " is-over" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setOver(r.id); }}
                    onDragLeave={() => setOver(null)}
                    onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData("text/plain"); if (!b) move(id, r.id); else setMsg(`Room ${r.label} is already taken.`); }}
                  >
                    <b>{r.label}</b>
                    {b ? (
                      <div className="guestchip" draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", b.id)}>{b.ref}<div className="fine">{b.guests}</div></div>
                    ) : <span className="fine">Free</span>}
                  </div>
                );
              })}
              {!list.length && <span className="fine">No physical rooms yet — add them under Event → Physical rooms.</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
