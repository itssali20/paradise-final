import Link from "next/link";
import HomeHero from "@/components/home/HomeHero";
import DivePortal from "@/components/home/DivePortal";
import WomenFree from "@/components/home/WomenFree";
import CastingTeaser from "@/components/home/CastingTeaser";
import EventStrip from "@/components/home/EventStrip";
import DestinationSlider from "@/components/home/DestinationSlider";
import ExperienceStack from "@/components/home/ExperienceStack";
import RoomTiers from "@/components/home/RoomTiers";
import HorizontalScroll from "@/components/home/HorizontalScroll";
import Marquee from "@/components/motion/Marquee";
import Spotlight from "@/components/ui/Spotlight";
import Video from "@/components/ui/Video";
import { getUpcomingEvents } from "@/lib/events";
import { nextEvent, tierPrices, toStrip } from "@/lib/view";
import { DESTINATIONS } from "@/content/destinations";
import { COMPETITIONS, EVENINGS, GALLERY } from "@/content/program";
import { CLIPS, img } from "@/content/media";

export const revalidate = 60;

export default async function Home() {
  const events = await getUpcomingEvents();
  const strip = toStrip(events);
  const wall = GALLERY.slice(0, 12);

  return (
    <>
      <HomeHero next={nextEvent(events)} />

      <DivePortal />

      {/* statement */}
      <section className="section bg-glow">
        <div className="container grid-2" style={{ alignItems: "end" }}>
          <div>
            <span className="caps caps--aqua eyebrow" data-reveal>Not just another vacation</span>
            <p className="statement" style={{ marginTop: 28 }} data-fill>
              One hundred successful men meet one hundred fascinating women at <em className="chrome">a resort reserved entirely for them.</em>
            </p>
          </div>
          <div className="stack">
            <div className="pair">
              <div><b className="chrome-static" data-count="100">100</b><span>Gentlemen</span></div>
              <div><b className="chrome-static" data-count="100">100</b><span>Ladies</span></div>
            </div>
            <p className="lead" data-reveal>Seven days, six nights, a four- or five-star beachfront property — and a different paradise every month.</p>
            <div data-reveal><Link className="arrow-link caps" href="/about">Why Elite Vacations <i /></Link></div>
          </div>
        </div>
      </section>

      <WomenFree />

      <CastingTeaser />

      <EventStrip events={strip} />

      <DestinationSlider items={DESTINATIONS.map((d) => ({ slug: d.slug, name: d.name, area: d.area, image: d.image, tagline: d.tagline }))} />

      <ExperienceStack
        slides={[
          { name: "Bikini contest", title: "The bikini", em: "contest", text: "On the beach, in front of the whole resort. $10,000 to the winner.", mixkit: CLIPS.beach, image: "/media/comp-bikini.webp" },
          { name: "Pool parties", title: "Pool", em: "parties", text: "Music, champagne and 200 singles who came to meet each other.", mixkit: CLIPS.pool, image: "un:1696668827476-8c99c513805c" },
          { name: "Sunset cruise", title: "The sunset", em: "cruise", text: "Turquoise water and white sand on the horizon.", image: "un:1708246118417-86df0deb72dd" },
          { name: "Masquerade", title: "Masquerade", em: "nights", text: "Masks, costumes and a new theme every night.", image: "/media/ev-masquerade.webp" },
          { name: "Horseback", title: "Horseback", em: "at sunset", text: "Ride the shoreline at golden hour.", mixkit: CLIPS.horseback, image: "un:1618066860737-df4d383c98c3" },
        ]}
      />

      {/* competitions */}
      <section className="comps" id="competitions">
        <div className="media"><Video mixkit={CLIPS.stage} poster="/media/ev-miss-paradise.webp" /></div>
        <Spotlight />
        <div className="comps__c">
          <span className="caps caps--aqua">Four spectacular competitions</span>
          <div className="prize chrome" data-count="40000" data-prefix="$">$40,000</div>
          <p className="lead" style={{ margin: "0 auto", color: "var(--ink)" }}>in proposed first prizes — $10,000 for each winner, judged live on stage and streamed worldwide.</p>
          <div className="comp-grid">
            {COMPETITIONS.map((c) => (
              <Link className="comp" key={c.slug} href={`/competitions/${c.slug}`} data-reveal data-cursor="Enter">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(c.image, 900)} alt={c.name} loading="lazy" />
                <div className="comp__b">
                  <span className="caps caps--aqua">{c.prize} first prize</span>
                  <h3>{c.name}</h3>
                  <p>{c.short}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="comps__foot">
            <Link className="btn btn--chrome" href="/competitions" data-magnetic>Enter a competition</Link>
            <Link className="btn btn--ghost" href="/contact?type=sponsor">Become a sponsor</Link>
          </div>
          <p className="fine" style={{ margin: "26px auto 0" }}>Proposed prizes. Eligibility, judging and official rules are provided to every entrant before the event.</p>
        </div>
      </section>

      {/* rooms */}
      <section className="section bg-navy">
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 30, flexWrap: "wrap" }}>
            <div>
              <span className="caps caps--aqua eyebrow" data-reveal>Four ways to stay</span>
              <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Choose your <em className="chrome">room in paradise</em></h2>
            </div>
            <div className="stack-s" data-reveal>
              <p className="lead">Pay in full, or reserve with a deposit and spread the balance.</p>
              <Link className="arrow-link caps" href="/rooms">Compare rooms <i /></Link>
            </div>
          </div>
          <RoomTiers tiers={tierPrices(events)} />
        </div>
      </section>

      <HorizontalScroll
        items={EVENINGS}
        head={
          <>
            <div>
              <span className="caps caps--aqua">Every evening</span>
              <h2 className="h2" style={{ marginTop: 18 }}>A new <em className="chrome">celebration</em></h2>
            </div>
            <p className="lead">A connection might begin at a tango night, a masquerade or on the sunset cruise. We set the scene; the chemistry is yours.</p>
          </>
        }
      />

      {/* visual wall */}
      <section className="wall" aria-label="Moments">
        <Marquee speed={36}>
          {wall.slice(0, 6).map((g, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <div key={g.src} className={`wall__img frame${i % 3 === 1 ? " wide" : ""}`}><img src={img(g.src, 900)} alt="" loading="lazy" /></div>
          ))}
        </Marquee>
        <Marquee speed={30} reverse>
          {wall.slice(6).map((g, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <div key={g.src} className={`wall__img frame${i % 3 === 0 ? " wide" : ""}`}><img src={img(g.src, 900)} alt="" loading="lazy" /></div>
          ))}
        </Marquee>
        <div className="center" style={{ marginTop: 50 }}>
          <Link className="btn" href="/gallery">Open the gallery</Link>
        </div>
      </section>

      {/* final */}
      <section className="final">
        <div className="media"><Video mixkit={CLIPS.turquoise} poster="/media/dest-jamaica.webp" /></div>
        <div className="final__c">
          <span className="caps caps--aqua">Reservations open</span>
          <h2 className="display chrome" data-split="chars">Your paradise<br /><em>starts here</em></h2>
          <p className="lead" style={{ color: "var(--ink)" }}>Choose your month, choose your room, and reserve with a deposit today.</p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="btn btn--chrome" href="/events" data-magnetic>See upcoming events</Link>
            <Link className="btn btn--ghost" href="/ladies#apply">Ladies · apply free</Link>
          </div>
        </div>
      </section>
    </>
  );
}
