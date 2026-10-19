import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import WomenFree from "@/components/home/WomenFree";
import ApplicationForm from "@/components/forms/ApplicationForm";
import Marquee from "@/components/motion/Marquee";
import { VIDEO, img } from "@/content/media";
import { getUpcomingEvents } from "@/lib/events";
import { getDestination } from "@/content/destinations";
import { dateRange } from "@/lib/format";
import { COMPETITIONS } from "@/content/program";

export const metadata: Metadata = {
  title: "An exclusive invitation for women",
  description: "100 extraordinary women. One unforgettable experience. Selected eligible women may receive complimentary attendance by invitation. Apply to attend.",
};
export const revalidate = 60;

export default async function LadiesPage() {
  const events = await getUpcomingEvents();
  const eventOptions = ["Any / next event", ...events.map((e) => `${getDestination(e.destinationSlug)?.name ?? e.title} · ${dateRange(e.startDate, e.endDate)}`)];

  return (
    <>
      <PageHero
        eyebrow="An exclusive invitation for women"
        title={<>One unforgettable <em className="chrome">experience</em></>}
        lead="100 extraordinary women from around the world, representing different countries, cultures, professions, personalities, and talents."
        video={{ src: VIDEO.ladiesDesktop, srcMobile: VIDEO.ladiesMobile, poster: VIDEO.ladiesPoster }}
        crumbs={[{ href: "/ladies", label: "Ladies" }]}
      >
        <Link className="btn btn--chrome" href="#apply" data-magnetic>Apply to attend</Link>
        <Link className="btn btn--ghost" href="/casting">Join the casting</Link>
      </PageHero>

      <WomenFree cta={false} />

      <section className="section bg-glow">
        <div className="container grid-2">
          <div>
            <span className="caps caps--aqua eyebrow" data-reveal>Complimentary attendance — by invitation</span>
            <h2 className="h2" style={{ marginTop: 18 }} data-split="words">What your invitation <em className="chrome">may include</em></h2>
            <p className="lead" style={{ marginTop: 20 }} data-reveal>Selected eligible female participants may receive complimentary event admission. Depending on the confirmed package, invitations may also include resort accommodation, dining, entertainment, and selected activities. Our long-term vision includes complimentary airfare for qualifying invited participants.</p>
          </div>
          <div className="table-wrap" data-reveal>
            <table className="t">
              <tbody>
                <tr><td>Event admission, parties, shows & competitions</td><td className="num"><span className="status status--ok">Complimentary · by invitation</span></td></tr>
                <tr><td>Resort accommodation</td><td className="num"><span className="status status--info">Per confirmed package</span></td></tr>
                <tr><td>Dining at the resort</td><td className="num"><span className="status status--info">Per confirmed package</span></td></tr>
                <tr><td>Entertainment & selected activities</td><td className="num"><span className="status status--info">Per confirmed package</span></td></tr>
                <tr><td>Airfare</td><td className="num"><span className="status">Long-term vision</span></td></tr>
                <tr><td>Optional excursions & water sports</td><td className="num"><span className="status">Optional</span></td></tr>
              </tbody>
            </table>
            <p className="fine" style={{ padding: "14px 16px" }}>The exact inclusions, exclusions, eligibility criteria, and application terms will be provided before invitations are accepted. Applicants must be 18 or older, single, with valid travel documents; identity is verified before an invitation is confirmed.</p>
          </div>
        </div>
      </section>

      <section className="split bg-navy">
        <div className="split__txt">
          <span className="caps caps--aqua eyebrow" data-reveal>100 extraordinary women</span>
          <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Who we <em className="chrome">welcome</em></h2>
          <p className="lead" style={{ marginTop: 20 }} data-reveal>Paradise Club intends to invite exceptional single women from around the world. We welcome professionals, entrepreneurs, artists, performers, models, and others who appreciate travel, elegance, adventure, and meaningful connections.</p>
          <ol className="rows" style={{ marginTop: 30 }} data-stagger>
            <li><b>I</b><div><h3>From around the world</h3><p>Different countries, cultures, professions, personalities, and talents.</p></div></li>
            <li><b>II</b><div><h3>Travel & adventure</h3><p>Seven days and six nights of luxury, entertainment, excursions, and celebration.</p></div></li>
            <li><b>III</b><div><h3>Competitions, if you wish</h3><p>Beauty and talent competitions are highlights of the experience, but participation in a contest is not the sole purpose of attending.</p></div></li>
            <li><b>IV</b><div><h3>Meaningful connections</h3><p>Every connection is based on mutual interest, respect, and personal choice.</p></div></li>
          </ol>
        </div>
        <div className="split__media"><div className="media">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/media/ladies.webp" alt="Paradise Club guest on the beach" data-parallax="8" loading="lazy" /></div></div>
      </section>

      <div className="bg-abyss" style={{ paddingBlock: 30 }}>
        <Marquee className="marquee--type" speed={55}>
          {["Professionals", "Entrepreneurs", "Artists", "Performers", "Models", "Adventurers"].map((w) => <span key={w} className="chrome-static">{w}<span className="sep" /></span>)}
        </Marquee>
      </div>

      <section className="section bg-glow" id="apply">
        <div className="container grid-2" style={{ alignItems: "start" }}>
          <div style={{ position: "sticky", top: 120 }}>
            <span className="caps caps--aqua eyebrow" data-reveal>Women&apos;s registration</span>
            <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Apply <em className="chrome">to attend</em></h2>
            <p className="lead" style={{ marginTop: 20 }} data-reveal>Tell us about yourself and the month you&apos;d love to travel. A coordinator will contact you and verify your identity. Selected applicants receive a written invitation setting out exactly what is included.</p>
            <div className="frame" style={{ aspectRatio: "4/3", borderRadius: 24, marginTop: 30 }} data-reveal="clip">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img("/media/comp-lingerie.webp", 900)} alt="" loading="lazy" />
            </div>
          </div>
          <div data-reveal>
            <ApplicationForm
              type="LADY"
              adult
              submit="Apply to attend"
              fields={[
                { name: "birthDate", label: "Date of birth", type: "date", required: true },
                { name: "city", label: "City" },
                { name: "event", label: "Preferred event", type: "select", options: eventOptions, full: true },
                { name: "instagram", label: "Instagram / portfolio", type: "url", placeholder: "https://", full: true },
                { name: "talent", label: "Do you perform?", type: "select", options: ["No", "Dancer", "Singer", "Model", "Other"] },
                { name: "competition", label: "Enter a competition?", type: "select", options: ["Not now", ...COMPETITIONS.map((c) => c.name)] },
                { name: "about", label: "About you", type: "textarea", placeholder: "A few lines about you, your languages and what you'd love to experience." },
                { name: "files", label: "Two or three recent photos", type: "file", multiple: true, hint: "JPG or PNG, up to 10 MB each." },
                { name: "idFiles", label: "ID for verification (passport or national ID)", type: "file", accept: "image/*,application/pdf", hint: "Used only to verify your age and identity. Stored privately and deleted after verification." },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
