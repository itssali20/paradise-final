import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { db, s } from "@/db";
import { requireUser } from "@/lib/auth";
import { respondIntro } from "@/actions/member";
import { initials } from "@/lib/members";
import { label } from "@/lib/status";

export default async function IntrosPage() {
  const u = await requireUser();
  const [received, sent] = await Promise.all([
    db.select().from(s.introductions).where(eq(s.introductions.toId, u.id)).orderBy(desc(s.introductions.createdAt)),
    db.select().from(s.introductions).where(eq(s.introductions.fromId, u.id)).orderBy(desc(s.introductions.createdAt)),
  ]);
  const ids = [...new Set([...received.map((r) => r.fromId), ...sent.map((r) => r.toId)])];
  const profiles = ids.length ? await db.select().from(s.profiles).where(inArray(s.profiles.userId, ids)) : [];
  const pf = (id: string) => profiles.find((p) => p.userId === id);
  const Person = ({ id }: { id: string }) => {
    const p = pf(id);
    return (
      <Link href={`/account/members/${id}`} style={{ display: "flex", gap: 12, alignItems: "center", textDecoration: "none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p?.photos[0] ? <img className="avatar" src={p.photos[0]} alt="" /> : <span className="avatar">{initials(p?.displayName ?? "?")}</span>}
        <b>{p?.displayName ?? "Member"}</b>
      </Link>
    );
  };
  return (
    <div className="stack">
      <h1 className="h2">Introductions</h1>
      <div className="panel">
        <h2>Received</h2>
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {received.length ? received.map((i) => (
            <div key={i.id} className="conv" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <div><Person id={i.fromId} />{i.note && <p className="muted" style={{ marginTop: 6 }}>“{i.note}”</p>}</div>
              {i.status === "PENDING" ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <form action={respondIntro}><input type="hidden" name="id" value={i.id} /><input type="hidden" name="decision" value="accept" /><button className="mini-btn mini-btn--aqua">Accept</button></form>
                  <form action={respondIntro}><input type="hidden" name="id" value={i.id} /><input type="hidden" name="decision" value="decline" /><button className="mini-btn">Decline</button></form>
                </div>
              ) : <span className={`status status--${i.status === "ACCEPTED" ? "ok" : ""}`}>{label(i.status)}</span>}
            </div>
          )) : <p className="muted">No introduction requests yet.</p>}
        </div>
      </div>
      <div className="panel">
        <h2>Sent</h2>
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {sent.length ? sent.map((i) => (
            <div key={i.id} className="conv" style={{ justifyContent: "space-between" }}>
              <Person id={i.toId} />
              <span className={`status status--${i.status === "ACCEPTED" ? "ok" : i.status === "DECLINED" ? "" : "warn"}`}>{label(i.status)}</span>
            </div>
          )) : <p className="muted">You haven&apos;t requested any introductions. <Link className="link-line" href="/account/members">Browse members</Link></p>}
        </div>
      </div>
    </div>
  );
}
