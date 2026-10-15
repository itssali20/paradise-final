import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import CastingForm from "@/components/casting/CastingForm";
import Marquee from "@/components/motion/Marquee";
import { CASTING, CASTING_RULES, CASTING_STEPS, PHOTO_SETS } from "@/content/casting";
import { img } from "@/content/media";
import { getUpcomingEvents } from "@/lib/events";
import { castingCounts } from "@/lib/casting";
import { getDestination } from "@/content/destinations";
import { dateRange } from "@/lib/format";

export const metadata: Metadata = {
  title: "Paradise Casting · ladies apply, gentlemen vote",
  description: `Apply to join Paradise Club with nine photos. The club gentlemen vote and the ${CASTING.shortlist} ladies with the most votes are invited to paradise, free.`,
};
export const revalidate = 60;

/** Outline icons for the three outfits. */
const ICON: Record<string, string> = {
  dress: "M9 3h6l-1 4 4 13H6l4-13zM10 7h4",
  sport: "M4 15c3 0 4-2 5-5l2 1c1 .5 2 1 4 1h3a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM8 15v2M13 15v2",
  bikini: "M4 6c2 3 4 5 8 5s6-2 8-5M7 9.5 6 13M17 9.5l1 3.5M5 15c3 2 11 2 14 0l-2 4c-3 1-7 1-10 0z",
};

export default async function CastingPage() {
  const [events, counts] = await Promise.all([getUpcomingEvents(), castingCounts()]);
  const eventOptions = ["Any / next event", ...events.map((e) => `${getDestination(e.destinationSlug)?.name ?? e.title} · ${dateRange(e.startDate, e.endDate)}`)];
  const total = CASTING.perSet * PHOTO_SETS.length;

  return (
    <>
      <PageHero
        eyebrow="Paradise Casting"
        title={<>Chosen by <em className="chrome">the gentlemen</em></>}
        lead={`Thousands of ladies apply with ${total} photos. The club gentlemen vote. The ${CASTING.shortlist} with the most votes are invited to paradise, free.`}
        image="/media/club-rain.webp"
        className="phero--cast"
        crumbs={[{ href: "/ladies", label: "Ladies" }, { href: "/casting", label: "Casting" }]}
      >
        <Link className="btn btn--chrome" href="#apply" data-magnetic>Apply now</Link>
        <Link className="btn btn--ghost" href="/casting/vote">Gentlemen · vote</Link>
      </PageHero>

      {/* numbers */}
      <section className="section--tight bg-abyss">
        <div className="container cast-nums">
          <div data-reveal><b className="chrome-static" data-count={String(total)}>{total}</b><span>Photos per lady</span></div>
          <div data-reveal><b className="chrome-static" data-count={String(CASTING.shortlist)}>{CASTING.shortlist}</b><span>Shortlisted by votes</span></div>
          <div data-reveal><b className="chrome-static" data-count={String(CASTING.invited)}>{CASTING.invited}</b><span>Ladies travel each month</span></div>
          {counts.applied >= 50 && <div data-reveal><b className="chrome-static" data-count={String(counts.applied)}>{counts.applied}</b><span>Applications so far</span></div>}
        </div>
      </section>

      {/* three outfits */}
      <section className="section bg-glow">
        <div className="container">
          <div className="center stack-s" style={{ marginBottom: 56 }}>
            <span className="caps caps--aqua eyebrow" data-reveal>What to send</span>
            <h2 className="h2" data-split="words">Three looks, <em className="chrome">{total} photos</em></h2>
            <p className="lead" data-reveal>{CASTING.perSet} photos in each outfit so the gentlemen see your style, your energy and your beach look.</p>
          </div>
          <div className="cast-sets" data-stagger>
            {PHOTO_SETS.map((s, i) => (
              <div key={s.key} className="cast-set glass">
                <span className="cast-set__n">{String(i + 1).padStart(2, "0")}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICON[s.key]} /></svg>
                <h3 className="h3">{s.label}</h3>
                <p className="muted">{s.hint}</p>
                <div className="cast-set__dots" aria-label={`${CASTING.perSet} photos`}>{Array.from({ length: CASTING.perSet }).map((_, j) => <i key={j} />)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="split bg-navy">
        <div className="split__media"><div className="media">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={img("/media/comp-bikini.webp", 1200)} alt="" data-parallax="8" loading="lazy" /></div></div>
        <div className="split__txt">
          <span className="caps caps--aqua eyebrow" data-reveal>How it works</span>
          <h2 className="h2" style={{ marginTop: 18 }} data-split="words">From application <em className="chrome">to paradise</em></h2>
          <ol className="rows" style={{ marginTop: 30 }} data-stagger>
            {CASTING_STEPS.map((s, i) => (
              <li key={s.t}><b>{["I", "II", "III", "IV"][i]}</b><div><h3>{s.t}</h3><p>{s.p}</p></div></li>
            ))}
          </ol>
          <p className="fine" style={{ marginTop: 22 }}>Why {CASTING.shortlist}? Plans change. We shortlist {CASTING.shortlist - CASTING.invited} more ladies than places so every month welcomes a full {CASTING.invited}.</p>
        </div>
      </section>

      <div className="bg-abyss" style={{ paddingBlock: 30 }}>
        <Marquee className="marquee--type" speed={55}>
          {["Apply", "Get verified", "The gentlemen vote", `Top ${CASTING.shortlist} invited`, "Ladies travel free"].map((w) => <span key={w} className="chrome-static">{w}<span className="sep" /></span>)}
        </Marquee>
      </div>

      {/* apply */}
      <section className="section bg-glow" id="apply">
        <div className="container grid-2 cast-apply" style={{ alignItems: "start" }}>
          <div className="cast-apply__side">
            <span className="caps caps--aqua eyebrow" data-reveal>Ladies&apos; application</span>
            <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Apply to <em className="chrome">the casting</em></h2>
            <p className="lead" style={{ marginTop: 20 }} data-reveal>It takes about five minutes. Have your {total} photos ready on your phone: {PHOTO_SETS.map((s) => s.short.toLowerCase()).join(", ")}.</p>
            <ul className="cast-rules" data-stagger>
              {CASTING_RULES.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
          <div data-reveal>
            <CastingForm events={eventOptions} />
          </div>
        </div>
      </section>

      {/* gentlemen */}
      <section className="final cast-vote">
        <div className="media shade">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={img("/media/ev-nightclub.webp", 1800)} alt="" loading="lazy" /></div>
        <div className="final__c">
          <span className="caps caps--aqua">For the gentlemen</span>
          <h2 className="display chrome" data-split="chars">Your vote<br /><em>decides</em></h2>
          <p className="lead" style={{ color: "var(--ink)" }}>Club gentlemen privately vote for the ladies they would love to meet. You have {CASTING.voteLimit} hearts. The {CASTING.shortlist} most-voted ladies are invited.</p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="btn btn--chrome" href="/casting/vote" data-magnetic>Open the voting board</Link>
            <Link className="btn btn--ghost" href="/register">Create an account</Link>
          </div>
        </div>
      </section>
    </>
  );
}
