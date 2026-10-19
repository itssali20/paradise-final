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
import { SITE } from "@/content/site";

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
            <span className="caps caps--aqua eyebrow" data-reveal>The entire resort — exclusively yours</span>
            <p className="statement" style={{ marginTop: 28 }} data-fill>
              The resort is not simply where you stay. <em className="chrome">It becomes your private world of luxury, friendship, and romance.</em>
            </p>
          </div>
          <div className="stack">
            <div className="pair">
              <div><b className="chrome-static" data-count="100">100</b><span>Gentlemen</span></div>
              <div><b className="chrome-static" data-count="100">100</b><span>Ladies</span></div>
            </div>
            <p className="lead" data-reveal>Our vision is to reserve an entire luxury resort for each international gathering: a magnificent beachfront property dedicated to approximately 200 guests, with shared access to pools, beaches, restaurants, lounges, and event spaces. From breakfast overlooking the ocean to glamorous evening celebrations, every part of the stay offers opportunities to connect.</p>
            <p className="fine" data-reveal>Exclusive resort arrangements are subject to signed property agreements and confirmed event details.</p>
            <div data-reveal><Link className="arrow-link caps" href="/about">Why we created Paradise Club <i /></Link></div>
          </div>
        </div>
      </section>

      <WomenFree />

      <CastingTeaser />

      <EventStrip events={strip} />

      <DestinationSlider items={DESTINATIONS.map((d) => ({ slug: d.slug, name: d.name, area: d.area, image: d.image, tagline: d.tagline }))} />

      <ExperienceStack
        slides={[
          { name: "Bikini contest", title: "The bikini", em: "contest", text: "A tropical fashion competition with a proposed $10,000 grand prize.", mixkit: CLIPS.beach, image: "/media/comp-bikini.webp" },
          { name: "Pool parties", title: "Pool", em: "parties", text: "Music, sunshine and fascinating singles from around the world.", mixkit: CLIPS.pool, image: "un:1696668827476-8c99c513805c" },
          { name: "Sunset cruise", title: "The sunset", em: "cruise", text: "Romantic evenings on turquoise water as the sun goes down.", image: "un:1708246118417-86df0deb72dd" },
          { name: "Masquerade", title: "Masquerade", em: "nights", text: "Masks, costumes and a new theme every night.", image: "/media/ev-masquerade.webp" },
          { name: "Horseback", title: "Horseback", em: "at sunset", text: "Ride the shoreline at golden hour.", mixkit: CLIPS.horseback, image: "un:1618066860737-df4d383c98c3" },
        ]}
      />

      {/* competitions */}
      <section className="comps" id="competitions">
        <div className="media"><Video mixkit={CLIPS.stage} poster="/media/ev-miss-paradise.webp" /></div>
        <Spotlight />
        <div className="comps__c">
          <span className="caps caps--aqua">Four spectacular international competitions</span>
          <div className="prize chrome" data-count="40000" data-prefix="$">$40,000</div>
          <p className="lead" style={{ margin: "0 auto", color: "var(--ink)" }}>in proposed competition prizes — a proposed $10,000 grand prize for each, celebrating beauty, confidence, elegance, creativity, and extraordinary talent.</p>
          <div className="comp-grid">
            {COMPETITIONS.map((c) => (
              <Link className="comp" key={c.slug} href={`/competitions/${c.slug}`} data-reveal data-cursor="Enter">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(c.image, 900)} alt={c.name} loading="lazy" />
                <div className="comp__b">
                  <span className="caps caps--aqua">Proposed {c.prize} grand prize</span>
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
          <p className="fine" style={{ margin: "26px auto 0" }}>Prizes, funding, eligibility, judging, age requirements and official rules must be finalized before any competition is confirmed.</p>
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
          <span className="caps caps--aqua">Life is too short for ordinary vacations</span>
          <h2 className="display chrome" data-split="chars">Your invitation<br /><em>to paradise</em></h2>
          <p className="lead" style={{ color: "var(--ink)" }}>Perhaps someone you meet will become a lifelong friend. Perhaps a dinner conversation will inspire your next adventure. Or perhaps you will meet someone who makes the vacation truly unforgettable.</p>
          <p className="lead chrome-static" style={{ fontFamily: "var(--f-display)" }}>We cannot promise that you will find love. We can create extraordinary opportunities to discover it.</p>
          <span className="caps caps--aqua">{SITE.name} · {SITE.pillars}</span>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="btn btn--chrome" href="/membership" data-magnetic>Become a member</Link>
            <Link className="btn btn--ghost" href="/destinations">Explore destinations</Link>
            <Link className="btn btn--ghost" href="/ladies#apply">Apply to attend</Link>
          </div>
        </div>
      </section>
    </>
  );
}
