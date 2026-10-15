import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, or } from "drizzle-orm";
import { db, s } from "@/db";
import { requireUser } from "@/lib/auth";
import { age, initials, isBlockedEither } from "@/lib/members";
import { blockUser, reportUser, requestIntro } from "@/actions/member";

export default async function MemberPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const me = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const self = id === me.id;
  const row = await db.query.users.findFirst({ where: eq(s.users.id, id), with: { profile: true } });
  if (!row || !row.profile) notFound();
  if (!self && (row.profile.status !== "APPROVED" || !row.profile.visible || row.suspended || (await isBlockedEither(me.id, id)))) notFound();
  const p = row.profile;
  const intros = self ? [] : await db.select().from(s.introductions).where(or(and(eq(s.introductions.fromId, me.id), eq(s.introductions.toId, id)), and(eq(s.introductions.fromId, id), eq(s.introductions.toId, me.id))));
  const [a, b] = [me.id, id].sort();
  const [conv] = self ? [] : await db.select().from(s.conversations).where(and(eq(s.conversations.aId, a), eq(s.conversations.bId, b)));
  const sent = intros.find((i) => i.fromId === me.id);
  const received = intros.find((i) => i.fromId === id && i.status === "PENDING");

  return (
    <div className="stack">
      {sp.sent && <p className="notice">Introduction sent. If they accept, a private conversation opens.</p>}
      {sp.reported && <p className="notice">Thank you. Our team will review your report.</p>}
      {self && <p className="notice">This is how approved members see your profile.</p>}
      <div className="grid-2" style={{ alignItems: "start", gap: 30 }}>
        <div style={{ display: "grid", gap: 10 }}>
          {p.photos.length ? p.photos.map((ph, i) => (
            <div key={ph} className="frame" style={{ borderRadius: 22, aspectRatio: i === 0 ? "4/5" : "16/10" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ph} alt="" />
            </div>
          )) : <div className="avatar" style={{ width: "100%", height: 420, borderRadius: 22, fontSize: "6rem" }}>{initials(p.displayName)}</div>}
        </div>
        <div className="stack">
          <div>
            <span className="caps caps--aqua">{row.gender === "LADY" ? "Lady" : "Gentleman"}{p.verified ? " · Verified" : ""}</span>
            <h1 className="h2" style={{ marginTop: 10 }}>{p.displayName}{age(row.birthDate) ? <span className="muted">, {age(row.birthDate)}</span> : null}</h1>
            {p.headline && <p className="lead" style={{ marginTop: 10 }}>{p.headline}</p>}
          </div>
          <div className="kv">
            {p.city || row.country ? <div><span>Lives in</span><b>{[p.city, row.country].filter(Boolean).join(", ")}</b></div> : null}
            {p.occupation && <div><span>Work</span><b>{p.occupation}</b></div>}
            {p.languages && <div><span>Languages</span><b>{p.languages}</b></div>}
          </div>
          {p.bio && <p style={{ whiteSpace: "pre-wrap" }} className="muted">{p.bio}</p>}
          {p.interests.length > 0 && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{p.interests.map((i) => <span className="chip" key={i}>{i}</span>)}</div>}
          {p.videoUrl && <a className="arrow-link caps" href={p.videoUrl} target="_blank" rel="noopener">Watch video <i /></a>}

          {!self && (
            <div className="panel stack-s">
              {conv ? (
                <Link className="btn btn--chrome" href={`/account/messages/${conv.id}`}>Open conversation</Link>
              ) : received ? (
                <form action={requestIntro}><input type="hidden" name="to" value={id} /><button className="btn btn--aqua">Accept their introduction</button></form>
              ) : sent ? (
                <p className="muted">Introduction {sent.status === "PENDING" ? "sent — waiting for a reply" : sent.status === "DECLINED" ? "declined" : "accepted"}.</p>
              ) : (
                <form action={requestIntro} className="stack-s">
                  <input type="hidden" name="to" value={id} />
                  <label className="f"><span className="label">Add a short note (optional)</span><input name="note" maxLength={300} placeholder="Hi! I'll be in Cancún in December too…" /></label>
                  <button className="btn btn--chrome">Request introduction</button>
                </form>
              )}
              <p className="fine">Messaging opens only when both of you agree.</p>
            </div>
          )}

          {!self && (
            <details className="panel">
              <summary style={{ cursor: "pointer" }}>Block or report</summary>
              <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
                <form action={blockUser}><input type="hidden" name="id" value={id} /><button className="mini-btn mini-btn--bad">Block {p.displayName}</button></form>
                <form action={reportUser} className="stack-s">
                  <input type="hidden" name="id" value={id} />
                  <label className="f"><span className="label">Report reason</span><textarea name="reason" required /></label>
                  <button className="mini-btn">Send report</button>
                </form>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
