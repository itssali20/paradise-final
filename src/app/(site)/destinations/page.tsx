import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import DestinationGrid from "@/components/ui/DestinationGrid";
import Marquee from "@/components/motion/Marquee";
import { DESTINATIONS } from "@/content/destinations";

export const metadata: Metadata = {
  title: "Destinations",
  description: "The Caribbean, the Mediterranean and the islands of the Indian Ocean and Pacific — Paradise Club's luxury singles destinations.",
};

export default function DestinationsPage() {
  return (
    <>
      <PageHero
        eyebrow="22 destinations · 3 oceans"
        title={<>The world is <em className="chrome">your paradise</em></>}
        lead="Every month a different four- or five-star beachfront resort, reserved for Paradise Club guests."
        image="/media/dest-greek-islands.webp"
        crumbs={[{ href: "/destinations", label: "Destinations" }]}
      />
      <div className="bg-abyss" style={{ paddingBlock: 20 }}>
        <Marquee className="marquee--type" speed={60}>
          {DESTINATIONS.map((d) => (
            <span key={d.slug} className="chrome-static">{d.name.split(" · ")[0]}<span className="sep" /></span>
          ))}
        </Marquee>
      </div>
      <section className="section bg-glow">
        <div className="container">
          <DestinationGrid items={DESTINATIONS} />
        </div>
      </section>
    </>
  );
}
