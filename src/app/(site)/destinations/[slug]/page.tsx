import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import { DESTINATIONS, getDestination } from "@/content/destinations";
import { getUpcomingEvents } from "@/lib/events";
import { dateRange, money } from "@/lib/format";
import { img } from "@/content/media";

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = getDestination((await params).slug);
  return d ? { title: d.name, description: d.story, openGraph: { images: [img(d.image, 1200)] } } : { title: "Destination" };
}

export const revalidate = 60;

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const d = getDestination((await params).slug);
  if (!d) notFound();
  const events = (await getUpcomingEvents()).filter((e) => e.destinationSlug === d.slug);
  const i = DESTINATIONS.indexOf(d);
  const others = [1, 2, 3].map((k) => DESTINATIONS[(i + k) % DESTINATIONS.length]);

  return (
    <>
      <PageHero
        eyebrow={`${d.area} · ${d.region}`}
        title={<>{d.name.split(" · ")[0]}</>}
        lead={d.tagline}
        image={d.image}
        crumbs={[{ href: "/destinations", label: "Destinations" }, { href: `/destinations/${d.slug}`, label: d.name }]}
      >
        {events[0] ? (
          <Link className="btn btn--chrome" href={`/events/${events[0].slug}`} data-magnetic>Reserve · {dateRange(events[0].startDate, events[0].endDate)}</Link>
        ) : (
          <Link className="btn btn--chrome" href="/events">See all upcoming events</Link>
        )}
      </PageHero>

      <section className="section bg-glow">
        <div className="container grid-2">
          <div>
            <span className="caps caps--aqua eyebrow" data-reveal>Why we go</span>
            <p className="statement" style={{ marginTop: 24 }} data-fill>{d.story}</p>
          </div>
          <div className="stack" style={{ alignSelf: "end" }}>
            <ul className="ticks" data-stagger>
              {d.highlights.map((h) => <li key={h}>{h}</li>)}
              <li>Seven days, six nights · international singles</li>
              <li>Competitions, Latin dance nights and themed celebrations</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-navy" style={{ paddingBottom: "clamp(90px,10vw,150px)" }}>
        <div className="container cards-3">
          {d.gallery.map((g, k) => (
            <div key={g} className="frame hover-zoom ripple-hover" style={{ aspectRatio: k === 1 ? "3/4" : "4/5", borderRadius: 24, marginTop: k === 1 ? 60 : 0 }} data-reveal="clip">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(g, 1000)} alt={`${d.name} experience`} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      <section className="section--tight bg-abyss">
        <div className="container">
          <span className="caps caps--aqua eyebrow" data-reveal>Upcoming in {d.name.split(" · ")[0]}</span>
          {events.length ? (
            <div style={{ display: "grid", gap: 14, marginTop: 30 }}>
              {events.map((e) => (
                <Link key={e.slug} href={`/events/${e.slug}`} className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap", textDecoration: "none" }} data-reveal>
                  <div>
                    <h3 className="h3">{dateRange(e.startDate, e.endDate)}</h3>
                    <p className="muted">{e.resortName}</p>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="chip">From {money(e.fromCents, e.currency)}</span>
                    <span className="btn btn--aqua btn--sm">Choose room</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="panel" style={{ marginTop: 30 }} data-reveal>
              <h3 className="h3">{d.name.split(" · ")[0]} is on our list.</h3>
              <p className="muted" style={{ marginTop: 10 }}>Dates for this destination haven&apos;t been announced yet. Register your interest and you&apos;ll hear first.</p>
              <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link className="btn btn--chrome btn--sm" href={`/contact?type=general&destination=${d.slug}`}>Register interest</Link>
                <Link className="btn btn--sm" href="/events">Other months</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section bg-navy">
        <div className="container">
          <span className="caps caps--aqua eyebrow" data-reveal>Keep exploring</span>
          <div className="cards-3" style={{ marginTop: 34 }}>
            {others.map((o) => (
              <Link key={o.slug} href={`/destinations/${o.slug}`} className="card card--over ripple-hover" data-reveal data-cursor="Explore">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="card__img"><img src={img(o.image, 900)} alt={o.name} loading="lazy" /></div>
                <div className="card__b"><span className="caps caps--aqua">{o.area}</span><h3>{o.name}</h3></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
