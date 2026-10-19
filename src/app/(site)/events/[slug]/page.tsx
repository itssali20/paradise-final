import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import { getEventBySlug } from "@/lib/events";
import { getDestination } from "@/content/destinations";
import { ITINERARY } from "@/content/program";
import { dateRange, money } from "@/lib/format";
import { buildSchedule } from "@/lib/pricing";
import { img } from "@/content/media";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await getEventBySlug((await params).slug);
  if (!e) return { title: "Event" };
  const d = getDestination(e.destinationSlug);
  return { title: `${d?.name ?? e.title} · ${dateRange(e.startDate, e.endDate)}`, description: `Seven days and six nights at a private beachfront resort in ${d?.name}. Rooms from ${money(e.fromCents, e.currency)}.`, openGraph: { images: [img(e.heroImage || d?.image, 1200)] } };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const e = await getEventBySlug((await params).slug);
  if (!e) notFound();
  const d = getDestination(e.destinationSlug);
  const example = e.roomTypes[0] ? buildSchedule({ totalCents: e.roomTypes[0].priceCents, event: e, plan: "DEPOSIT" }) : [];
  const closed = e.status !== "PUBLISHED";

  return (
    <>
      <PageHero
        eyebrow={`${dateRange(e.startDate, e.endDate)} · 7 days / 6 nights`}
        title={<>{d?.name.split(" · ")[0] ?? e.title} <em className="chrome">paradise</em></>}
        lead={d?.tagline}
        image={e.heroImage || d?.image}
        crumbs={[{ href: "/events", label: "Events" }, { href: `/events/${e.slug}`, label: d?.name ?? e.title }]}
      >
        <Link className="btn btn--chrome" href={`/book/${e.slug}`} data-magnetic>{closed ? "Join the waitlist" : "Reserve your room"}</Link>
        <Link className="btn btn--ghost" href="/ladies#apply">Ladies · apply to attend</Link>
      </PageHero>

      <section className="bg-navy">
        <div className="container">
          <div className="facts" data-stagger>
            <div><span className="caps caps--dim">Dates</span><b>{dateRange(e.startDate, e.endDate)}</b></div>
            <div><span className="caps caps--dim">Location</span><b>{e.location}</b></div>
            <div><span className="caps caps--dim">Rooms from</span><b className="chrome-static">{money(e.fromCents, e.currency)}</b></div>
            <div><span className="caps caps--dim">Gentlemen places</span><b>{e.menLeft} of {e.menCapacity}</b></div>
            <div><span className="caps caps--dim">Ladies places</span><b>{e.womenLeft} of {e.womenCapacity}</b></div>
          </div>
        </div>
      </section>

      <section className="section bg-navy" id="rooms">
        <div className="container">
          <div className="grid-2" style={{ alignItems: "end" }}>
            <div>
              <span className="caps caps--aqua eyebrow" data-reveal>Rooms & villas</span>
              <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Choose your <em className="chrome">room</em></h2>
            </div>
            <div className="stack-s" data-reveal>
              <p className="lead">{e.resortName}. {e.resortSummary}</p>
              <p className="fine">Prices are per package for seven days / six nights. Bringing a guest you met online? Add her at the guest rate shown.</p>
            </div>
          </div>
          <div className="rooms-grid">
            {e.roomTypes.map((r) => {
              const out = r.available <= 0 || closed;
              return (
                <article key={r.id} className={`rcard${out ? " is-soldout" : ""}`} data-reveal>
                  <div className="rcard__img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img(r.image, 1200)} alt={r.name} loading="lazy" />
                    <span className={`rcard__tag ${r.available <= 5 ? "chip chip--hot" : "chip"}`} style={{ background: "rgba(3,6,11,.5)", backdropFilter: "blur(6px)" }}>
                      {r.available <= 0 ? "Sold out" : `${r.available} left`}
                    </span>
                  </div>
                  <div className="rcard__b">
                    <span className="caps caps--aqua">Tier {r.tier}</span>
                    <h3>{r.name}</h3>
                    <p className="muted">{r.description}</p>
                    <ul>{r.features.map((f) => <li key={f}>{f}</li>)}</ul>
                    <div className="rcard__price">
                      <div>
                        <span className="caps caps--dim">Gentleman</span>
                        <b className="chrome-static" style={{ display: "block" }}>{money(r.priceCents, e.currency)}</b>
                        {r.companionCents > 0 && <span className="fine">+ {money(r.companionCents, e.currency)} with a guest</span>}
                      </div>
                      {out ? (
                        <span className="btn btn--sm is-disabled">Unavailable</span>
                      ) : (
                        <Link className="btn btn--aqua btn--sm" href={`/book/${e.slug}?room=${r.id}`}>Select</Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section--tight bg-abyss">
        <div className="container grid-2">
          <div>
            <span className="caps caps--aqua eyebrow" data-reveal>How payment works</span>
            <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Pay in full, <em className="chrome">or by deposit</em></h2>
            <p className="lead" style={{ marginTop: 20 }} data-reveal>
              Reserve today with a {e.depositType === "PERCENT" ? `${e.depositValue}%` : money(e.depositValue, e.currency)} deposit and the balance is collected automatically in {e.installments} instalment{e.installments > 1 ? "s" : ""}, with the final payment due {e.balanceDueDays} days before arrival. Or pay everything at once.
            </p>
            <p className="fine" style={{ marginTop: 16 }} data-reveal>Cancellation terms are shown before you pay. See <Link href="/legal/cancellation" className="link-line">cancellation & refunds</Link>.</p>
          </div>
          {example.length > 0 && (
            <div className="panel" data-reveal>
              <span className="caps caps--dim">Example · {e.roomTypes[0].name}</span>
              <div className="ptl">
                {example.map((p, i) => (
                  <div key={i} className={i === 0 ? "is-paid" : ""}>
                    <b>{money(p.amountCents, e.currency)}</b>
                    <span>{i === 0 ? "Today · deposit" : new Date(p.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section bg-navy">
        <div className="container grid-2">
          <div>
            <span className="caps caps--aqua eyebrow" data-reveal>Your week</span>
            <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Seven days, <em className="chrome">six nights</em></h2>
            {d && <p className="lead" style={{ marginTop: 20 }} data-reveal>{d.story}</p>}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }} data-reveal>
              {d?.highlights.map((h) => <span className="chip" key={h}>{h}</span>)}
            </div>
            <div style={{ marginTop: 34, display: "flex", gap: 12, flexWrap: "wrap" }} data-reveal>
              <Link className="btn btn--chrome" href={`/book/${e.slug}`}>Reserve now</Link>
              {d && <Link className="btn" href={`/destinations/${d.slug}`}>About {d.name.split(" · ")[0]}</Link>}
            </div>
          </div>
          <ol className="rows" data-stagger>
            {ITINERARY.map((x) => <li key={x.day}><b>{x.day}</b><div><h3>{x.title}</h3><p>{x.text}</p></div></li>)}
          </ol>
        </div>
      </section>
    </>
  );
}
