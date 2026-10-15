import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import { Gallery, Films } from "@/components/ui/Gallery";
import { FILMS, GALLERY } from "@/content/program";
import { VIDEO } from "@/content/media";

export const metadata: Metadata = { title: "Gallery & films", description: "See the Paradise Club experience: models, nights, resorts and adventures." };

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery & films"
        title={<>See the <em className="chrome">experience</em></>}
        video={{ src: VIDEO.heroDesktop, srcMobile: VIDEO.heroMobile, poster: VIDEO.heroPoster }}
        crumbs={[{ href: "/gallery", label: "Gallery" }]}
        short
      />
      <section className="section bg-abyss" style={{ paddingTop: 60 }}>
        <div className="container">
          <span className="caps caps--aqua eyebrow" data-reveal>Paradise on film</span>
          <Films films={FILMS} />
        </div>
      </section>
      <section className="section bg-navy">
        <div className="container">
          <span className="caps caps--aqua eyebrow" data-reveal>Photographs</span>
          <h2 className="h2" style={{ marginTop: 18, marginBottom: 30 }} data-split="words">Models, nights, <em className="chrome">resorts</em></h2>
          <Gallery items={GALLERY} />
          <p className="fine" style={{ marginTop: 24 }}>Some imagery and mood films are illustrative stock photography and footage. Event photos are published with participant releases.</p>
        </div>
      </section>
    </>
  );
}
