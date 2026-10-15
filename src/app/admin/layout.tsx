import type { Metadata } from "next";
import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db, hasDb, s } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/actions/auth";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · Paradise Club" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!hasDb) {
    return (
      <div className="admin" style={{ display: "grid", placeItems: "center", gridTemplateColumns: "1fr" }}>
        <div className="panel" style={{ maxWidth: 520, textAlign: "center" }}>
          <h1 style={{ font: "700 1.4rem/1.3 var(--f-sans)" }}>Admin dashboard</h1>
          <p className="muted" style={{ margin: "10px 0 18px" }}>Connect a database (<code>DATABASE_URL</code>) and run <code>npm run db:seed</code> to create the first admin account.</p>
          <Link className="mini-btn" href="/">Back to site</Link>
        </div>
      </div>
    );
  }
  const admin = await requireAdmin();
  const [[apps], [profiles], [casting]] = await Promise.all([
    db.select({ n: count() }).from(s.applications).where(eq(s.applications.status, "NEW")),
    db.select({ n: count() }).from(s.profiles).where(eq(s.profiles.status, "PENDING")),
    db.select({ n: count() }).from(s.castingEntries).where(eq(s.castingEntries.status, "PENDING")),
  ]);
  return (
    <div className="admin">
      <aside className="admin__side">
        <Link className="admin__brand" href="/admin">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <span className="tile"><img src="/brand/mark-480.webp" alt="" /></span>
          <span><b>Paradise Club</b><small>Admin dashboard</small></span>
        </Link>
        <AdminNav counts={{ applications: apps.n, members: profiles.n, casting: casting.n }} />
        <div className="admin__user">
          <div className="who"><span className="av">{admin.name.slice(0, 1).toUpperCase()}</span><div style={{ minWidth: 0 }}><b style={{ fontSize: ".85rem", display: "block" }}>{admin.name}</b><span>{admin.email}</span></div></div>
          <form action={logout}><button className="mini-btn" style={{ width: "100%" }}>Sign out</button></form>
        </div>
      </aside>
      <div className="admin__wrap">
        <header className="admin__top">
          <form className="admin__search" action="/admin/bookings" role="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input name="q" placeholder="Search bookings by reference, name or email…" aria-label="Search bookings" />
          </form>
          <span className="sp" />
          <Link className="mini-btn" href="/admin/bookings/new">+ Manual booking</Link>
          <Link className="mini-btn mini-btn--solid" href="/admin/events/new">+ New event</Link>
          <Link className="mini-btn" href="/" target="_blank">View site ↗</Link>
        </header>
        <main className="admin__main">{children}</main>
      </div>
    </div>
  );
}
