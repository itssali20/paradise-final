import Link from "next/link";
import { asc, count, countDistinct, desc, eq } from "drizzle-orm";
import { db, s } from "@/db";
import { fmtDate } from "@/lib/format";
import { label } from "@/lib/status";
import { age } from "@/lib/members";
import { chooseTopVoted, moderateCasting } from "@/actions/casting";
import { CASTING, PHOTO_SETS } from "@/content/casting";

export const metadata = { title: "Casting" };
const STATUSES = ["APPROVED", "PENDING", "CHOSEN", "REJECTED"] as const;
type Status = (typeof STATUSES)[number];
const TAB: Record<Status, string> = { APPROVED: "Live ranking", PENDING: "To review", CHOSEN: "Shortlist", REJECTED: "Rejected" };
const tone = (x: string) => (x === "CHOSEN" ? "ok" : x === "APPROVED" ? "info" : x === "REJECTED" ? "bad" : "warn");

export default async function CastingAdmin({ searchParams }: { searchParams: Promise<{ status?: string; open?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const status: Status = (STATUSES as readonly string[]).includes(sp.status ?? "") ? (sp.status as Status) : "APPROVED";
  const votes = count(s.castingVotes.voterId);

  const [list, byStatus, [totals]] = await Promise.all([
    db.select({ e: s.castingEntries, votes }).from(s.castingEntries)
      .leftJoin(s.castingVotes, eq(s.castingVotes.entryId, s.castingEntries.id))
      .where(eq(s.castingEntries.status, status))
      .groupBy(s.castingEntries.id)
      .orderBy(...(status === "PENDING" ? [asc(s.castingEntries.createdAt)] : [desc(votes), asc(s.castingEntries.createdAt)]))
      .limit(500),
    db.select({ status: s.castingEntries.status, n: count() }).from(s.castingEntries).groupBy(s.castingEntries.status),
    db.select({ votes: count(), voters: countDistinct(s.castingVotes.voterId) }).from(s.castingVotes),
  ]);
  const n = Object.fromEntries(byStatus.map((r) => [r.status, r.n])) as Partial<Record<Status, number>>;
  const chosen = n.CHOSEN ?? 0;
  const room = Math.max(0, CASTING.shortlist - chosen);

  let open = sp.open ? list.find((r) => r.e.id === sp.open) : undefined;
  if (sp.open && !open) {
    const [r] = await db.select({ e: s.castingEntries, votes }).from(s.castingEntries)
      .leftJoin(s.castingVotes, eq(s.castingVotes.entryId, s.castingEntries.id))
      .where(eq(s.castingEntries.id, sp.open)).groupBy(s.castingEntries.id);
    open = r;
  }
  const qs = (o: Record<string, string | undefined>) => "?" + new URLSearchParams(Object.entries({ status, ...o }).filter(([, v]) => v) as [string, string][]).toString();
  const back = `/admin/casting${qs({ open: open?.e.id })}`;

  return (
    <>
      <div className="admin__head">
        <div><span className="caps caps--aqua">Ladies apply · gentlemen vote</span><h1>Casting</h1></div>
        {status === "APPROVED" && room > 0 && (n.APPROVED ?? 0) > 0 && (
          <form action={chooseTopVoted} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <label className="check" style={{ gridColumn: "auto" }}><input type="checkbox" name="notify" /> Email the chosen ladies</label>
            <button className="mini-btn mini-btn--solid">Shortlist top {Math.min(room, n.APPROVED ?? 0)}</button>
          </form>
        )}
      </div>

      <div className="kpis" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 18 }}>
        {[
          ["To review", n.PENDING ?? 0],
          ["In voting", n.APPROVED ?? 0],
          [`Shortlisted / ${CASTING.shortlist}`, chosen],
          ["Votes cast", totals.votes],
          ["Gentlemen voting", totals.voters],
        ].map(([k, v]) => <div key={k} className="panel" style={{ margin: 0 }}><span className="caps caps--dim">{k}</span><b style={{ display: "block", font: "700 1.6rem/1.2 var(--f-sans)" }}>{v}</b></div>)}
      </div>

      {sp.deleted && <p className="notice" style={{ marginBottom: 12 }}>Application and photos deleted.</p>}
      <div className="tabs">
        {STATUSES.map((x) => <Link key={x} href={`/admin/casting?status=${x}`} className={status === x ? "on" : ""}>{TAB[x]} ({n[x] ?? 0})</Link>)}
      </div>
      {status === "APPROVED" && <p className="fine" style={{ marginBottom: 12 }}>Ranked by votes. The line marks the {room} place{room === 1 ? "" : "s"} left on the {CASTING.shortlist}-lady shortlist ({CASTING.invited} travel, {CASTING.shortlist - CASTING.invited} reserve).</p>}

      <div style={{ display: "grid", gridTemplateColumns: open ? "minmax(0,1fr) minmax(0,1fr)" : "1fr", gap: 18, alignItems: "start" }}>
        <div className="table-wrap">
          <table className="t">
            <thead><tr>{status !== "PENDING" && <th>#</th>}<th>Lady</th><th>Age</th><th className="num">Votes</th><th>{status === "PENDING" ? "Received" : "Status"}</th></tr></thead>
            <tbody>
              {list.map(({ e, votes: v }, i) => (
                <tr key={e.id} style={{
                  ...(e.id === open?.e.id ? { background: "rgba(47,216,242,.06)" } : {}),
                  ...(status === "APPROVED" && i === room && room > 0 ? { borderTop: "3px solid #0e7490" } : {}),
                }}>
                  {status !== "PENDING" && <td className="tnum"><b>{i + 1}</b></td>}
                  <td>
                    <Link href={qs({ open: e.id })} style={{ display: "flex", gap: 10, alignItems: "center", textDecoration: "none" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={e.photos.dress[0]} alt="" style={{ width: 40, height: 52, objectFit: "cover", borderRadius: 6, flex: "none" }} />
                      <span><b>{e.name}</b><span className="fine" style={{ display: "block" }}>{e.email} · {e.country}</span></span>
                    </Link>
                  </td>
                  <td>{age(e.birthDate)}</td>
                  <td className="num tnum"><b>{v}</b></td>
                  <td>{status === "PENDING" ? <span className="fine">{fmtDate(e.createdAt, true)}</span> : <span className={`status status--${tone(e.status)}`}>{label(e.status)}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && <p className="muted" style={{ padding: 16 }}>Nothing here yet.</p>}
        </div>

        {open && (
          <div className="panel" style={{ position: "sticky", top: 20 }}>
            <div className="panel-head">
              <h2>{open.e.name} <span className={`status status--${tone(open.e.status)}`}>{label(open.e.status)}</span></h2>
              <Link className="mini-btn" href={qs({ open: undefined })}>Close</Link>
            </div>
            <div className="kv">
              <div><span>Votes</span><b>{open.votes}</b></div>
              <div><span>Age</span><b>{age(open.e.birthDate)} · {fmtDate(open.e.birthDate)}</b></div>
              <div><span>Email</span><b><a href={`mailto:${open.e.email}`}>{open.e.email}</a></b></div>
              <div><span>Phone</span><b>{open.e.phone ?? "—"}</b></div>
              <div><span>From</span><b>{[open.e.city, open.e.country].filter(Boolean).join(", ") || "—"}</b></div>
              <div><span>Height</span><b>{open.e.heightCm ? `${open.e.heightCm} cm` : "—"}</b></div>
              <div><span>Languages</span><b>{open.e.languages || "—"}</b></div>
              <div><span>Instagram</span><b>{open.e.instagram || "—"}</b></div>
              <div style={{ gridColumn: "1/-1" }}><span>Preferred event</span><b>{open.e.event || "—"}</b></div>
              {open.e.about && <div style={{ gridColumn: "1/-1" }}><span>About</span><b style={{ whiteSpace: "pre-wrap", fontWeight: 400 }}>{open.e.about}</b></div>}
            </div>
            {PHOTO_SETS.map((set) => (
              <div key={set.key} style={{ marginTop: 16 }}>
                <span className="caps caps--dim">{set.short} ({open.e.photos[set.key].length})</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8, marginTop: 8 }}>
                  {open.e.photos[set.key].map((f) => (
                    <a key={f} href={f} target="_blank" rel="noopener" className="frame" style={{ aspectRatio: "3/4", borderRadius: 10 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f} alt="" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
            <form className="form" action={moderateCasting} style={{ marginTop: 18 }}>
              <input type="hidden" name="id" value={open.e.id} />
              <input type="hidden" name="back" value={back} />
              <div className="f f--full"><label>Internal notes</label><textarea name="adminNotes" defaultValue={open.e.adminNotes ?? ""} placeholder="ID checked, call notes…" /></div>
              <label className="check"><input type="checkbox" name="notify" defaultChecked /> Email her about the change</label>
              <div className="f--full" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {open.e.status !== "APPROVED" && open.e.status !== "CHOSEN" && <button className="mini-btn mini-btn--solid" name="action" value="approve">Approve for voting</button>}
                {open.e.status !== "CHOSEN" && open.e.status !== "PENDING" && open.e.status !== "REJECTED" && <button className="mini-btn mini-btn--aqua" name="action" value="choose">Add to shortlist</button>}
                {open.e.status === "CHOSEN" && <button className="mini-btn" name="action" value="unchoose">Back to voting</button>}
                {open.e.status !== "REJECTED" && <button className="mini-btn mini-btn--bad" name="action" value="reject">Reject</button>}
                <button className="mini-btn" name="action" value="save">Save notes</button>
              </div>
            </form>
            <form action={moderateCasting} style={{ marginTop: 10 }}>
              <input type="hidden" name="id" value={open.e.id} />
              <button className="mini-btn mini-btn--bad" name="action" value="delete">Delete application &amp; photos</button>
            </form>
            <p className="fine" style={{ marginTop: 8 }}>Received {fmtDate(open.e.createdAt, true)}</p>
          </div>
        )}
      </div>
    </>
  );
}
