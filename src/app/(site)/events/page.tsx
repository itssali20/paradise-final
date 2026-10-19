import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import EventStrip from "@/components/home/EventStrip";
import { getUpcomingEvents } from "@/lib/events";
import { toStrip } from "@/lib/view";
import { getDestination } from "@/content/destinations";
import { dateRange, money, monthTag } from "@/lib/format";
import { img, CLIPS } from "@/content/media";

export const metadata: Metadata = {
  title: "Upcoming events",
  description: "Upcoming Paradise Club gatherings at exclusive luxury resorts. Choose your month, choose your room and reserve with a deposit.",
};
export const revalidate = 60;

export default async function EventsPage() {
  const events = await getUpcomingEvents();
  return (
    <>
      <PageHero
        eyebrow="Upcoming Paradise Club gatherings"
        title={<>Choose your <em className="chrome">month</em></>}
        lead="Seven days and six nights at a four- or five-star luxury resort, with approximately 100 gentlemen and 100 ladies from around the world."
        video={{ mixkit: CLIPS.turquoise, poster: "/media/dest-bahamas.webp" }}
        crumbs={[{ href: "/events", label: "Events" }]}
      >
        <span className="chip chip--aqua"><span className="dot" />Reservations open</span>
        <span className="chip">Pay in full or by deposit</span>
        <span className="chip">Ladies by invitation</span>
      </PageHero>

      <EventStrip events={toStrip(events)} title={false} />

      <section className="section bg-glow" style={{ paddingTop: 40 }}>
        <div className="container">
          <span className="caps caps--aqua eyebrow" data-reveal>The calendar</span>
          <h2 className="h2" style={{ marginTop: 18, marginBottom: 50 }} data-split="words">The upcoming <em className="chrome">calendar</em></h2>
          <div style={{ display: "grid", gap: 18 }}>
            {events.map((e, i) => {
              const d = getDestination(e.destinationSlug);
              const m = monthTag(e.startDate);
              const left = e.roomTypes.reduce((a, r) => a + r.available, 0);
              const total = e.roomTypes.reduce((a, r) => a + r.inventory, 0);
              return (
                <Link key={e.slug} href={`/events/${e.slug}`} className="card ripple-hover" data-reveal style={{ display: "grid", gridTemplateColumns: i % 2 ? "1fr 1.2fr" : "1.2fr 1fr" }} data-cursor="Book">
                  <div className="card__img" style={{ aspectRatio: "auto", minHeight: 320, order: i % 2 ? 2 : 1 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img(e.heroImage || d?.image, 1400)} alt={d?.name ?? e.title} loading="lazy" />
                  </div>
                  <div className="card__b" style={{ order: i % 2 ? 1 : 2, alignContent: "center", padding: "clamp(24px,4vw,56px)" }}>
                    <span className="caps caps--aqua">{m.month} {m.year} · {dateRange(e.startDate, e.endDate)}</span>
                    <h3 style={{ fontSize: "clamp(2.4rem,4.6vw,4.4rem)" }}>{d?.name ?? e.title}</h3>
                    <p>{e.location} · {e.resortName}</p>
                    <div className="avail" style={{ marginTop: 8 }}><i style={{ width: `${Math.max(6, Math.round(((total - left) / Math.max(total, 1)) * 100))}%` }} /></div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 6 }}>
                      <span className="chip">From {money(e.fromCents, e.currency)}</span>
                      <span className={left < 15 ? "chip chip--hot" : "chip"}>{left} of {total} rooms left</span>
                      {e.status === "SOLD_OUT" && <span className="chip chip--hot">Sold out · waitlist</span>}
                    </div>
                    <span className="arrow-link caps" style={{ marginTop: 14 }}>Choose your room <i /></span>
                  </div>
                </Link>
              );
            })}
            {!events.length && <p className="lead">New dates are being finalised. Leave your email below and we&apos;ll announce the next resort to you first.</p>}
          </div>
        </div>
      </section>
    </>
  );
}
