import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import OptionsPinned from "@/components/ui/OptionsPinned";
import { img } from "@/content/media";

export const metadata: Metadata = { title: "About Elite Vacations", description: "Why we created Paradise Club Elite Vacations: meet in person, in paradise." };

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Why Elite Vacations"
        title={<>Meet in person, <em className="chrome">in paradise</em></>}
        image="un:1780631742225-053ddbd9a9ca"
        crumbs={[{ href: "/about", label: "About" }]}
      />
      <OptionsPinned />
      <section className="section bg-glow">
        <div className="container grid-2" style={{ alignItems: "start" }}>
          <div className="frame" style={{ position: "sticky", top: "12vh", height: "76vh", borderRadius: 28 }} data-reveal="clip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img("un:1777159295553-6e0fc30ca9bc", 1400)} alt="" data-parallax="6" loading="lazy" />
          </div>
          <div className="stack prose" style={{ maxWidth: "60ch" }}>
            <span className="caps caps--aqua eyebrow" data-reveal>Our story</span>
            <p className="lead" data-reveal>We created Elite Vacations to give singles around the world an amazing and unique opportunity: to meet each other at elegant, fun vacations at the world&apos;s best luxury resorts — <b style={{ color: "var(--ink)", fontWeight: 500 }}>and not get lost in the crowd of newlyweds, couples and families.</b></p>
            <p data-reveal>Several clubs and hotels cater to singles, and they are always in the same location. We seek beautiful four- and five-star beachfront properties and arrange exclusive use for our guests wherever the hotel agreement allows: astonishing settings, amazing service and amazing food, dedicated to Paradise Club.</p>
            <blockquote className="quote chrome" data-reveal>Instead of spending months on dating websites without results, meet in person.</blockquote>
            <p data-reveal>Great events and activities, each other&apos;s company and the spectacular settings of tropical islands and exciting countries. You may find someone to share a wonderful, romantic vacation with — or even your soulmate. Either way, Paradise Club gives you a vacation that is truly unforgettable.</p>
            <p data-reveal><b style={{ color: "var(--ink)", fontWeight: 500 }}>Join us in Paradise…</b></p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }} data-reveal>
              <Link className="btn btn--chrome" href="/events">Upcoming events</Link>
              <Link className="btn" href="/membership">Membership</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="section--tight bg-abyss">
        <div className="container">
          <span className="caps caps--aqua eyebrow" data-reveal>Your safety</span>
          <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Feel secure about <em className="chrome">the people you meet</em></h2>
          <div className="trio" data-stagger>
            <div><b className="chrome-static">I</b><h3>Verified guests</h3><p>Coordinators meet applicants and verify identity and age before invitations are confirmed.</p></div>
            <div><b className="chrome-static">II</b><h3>Dedicated security</h3><p>Professional event security works alongside the hotel&apos;s own team.</p></div>
            <div><b className="chrome-static">III</b><h3>Consent first</h3><p>Messaging only opens when both members agree. Report or block anyone, any time.</p></div>
          </div>
        </div>
      </section>
    </>
  );
}
