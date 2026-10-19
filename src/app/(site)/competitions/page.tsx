import Link from "next/link";
import type { Metadata } from "next";
import Spotlight from "@/components/ui/Spotlight";
import Video from "@/components/ui/Video";
import ApplicationForm from "@/components/forms/ApplicationForm";
import { COMPETITIONS, ITINERARY } from "@/content/program";
import { CLIPS, img } from "@/content/media";

export const metadata: Metadata = { title: "Competitions", description: "Four spectacular international competitions: Miss Paradise Contest, Paradise Bikini Contest, Paradise Lingerie Fashion Contest and International Talent Competition — a proposed $10,000 grand prize each." };

export default function CompetitionsPage() {
  return (
    <>
      <section className="comps screen" style={{ display: "grid", alignItems: "center" }}>
        <div className="media"><Video mixkit={CLIPS.stage} poster="/media/ev-miss-paradise.webp" eager /></div>
        <Spotlight />
        <div className="comps__c" style={{ paddingTop: 160 }}>
          <nav className="crumbs" style={{ justifyContent: "center" }} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Competitions</span></nav>
          <span className="caps caps--aqua">Four spectacular international competitions</span>
          <h1 className="prize chrome" data-count="40000" data-prefix="$">$40,000</h1>
          <p className="lead" style={{ margin: "0 auto", color: "var(--ink)" }}>in proposed competition prizes. Paradise Club events are envisioned to include competitions celebrating beauty, confidence, elegance, creativity, and extraordinary talent.</p>
          <div className="comps__foot">
            <Link className="btn btn--chrome" href="#enter" data-magnetic>Enter a competition</Link>
            <Link className="btn btn--ghost" href="/contact?type=sponsor">Sponsor a stage</Link>
          </div>
        </div>
      </section>

      <section className="section bg-navy">
        <div className="container">
          <div className="cards-4">
            {COMPETITIONS.map((c) => (
              <Link className="comp" key={c.slug} href={`/competitions/${c.slug}`} data-reveal data-cursor="Rules">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(c.image, 900)} alt={c.name} loading="lazy" />
                <div className="comp__b">
                  <span className="caps caps--aqua">Proposed {c.prize} · {c.night}</span>
                  <h3>{c.name}</h3>
                  <p>{c.short}</p>
                </div>
              </Link>
            ))}
          </div>
          <p className="fine" style={{ marginTop: 26 }} data-reveal>Prizes, funding, eligibility, judging, age requirements, and official rules must be finalized before any competition is confirmed.</p>
        </div>
      </section>

      <section className="section--tight bg-abyss">
        <div className="container grid-2">
          <div>
            <span className="caps caps--aqua eyebrow" data-reveal>When it happens</span>
            <h2 className="h2" style={{ marginTop: 18 }} data-split="words">The <em className="chrome">contest week</em></h2>
            <p className="lead" style={{ marginTop: 20 }} data-reveal>An illustrative week: arrival and adventure first, then fashion and glamour, Miss Paradise, talent and celebration. Actual programming depends on the destination and finalized rules.</p>
          </div>
          <ol className="rows" data-stagger>
            {ITINERARY.slice(2, 6).map((x) => <li key={x.day}><b>{x.day}</b><div><h3>{x.title}</h3><p>{x.text}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className="section bg-glow" id="enter">
        <div className="container grid-2" style={{ alignItems: "start" }}>
          <div>
            <span className="caps caps--aqua eyebrow" data-reveal>Competition registration</span>
            <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Take <em className="chrome">the stage</em></h2>
            <p className="lead" style={{ marginTop: 20 }} data-reveal>There is no entry fee. Official rules, eligibility, judging criteria and age requirements are provided to every entrant before the event. Participation in a contest is always voluntary.</p>
            <p className="fine" style={{ marginTop: 14 }} data-reveal>Read the <Link href="/legal/contest-rules" className="link-line">contest rules</Link>.</p>
          </div>
          <div data-reveal>
            <ApplicationForm
              type="COMPETITION"
              adult
              submit="Enter the competition"
              fields={[
                { name: "competition", label: "Competition", type: "select", options: COMPETITIONS.map((c) => c.name), required: true, full: true },
                { name: "social", label: "Instagram / portfolio", type: "url", placeholder: "https://", full: true },
                { name: "about", label: "Your experience & talent", type: "textarea" },
                { name: "files", label: "Photos or performance video", type: "file", multiple: true, accept: "image/*,video/mp4,video/quicktime" },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
