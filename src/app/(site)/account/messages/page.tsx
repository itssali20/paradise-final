import Link from "next/link";
import { desc, eq, inArray, or, and, isNull, ne, sql } from "drizzle-orm";
import { db, s } from "@/db";
import { requireUser } from "@/lib/auth";
import { initials } from "@/lib/members";

export default async function MessagesPage() {
  const u = await requireUser();
  const convs = await db.select().from(s.conversations).where(or(eq(s.conversations.aId, u.id), eq(s.conversations.bId, u.id))).orderBy(desc(s.conversations.updatedAt));
  const others = convs.map((c) => (c.aId === u.id ? c.bId : c.aId));
  const profiles = others.length ? await db.select().from(s.profiles).where(inArray(s.profiles.userId, others)) : [];
  const unread = convs.length
    ? await db.select({ c: s.messages.conversationId, n: sql<number>`count(*)::int` }).from(s.messages)
        .where(and(inArray(s.messages.conversationId, convs.map((c) => c.id)), ne(s.messages.senderId, u.id), isNull(s.messages.readAt))).groupBy(s.messages.conversationId)
    : [];
  return (
    <div className="stack">
      <h1 className="h2">Messages</h1>
      <div className="panel" style={{ display: "grid", gap: 4 }}>
        {convs.length ? convs.map((c, i) => {
          const p = profiles.find((x) => x.userId === others[i]);
          const n = unread.find((x) => x.c === c.id)?.n ?? 0;
          return (
            <Link key={c.id} className="conv" href={`/account/messages/${c.id}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p?.photos[0] ? <img className="avatar" src={p.photos[0]} alt="" /> : <span className="avatar">{initials(p?.displayName ?? "?")}</span>}
              <div style={{ flex: 1 }}><b>{p?.displayName ?? "Member"}</b><div className="fine">Updated {c.updatedAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</div></div>
              {n > 0 && <span className="status status--info">{n} new</span>}
            </Link>
          );
        }) : <p className="muted">No conversations yet. Accepted introductions appear here. <Link className="link-line" href="/account/members">Browse members</Link></p>}
      </div>
    </div>
  );
}
