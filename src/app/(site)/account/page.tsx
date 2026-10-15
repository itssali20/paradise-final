import Link from "next/link";
import { desc, eq, inArray, and } from "drizzle-orm";
import { db, s } from "@/db";
import { requireUser } from "@/lib/auth";
import { getUpcomingEvents } from "@/lib/events";
import { getDestination } from "@/content/destinations";
import { dateRange, money } from "@/lib/format";
import { bookingTone, label } from "@/lib/status";
import { img } from "@/content/media";

export default async function AccountHome() {
  const u = await requireUser();
  const [bookings, profile, apps, events] = await Promise.all([
    db.query.bookings.findMany({ where: and(eq(s.bookings.userId, u.id), inArray(s.bookings.status, ["DEPOSIT_PAID", "PAID", "HOLD", "PENDING_PAYMENT"])), with: { event: true, roomType: true, payments: true }, orderBy: [desc(s.bookings.createdAt)] }),
    db.query.profiles.findFirst({ where: eq(s.profiles.userId, u.id) }),
    db.select().from(s.applications).where(eq(s.applications.userId, u.id)).orderBy(desc(s.applications.createdAt)).limit(5),
    getUpcomingEvents(),
  ]);
  const next = bookings.find((b) => b.status === "DEPOSIT_PAID" || b.status === "PAID");
  const nextDue = next?.payments.filter((p) => p.status === "SCHEDULED" || p.status === "FAILED").sort((a, b) => +a.dueDate - +b.dueDate)[0];

  return (
    <div className="stack">
      <div>
        <span className="caps caps--dim">Welcome back</span>
        <h1 className="h2" style={{ marginTop: 10 }}>Hello, <em className="chrome">{u.name.split(" ")[0]}</em></h1>
      </div>

      {next ? (
        <Link href={`/account/bookings/${next.id}`} className="card" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.3fr)" }}>
          <div className="card__img" style={{ aspectRatio: "auto", minHeight: 220 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(next.event.heroImage || getDestination(next.event.destinationSlug)?.image, 900)} alt="" />
          </div>
          <div className="card__b" style={{ alignContent: "center" }}>
            <span className="caps caps--aqua">Your next paradise · {next.ref}</span>
            <h3>{getDestination(next.event.destinationSlug)?.name}</h3>
            <p>{dateRange(next.event.startDate, next.event.endDate)} · {next.roomType.name}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span className={`status status--${bookingTone(next.status)}`}>{label(next.status)}</span>
              <span className="chip">Paid {money(next.paidCents, next.currency)} of {money(next.totalCents, next.currency)}</span>
              {nextDue && <span className="chip chip--aqua">Next: {money(nextDue.amountCents, next.currency)} · {nextDue.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
            </div>
          </div>
        </Link>
      ) : (
        <div className="panel">
          <h2>Choose your month</h2>
          <p className="muted" style={{ marginTop: 8 }}>You don&apos;t have a reservation yet. {events[0] && `The next paradise is ${getDestination(events[0].destinationSlug)?.name}, ${dateRange(events[0].startDate, events[0].endDate)}.`}</p>
          <Link className="btn btn--chrome btn--sm" href="/events" style={{ marginTop: 16 }}>See upcoming events</Link>
        </div>
      )}

      <div className="cards-3">
        <div className="panel">
          <span className="caps caps--dim">Profile</span>
          <h2 style={{ marginTop: 8 }}>{profile?.status === "APPROVED" ? "Live" : profile?.status === "REJECTED" ? "Needs changes" : "In review"}</h2>
          <p className="muted" style={{ marginTop: 6 }}>{profile?.photos.length ? `${profile.photos.length} photo(s)` : "Add photos so members can discover you."}</p>
          <Link className="mini-btn" href="/account/profile" style={{ marginTop: 14 }}>Edit profile</Link>
        </div>
        <div className="panel">
          <span className="caps caps--dim">Members</span>
          <h2 style={{ marginTop: 8 }}>Meet before you travel</h2>
          <p className="muted" style={{ marginTop: 6 }}>Browse approved members and request introductions.</p>
          <Link className="mini-btn" href="/account/members" style={{ marginTop: 14 }}>Browse members</Link>
        </div>
        <div className="panel">
          <span className="caps caps--dim">Applications</span>
          <h2 style={{ marginTop: 8 }}>{apps.length || "None"}</h2>
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {apps.map((a) => <span key={a.id} className="muted" style={{ fontSize: ".9rem" }}>{label(a.type)} · <span className={`status status--${a.status === "APPROVED" ? "ok" : a.status === "REJECTED" ? "bad" : "info"}`}>{label(a.status)}</span></span>)}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            <Link className="mini-btn" href="/ladies#apply">Ladies</Link>
            <Link className="mini-btn" href="/competitions#enter">Competitions</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
