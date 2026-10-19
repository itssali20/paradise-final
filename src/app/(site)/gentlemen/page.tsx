import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import SafetyPrivacy from "@/components/ui/SafetyPrivacy";
import { PACKAGES } from "@/content/program";
import { CLIPS, img } from "@/content/media";
import Video from "@/components/ui/Video";

export const metadata: Metadata = { title: "For gentlemen", description: "An exclusive experience for gentlemen: premium luxury vacation packages, face-to-face introductions and shared adventures in a spectacular international setting." };

export default function GentlemenPage() {
  return (
    <>
      <PageHero
        eyebrow="An exclusive experience for gentlemen"
        title={<>Because your time <em className="chrome">is valuable</em></>}
        lead="— and your experiences should be extraordinary. Paradise Club is designed for accomplished gentlemen who appreciate luxury travel, meaningful social opportunities, and the finest experiences."
        image="un:1520115736066-2190b58a4b9e"
        crumbs={[{ href: "/gentlemen", label: "Gentlemen" }]}
      >
        <Link className="btn btn--chrome" href="/events" data-magnetic>Choose your month</Link>
      </PageHero>

      <section className="split bg-navy">
        <div className="split__media"><div className="media"><Video mixkit={CLIPS.couple} poster={img("un:1507525428034-b723cf961d3e", 1600)} /></div></div>
        <div className="split__txt">
          <span className="caps caps--aqua eyebrow" data-reveal>Face to face</span>
          <p className="statement" style={{ marginTop: 24, fontSize: "clamp(1.6rem,2.8vw,2.6rem)" }} data-fill>
            Professional success does not always make finding a compatible romantic partner easy. Traditional dating platforms can demand months of messaging without a real meeting.
          </p>
          <p className="lead" style={{ marginTop: 24 }} data-reveal><b style={{ color: "var(--ink)", fontWeight: 500 }}>Instead, imagine</b> seven days of genuine face-to-face introductions, elegant dinners, shared adventures, dancing, and spontaneous conversation in a spectacular international setting.</p>
          <blockquote className="quote chrome" data-reveal>Photographs cannot replace a smile. Messages cannot replace chemistry.</blockquote>
        </div>
      </section>

      <section className="section--tight bg-abyss">
        <div className="container grid-2">
          <div>
            <span className="caps caps--aqua eyebrow" data-reveal>Clear and transparent</span>
            <h2 className="h2" style={{ marginTop: 18 }} data-split="words">What gentlemen <em className="chrome">are paying for</em></h2>
          </div>
          <div className="stack" data-reveal>
            <p className="lead">Participating gentlemen purchase premium vacation packages supporting the resort experience, hospitality, private events, entertainment, and selected complimentary invitations. The value is a curated luxury vacation and opportunities to meet other eligible adults — <b style={{ color: "var(--ink)", fontWeight: 500 }}>not the purchase of anyone&apos;s attention, companionship, or affection.</b></p>
            <p>Every connection is based on mutual interest, respect, and personal choice. Whether romance develops or not, the experience is intended to be memorable in its own right.</p>
          </div>
        </div>
      </section>

      <section className="section bg-glow">
        <div className="container">
          <span className="caps caps--aqua eyebrow" data-reveal>Premium luxury vacation packages</span>
          <h2 className="h2" style={{ marginTop: 18, marginBottom: 46 }} data-split="words">Three ways <em className="chrome">to arrive</em></h2>
          <div className="cards-3">
            {PACKAGES.map((p) => (
              <article className="card" key={p.name} data-reveal>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="card__img"><img src={img(p.image, 900)} alt="" loading="lazy" /></div>
                <div className="card__b">
                  <span className="caps caps--aqua">Package {p.n}</span>
                  <h3>{p.name}</h3>
                  <ul className="ticks">{p.points.map((x) => <li key={x} className="muted">{x}</li>)}</ul>
                  <Link className="btn btn--sm" href={p.href} style={{ justifySelf: "start", marginTop: 10 }}>{p.cta}</Link>
                </div>
              </article>
            ))}
          </div>
          <p className="fine" style={{ marginTop: 22 }} data-reveal>Already talking with someone overseas? <Link className="link-line" href="/membership">Meet before you travel</Link> — the Gentleman &amp; Guest package helps turn an online introduction into a real-world meeting.</p>
        </div>
      </section>

      <SafetyPrivacy />
    </>
  );
}
