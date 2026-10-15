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

export const metadata: Metadata = {
  title: "Ladies always come free",
  description: "Complimentary admission for eligible ladies at every Paradise Club event. Apply to attend a luxury resort vacation.",
};
export const revalidate = 60;

export default async function LadiesPage() {
  const events = await getUpcomingEvents();
  const eventOptions = ["Any / next event", ...events.map((e) => `${getDestination(e.destinationSlug)?.name ?? e.title} · ${dateRange(e.startDate, e.endDate)}`)];

  return (
    <>
      <PageHero
        eyebrow="An invitation to Paradise"
        title={<>Ladies always <em className="chrome">come free</em></>}
        lead="Bring your style, your talent and your sense of adventure. Complimentary admission at every Paradise Club resort."
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
            <span className="caps caps--aqua eyebrow" data-reveal>Clear terms, no surprises</span>
            <h2 className="h2" style={{ marginTop: 18 }} data-split="words">What <em className="chrome">&quot;free&quot;</em> means</h2>
            <p className="lead" style={{ marginTop: 20 }} data-reveal>Admission to the Paradise Club event is complimentary for every approved lady. What else is covered for your event is written into your invitation before you travel.</p>
          </div>
          <div className="table-wrap" data-reveal>
            <table className="t">
              <tbody>
                <tr><td>Event admission, parties, shows & contests</td><td className="num"><span className="status status--ok">Always free</span></td></tr>
                <tr><td>Resort accommodation (shared or private)</td><td className="num"><span className="status status--info">Per invitation</span></td></tr>
                <tr><td>Meals & drinks at the resort</td><td className="num"><span className="status status--info">Per invitation</span></td></tr>
                <tr><td>Airfare</td><td className="num"><span className="status status--info">Per invitation</span></td></tr>
                <tr><td>Optional excursions & water sports</td><td className="num"><span className="status">Optional</span></td></tr>
              </tbody>
            </table>
            <p className="fine" style={{ padding: "14px 16px" }}>Eligibility: ladies 18 or older, single, with valid travel documents. Identity is verified before an invitation is confirmed.</p>
          </div>
        </div>
      </section>

      <section className="split bg-navy">
        <div className="split__txt">
          <span className="caps caps--aqua eyebrow" data-reveal>International Talent & Beauty Pageant</span>
          <h2 className="h2" style={{ marginTop: 18 }} data-split="words">The road <em className="chrome">to Paradise</em></h2>
          <ol className="rows" style={{ marginTop: 30 }} data-stagger>
            <li><b>I</b><div><h3>Thousands invited</h3><p>Ladies around the world are invited to the Paradise Club pageant.</p></div></li>
            <li><b>II</b><div><h3>Live in Kyiv</h3><p>Our coordinators host a live competition for ladies from Ukraine and neighbouring countries, streamed on YouTube and social media.</p></div></li>
            <li><b>III</b><div><h3>Talent counts</h3><p>Many of our ladies perform as Paradise Club entertainers — dancers, singers, models.</p></div></li>
            <li><b>IV</b><div><h3>Invited to Paradise</h3><p>Winners join us as guests. What&apos;s covered is confirmed in writing with each invitation.</p></div></li>
          </ol>
        </div>
        <div className="split__media"><div className="media">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/media/ladies.webp" alt="Paradise Club guest on the beach" data-parallax="8" loading="lazy" /></div></div>
      </section>

      <div className="bg-abyss" style={{ paddingBlock: 30 }}>
        <Marquee className="marquee--type" speed={55}>
          {["Dancers", "Singers", "Models", "Adventurers", "Travellers", "Dreamers"].map((w) => <span key={w} className="chrome-static">{w}<span className="sep" /></span>)}
        </Marquee>
      </div>

      <section className="section bg-glow" id="apply">
        <div className="container grid-2" style={{ alignItems: "start" }}>
          <div style={{ position: "sticky", top: 120 }}>
            <span className="caps caps--aqua eyebrow" data-reveal>Women&apos;s registration</span>
            <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Apply <em className="chrome">to attend</em></h2>
            <p className="lead" style={{ marginTop: 20 }} data-reveal>Tell us about yourself and the month you&apos;d love to travel. A coordinator will call you, verify your identity and send your written invitation.</p>
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
                { name: "competition", label: "Enter a competition?", type: "select", options: ["Not now", "Miss Paradise", "Bikini Contest", "Lingerie Fashion", "International Talent"] },
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
