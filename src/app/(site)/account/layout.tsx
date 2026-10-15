import Link from "next/link";
import { and, count, eq, isNull, ne, or } from "drizzle-orm";
import { hasDb, db, s } from "@/db";
import { requireUser } from "@/lib/auth";
import { logout } from "@/actions/auth";
import AccountNav from "@/components/account/AccountNav";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  if (!hasDb) {
    return (
      <div className="page-pad center stack">
        <h1 className="h2">Members area</h1>
        <p className="lead">Accounts open as soon as the database is connected.</p>
        <Link className="btn" href="/">Back home</Link>
      </div>
    );
  }
  const u = await requireUser();
  const [[intros], [unread]] = await Promise.all([
    db.select({ n: count() }).from(s.introductions).where(and(eq(s.introductions.toId, u.id), eq(s.introductions.status, "PENDING"))),
    db.select({ n: count() }).from(s.messages)
      .innerJoin(s.conversations, eq(s.conversations.id, s.messages.conversationId))
      .where(and(or(eq(s.conversations.aId, u.id), eq(s.conversations.bId, u.id)), ne(s.messages.senderId, u.id), isNull(s.messages.readAt))),
  ]);
  return (
    <div className="acct bg-glow">
      <aside>
        <div style={{ marginBottom: 22 }}>
          <span className="caps caps--aqua">Members area</span>
          <p className="h3" style={{ marginTop: 8 }}>{u.name.split(" ")[0]}</p>
          {u.role === "ADMIN" && <Link className="mini-btn mini-btn--aqua" href="/admin" style={{ marginTop: 10 }}>Admin dashboard</Link>}
        </div>
        <AccountNav intros={intros.n} unread={unread.n} voter={u.gender === "GENTLEMAN" && u.role !== "ADMIN"} />
        <form action={logout} style={{ marginTop: 18 }}><button className="mini-btn">Sign out</button></form>
      </aside>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}
