import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import DestinationGrid from "@/components/ui/DestinationGrid";
import Marquee from "@/components/motion/Marquee";
import { DESTINATIONS } from "@/content/destinations";

export const metadata: Metadata = {
  title: "Destinations",
  description: "The world is your paradise. Paradise Club's destination vision spans the Caribbean, the Americas and Europe.",
};

export default function DestinationsPage() {
  return (
    <>
      <PageHero
        eyebrow={`${DESTINATIONS.length} destinations`}
        title={<>The world is <em className="chrome">your paradise</em></>}
        lead="Our destination vision spans the Caribbean, the Americas, and Europe. Each location will be evaluated for resort quality, accessibility, entertainment opportunities, and suitability for an exclusive Paradise Club event."
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
