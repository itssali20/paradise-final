import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, ne, isNull, or } from "drizzle-orm";
import { db, s } from "@/db";
import { requireUser } from "@/lib/auth";
import { initials, isBlockedEither } from "@/lib/members";
import Chat from "@/components/account/Chat";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser();
  const { id } = await params;
  const [c] = await db.select().from(s.conversations).where(and(eq(s.conversations.id, id), or(eq(s.conversations.aId, u.id), eq(s.conversations.bId, u.id))));
  if (!c) notFound();
  const otherId = c.aId === u.id ? c.bId : c.aId;
  const [p] = await db.select().from(s.profiles).where(eq(s.profiles.userId, otherId));
  const msgs = await db.select().from(s.messages).where(eq(s.messages.conversationId, c.id)).orderBy(asc(s.messages.createdAt)).limit(300);
  await db.update(s.messages).set({ readAt: new Date() }).where(and(eq(s.messages.conversationId, c.id), ne(s.messages.senderId, u.id), isNull(s.messages.readAt)));
  const blocked = await isBlockedEither(u.id, otherId);
  return (
    <div className="panel chat">
      <div className="panel-head" style={{ marginBottom: 0 }}>
        <Link href={`/account/members/${otherId}`} style={{ display: "flex", gap: 12, alignItems: "center", textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {p?.photos[0] ? <img className="avatar" src={p.photos[0]} alt="" /> : <span className="avatar">{initials(p?.displayName ?? "?")}</span>}
          <b className="h3" style={{ fontSize: "1.5rem" }}>{p?.displayName ?? "Member"}</b>
        </Link>
        <Link className="mini-btn" href="/account/messages">All messages</Link>
      </div>
      <Chat conversationId={c.id} me={u.id} blocked={blocked} initial={msgs.map((m) => ({ id: m.id, body: m.body, senderId: m.senderId, createdAt: m.createdAt.toISOString() }))} />
    </div>
  );
}
