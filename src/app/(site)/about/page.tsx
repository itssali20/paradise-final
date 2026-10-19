import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import OptionsPinned from "@/components/ui/OptionsPinned";
import SafetyPrivacy from "@/components/ui/SafetyPrivacy";
import { img } from "@/content/media";

export const metadata: Metadata = { title: "About Paradise Club", description: "Why we created Paradise Club: because finding someone extraordinary should be an extraordinary experience." };

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Why we created Paradise Club"
        title={<>An extraordinary <em className="chrome">experience</em></>}
        lead="Because finding someone extraordinary should be an extraordinary experience."
        image="un:1780631742225-053ddbd9a9ca"
        crumbs={[{ href: "/about", label: "About" }]}
      />
      <section className="section bg-glow">
        <div className="container grid-2" style={{ alignItems: "start" }}>
          <div className="frame" style={{ position: "sticky", top: "12vh", height: "76vh", borderRadius: 28 }} data-reveal="clip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img("un:1777159295553-6e0fc30ca9bc", 1400)} alt="" data-parallax="6" loading="lazy" />
          </div>
          <div className="stack prose" style={{ maxWidth: "60ch" }}>
            <span className="caps caps--aqua eyebrow" data-reveal>Our story</span>
            <p className="lead" data-reveal>Imagine escaping to a breathtaking tropical paradise, surrounded by turquoise waters, pristine white-sand beaches, magnificent luxury resorts, and fascinating singles from around the world. Imagine seven unforgettable days of spectacular entertainment, exciting adventures, glamorous celebrations, and romantic evenings under the stars.</p>
            <p data-reveal>We created Paradise Club because successful, interesting, adventurous single people deserve something more exciting than traditional dating websites, ordinary singles cruises, or conventional resort vacations. <b style={{ color: "var(--ink)", fontWeight: 500 }}>They deserve an extraordinary experience.</b></p>
            <blockquote className="quote chrome" data-reveal>One magnificent resort. Exceptional company. Unlimited possibilities.</blockquote>
            <span className="caps caps--aqua eyebrow" style={{ marginTop: 20 }} data-reveal>More than a vacation</span>
            <p data-reveal>Paradise Club is envisioned as an international community of accomplished, adventurous single adults who appreciate luxury travel, exceptional entertainment, and meaningful connections. It brings together experiences that can otherwise be difficult to arrange within demanding professional schedules.</p>
            <p data-reveal>Instead of endless online messaging or traveling alone among strangers with different priorities, guests can join a carefully organized gathering in a remarkable destination. <b style={{ color: "var(--ink)", fontWeight: 500 }}>Instead of choosing between a luxury vacation and opportunities for romance, they can enjoy both.</b></p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }} data-reveal>
              <Link className="btn btn--chrome" href="/events">Upcoming events</Link>
              <Link className="btn" href="/membership">Become a member</Link>
            </div>
          </div>
        </div>
      </section>
      <OptionsPinned />
      <SafetyPrivacy />
    </>
  );
}
