import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ItinerarySticky from "@/components/ui/ItinerarySticky";
import HorizontalScroll from "@/components/home/HorizontalScroll";
import { EVENINGS, HIGHLIGHTS, ITINERARY } from "@/content/program";
import { CLIPS } from "@/content/media";

export const metadata: Metadata = { title: "The experience", description: "Seven days. Six nights. Unlimited possibilities. International competitions, glamorous receptions, Latin dance nights, water sports, excursions and the farewell celebration." };

export default function ExperiencePage() {
  return (
    <>
      <PageHero
        eyebrow="The Paradise Club experience · Seven days. Six nights."
        title={<>Unlimited <em className="chrome">possibilities</em></>}
        lead="From the moment you arrive, you enter a world designed around elegance, excitement, sophistication, and celebration."
        video={{ mixkit: CLIPS.pool, poster: "/media/club-rain.webp" }}
        crumbs={[{ href: "/experience", label: "Experience" }]}
      >
        <Link className="btn btn--chrome" href="/events" data-magnetic>Reserve your week</Link>
      </PageHero>
      <section className="section bg-glow">
        <div className="container grid-2" style={{ alignItems: "start" }}>
          <div>
            <span className="caps caps--aqua eyebrow" data-reveal>Every day, every evening</span>
            <p className="statement" style={{ marginTop: 24 }} data-fill>Every day offers adventure; every evening brings entertainment; and every encounter could be the beginning of something extraordinary.</p>
          </div>
          <div className="stack">
            <ul className="ticks" data-stagger>
              {HIGHLIGHTS.map((h) => <li key={h}>{h}</li>)}
            </ul>
            <p className="lead" data-reveal>Perhaps you will meet someone special beside the infinity pool, over an elegant beachfront dinner, or on a Caribbean sunset cruise. The pleasure of the experience is in the possibilities.</p>
          </div>
        </div>
      </section>
      <section className="section bg-navy">
        <div className="container">
          <span className="caps caps--aqua eyebrow" data-reveal>Seven days in paradise</span>
          <h2 className="h2" style={{ marginTop: 18, marginBottom: 46 }} data-split="words">Your <em className="chrome">week</em></h2>
          <ItinerarySticky days={ITINERARY} />
        </div>
      </section>
      <HorizontalScroll
        items={EVENINGS}
        head={
          <>
            <div><span className="caps caps--aqua">After dark</span><h2 className="h2" style={{ marginTop: 18 }}>Every evening, <em className="chrome">a celebration</em></h2></div>
            <p className="lead">From Latin dance nights under the stars to the signature Miss Paradise Contest and a spectacular farewell party.</p>
          </>
        }
      />
      <section className="section--tight bg-glow">
        <div className="container center stack">
          <h2 className="h2" data-split="words">Ready for <em className="chrome">your week?</em></h2>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }} data-reveal>
            <Link className="btn btn--chrome" href="/events">See the calendar</Link>
            <Link className="btn" href="/activities">Activities</Link>
          </div>
        </div>
      </section>
    </>
  );
}
