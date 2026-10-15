import Link from "next/link";
import { and, eq, inArray, ne, notInArray, or, desc } from "drizzle-orm";
import { db, s } from "@/db";
import { requireUser } from "@/lib/auth";
import { age, initials } from "@/lib/members";
import { getUpcomingEvents } from "@/lib/events";
import { getDestination } from "@/content/destinations";
import { monthTag } from "@/lib/format";

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ show?: string; event?: string; blocked?: string }> }) {
  const u = await requireUser();
  const sp = await searchParams;
  const [mine] = await db.select().from(s.profiles).where(eq(s.profiles.userId, u.id));
  const blocks = await db.select().from(s.blocks).where(or(eq(s.blocks.blockerId, u.id), eq(s.blocks.blockedId, u.id)));
  const hidden = [u.id, ...blocks.map((b) => (b.blockerId === u.id ? b.blockedId : b.blockerId))];
  const show = sp.show ?? (u.gender === "GENTLEMAN" ? "LADY" : u.gender === "LADY" ? "GENTLEMAN" : "ALL");
  const events = await getUpcomingEvents();

  let eventUserIds: string[] | null = null;
  if (sp.event) {
    const rows = await db.select({ userId: s.bookings.userId }).from(s.bookings).where(and(eq(s.bookings.eventId, sp.event), inArray(s.bookings.status, ["DEPOSIT_PAID", "PAID"])));
    eventUserIds = rows.map((r) => r.userId!).filter(Boolean);
  }

  const rows = await db.select({ p: s.profiles, u: { id: s.users.id, gender: s.users.gender, birthDate: s.users.birthDate, country: s.users.country } })
    .from(s.profiles).innerJoin(s.users, eq(s.users.id, s.profiles.userId))
    .where(and(
      eq(s.profiles.status, "APPROVED"), eq(s.profiles.visible, true), eq(s.users.suspended, false), notInArray(s.users.id, hidden), ne(s.users.role, "ADMIN"),
      show !== "ALL" ? eq(s.users.gender, show as "LADY" | "GENTLEMAN") : undefined,
      eventUserIds ? (eventUserIds.length ? inArray(s.users.id, eventUserIds) : eq(s.users.id, "__none__")) : undefined,
    ))
    .orderBy(desc(s.profiles.verified), desc(s.profiles.updatedAt)).limit(120);

  const going = await db.select({ userId: s.bookings.userId, eventId: s.bookings.eventId }).from(s.bookings)
    .where(and(inArray(s.bookings.status, ["DEPOSIT_PAID", "PAID"]), rows.length ? inArray(s.bookings.userId, rows.map((r) => r.u.id)) : eq(s.bookings.userId, "__none__")));

  return (
    <div className="stack">
      <div className="panel-head"><h1 className="h2">Members</h1><span className="muted">{rows.length} profile{rows.length === 1 ? "" : "s"}</span></div>
      {sp.blocked && <p className="notice">Member blocked. They can no longer see you or message you.</p>}
      {mine?.status !== "APPROVED" && <p className="notice">Your own profile is {mine?.status === "REJECTED" ? "not approved yet — please update it" : "being reviewed"}. You can browse, but members see you only once it&apos;s approved. <Link className="link-line" href="/account/profile">Edit profile</Link></p>}
      <form className="toolbar">
        <select name="show" defaultValue={show} aria-label="Show">
          <option value="LADY">Ladies</option><option value="GENTLEMAN">Gentlemen</option><option value="ALL">Everyone</option>
        </select>
        <select name="event" defaultValue={sp.event ?? ""} aria-label="Going to">
          <option value="">Any event</option>
          {events.filter((e) => !e.showcase).map((e) => <option key={e.id} value={e.id}>Going to {getDestination(e.destinationSlug)?.name} · {monthTag(e.startDate).short}</option>)}
        </select>
        <button className="mini-btn mini-btn--solid">Filter</button>
      </form>
      {rows.length ? (
        <div className="mgrid">
          {rows.map(({ p, u: m }) => {
            const g = going.find((x) => x.userId === m.id);
            const ev = g ? events.find((e) => e.id === g.eventId) : null;
            return (
              <Link key={p.id} className="mcard" href={`/account/members/${m.id}`}>
                {p.photos[0]
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={p.photos[0]} alt={p.displayName} loading="lazy" />
                  : <div className="avatar" style={{ width: "100%", height: "100%", borderRadius: 0, fontSize: "4rem" }}>{initials(p.displayName)}</div>}
                {p.verified && <span className="status status--info verified">Verified</span>}
                <div className="mcard__b">
                  <b>{p.displayName}{age(m.birthDate) ? `, ${age(m.birthDate)}` : ""}</b>
                  <span>{[p.city, m.country].filter(Boolean).join(", ")}</span>
                  {ev && <div className="caps caps--aqua" style={{ marginTop: 6, fontSize: ".55rem" }}>Going · {getDestination(ev.destinationSlug)?.name}</div>}
                </div>
              </Link>
            );
          })}
        </div>
      ) : <p className="muted">No members match yet — new profiles are approved every day.</p>}
    </div>
  );
}
