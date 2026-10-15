import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import { img } from "@/content/media";

export const metadata: Metadata = { title: "Paradise Villa", description: "A grandiose private villa at the resort: the high life of Paradise by day, your own mansion by night." };

export default function VillasPage() {
  return (
    <>
      <PageHero
        eyebrow="Package III · Very limited"
        title={<>The high life by day. <em className="chrome">A mansion by night.</em></>}
        image="un:1596178067639-5c6e68aea6dc"
        crumbs={[{ href: "/rooms", label: "Rooms" }, { href: "/villas", label: "Paradise Villa" }]}
      >
        <Link className="btn btn--chrome" href="/events" data-magnetic>Check villa availability</Link>
      </PageHero>
      <section className="split bg-navy">
        <div className="split__media"><div className="media">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={img("un:1543489822-c49534f3271f", 1600)} alt="Infinity pool over a bay" data-parallax="8" loading="lazy" /></div></div>
        <div className="split__txt">
          <span className="caps caps--aqua eyebrow" data-reveal>Paradise Villa</span>
          <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Your <em className="chrome">private getaway</em></h2>
          <hr className="rule" />
          <p className="lead" data-reveal>Paradise Villa is a highly exclusive villa for the gentleman who wants the whirlwind of Paradise by day and a beautiful, grandiose private mansion to come home to at night.</p>
          <ul className="ticks" style={{ marginTop: 26 }} data-stagger>
            <li>All the perks of Paradise Club, every event</li>
            <li>Private pool and terrace</li>
            <li>Butler service and in-villa dining</li>
            <li>VIP table at every show and competition</li>
            <li>Only a handful per resort</li>
          </ul>
          <div style={{ marginTop: 30 }} data-reveal><Link className="btn btn--chrome" href="/events">Reserve a villa</Link></div>
        </div>
      </section>
      <section className="section--tight bg-abyss">
        <div className="container cards-3">
          {["un:1780631742225-053ddbd9a9ca", "un:1779942578833-5f00dc79d6d1", "un:1772308113209-cf25636ddfd5"].map((g, i) => (
            <div key={g} className="frame hover-zoom" style={{ aspectRatio: "4/5", borderRadius: 24, marginTop: i === 1 ? 60 : 0 }} data-reveal="clip">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(g, 900)} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
