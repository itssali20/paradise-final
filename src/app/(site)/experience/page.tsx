import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ItinerarySticky from "@/components/ui/ItinerarySticky";
import HorizontalScroll from "@/components/home/HorizontalScroll";
import { EVENINGS, ITINERARY } from "@/content/program";
import { CLIPS } from "@/content/media";

export const metadata: Metadata = { title: "The experience", description: "Seven days and six nights: beach days, adventures, contests, themed nights and the farewell celebration." };

export default function ExperiencePage() {
  return (
    <>
      <PageHero
        eyebrow="Seven days · six nights"
        title={<>Unlimited <em className="chrome">memories</em></>}
        lead="Beach days, adventures, four competitions and a different celebration every night."
        video={{ mixkit: CLIPS.pool, poster: "/media/club-rain.webp" }}
        crumbs={[{ href: "/experience", label: "Experience" }]}
      >
        <Link className="btn btn--chrome" href="/events" data-magnetic>Reserve your week</Link>
      </PageHero>
      <section className="section bg-navy">
        <div className="container">
          <ItinerarySticky days={ITINERARY} />
        </div>
      </section>
      <HorizontalScroll
        items={EVENINGS}
        head={
          <>
            <div><span className="caps caps--aqua">After dark</span><h2 className="h2" style={{ marginTop: 18 }}>Every evening, <em className="chrome">a celebration</em></h2></div>
            <p className="lead">From tango under the stars to the crowning of Miss Paradise.</p>
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
