import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import { img } from "@/content/media";

export const metadata: Metadata = { title: "Paradise Villas", description: "Your private luxury retreat: exclusive private villas at select Paradise Club events." };

export default function VillasPage() {
  return (
    <>
      <PageHero
        eyebrow="Paradise Villas · select events"
        title={<>Your private <em className="chrome">luxury retreat</em></>}
        lead="For gentlemen seeking additional privacy, select events may feature exclusive private villas."
        image="un:1596178067639-5c6e68aea6dc"
        crumbs={[{ href: "/rooms", label: "Rooms" }, { href: "/villas", label: "Paradise Villas" }]}
      >
        <Link className="btn btn--chrome" href="/events" data-magnetic>Check villa availability</Link>
      </PageHero>
      <section className="split bg-navy">
        <div className="split__media"><div className="media">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={img("un:1543489822-c49534f3271f", 1600)} alt="Infinity pool over a bay" data-parallax="8" loading="lazy" /></div></div>
        <div className="split__txt">
          <span className="caps caps--aqua eyebrow" data-reveal>Paradise Villas</span>
          <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Imagine <em className="chrome">your own residence</em></h2>
          <hr className="rule" />
          <p className="lead" data-reveal>Imagine spacious living areas, elegant bedrooms, tropical gardens, ocean views, and private swimming pools at participating properties. Villa guests can enjoy eligible Paradise Club activities and celebrations while returning to the independence and comfort of their own luxury residence.</p>
          <ul className="ticks" style={{ marginTop: 26 }} data-stagger>
            <li>Spacious living areas and elegant bedrooms</li>
            <li>Tropical gardens and ocean views</li>
            <li>Private swimming pools at participating properties</li>
            <li>Eligible Paradise Club activities and celebrations</li>
          </ul>
          <p className="fine" style={{ marginTop: 18 }} data-reveal>Amenities, inventory, access, and separate pricing will vary by destination.</p>
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
