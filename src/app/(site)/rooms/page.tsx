import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ExperienceStack from "@/components/home/ExperienceStack";
import RoomTiers from "@/components/home/RoomTiers";
import { getUpcomingEvents } from "@/lib/events";
import { tierPrices } from "@/lib/view";
import { ROOM_TIERS } from "@/content/program";

export const metadata: Metadata = {
  title: "Rooms & villas",
  description: "Luxury Room, Ocean-View Room, Ocean-View Suite and Paradise Villa — four ways to stay at every Paradise Club resort.",
};
export const revalidate = 60;

export default async function RoomsPage() {
  const events = await getUpcomingEvents();
  const tiers = tierPrices(events);
  return (
    <>
      <PageHero
        eyebrow="Four ways to stay"
        title={<>Rooms <em className="chrome">& villas</em></>}
        lead="Every Paradise Club resort offers four room tiers. Prices vary by resort and month; each event shows live availability."
        image="un:1779942578833-5f00dc79d6d1"
        crumbs={[{ href: "/rooms", label: "Rooms" }]}
      >
        <Link className="btn btn--chrome" href="/events" data-magnetic>Choose your month</Link>
      </PageHero>

      <ExperienceStack
        tag="The four tiers"
        slides={ROOM_TIERS.map((t, i) => ({ name: t.name, title: t.name.split(" ").slice(0, -1).join(" ") || t.name, em: t.name.split(" ").slice(-1)[0], text: `${t.description} From ${tiers[i].from} for seven days.`, image: t.image }))}
      />

      <section className="section bg-navy">
        <div className="container">
          <div className="grid-2" style={{ alignItems: "end" }}>
            <div>
              <span className="caps caps--aqua eyebrow" data-reveal>Compare</span>
              <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Everything <em className="chrome">side by side</em></h2>
            </div>
            <p className="lead" data-reveal>All packages include seven days and six nights, every Paradise Club event and the company of 200 elite singles. Bringing a lady from abroad? Add her at the companion rate.</p>
          </div>
          <div className="table-wrap" style={{ marginTop: 44 }} data-reveal>
            <table className="t">
              <thead><tr><th>Room</th><th>Highlights</th><th className="num">From</th><th className="num">+ Lady</th><th /></tr></thead>
              <tbody>
                {ROOM_TIERS.map((t, i) => (
                  <tr key={t.name}>
                    <td><b style={{ fontFamily: "var(--f-display)", fontSize: "1.4rem", fontWeight: 400 }}>{t.name}</b></td>
                    <td className="muted">{t.features.join(" · ")}</td>
                    <td className="num">{tiers[i].from}</td>
                    <td className="num muted">+${(t.companionCents / 100).toLocaleString()}</td>
                    <td><Link className="mini-btn mini-btn--aqua" href="/events">Book</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="fine" style={{ marginTop: 16 }}>Indicative &quot;from&quot; prices across upcoming events. Exact prices and availability are shown on each event page.</p>
          <RoomTiers tiers={tiers} href="/events" />
        </div>
      </section>

      <section className="section--tight bg-abyss">
        <div className="container cards-3" data-stagger>
          {[
            { t: "Pay in full", p: "One payment and you're done. Your room is confirmed instantly." },
            { t: "Deposit + instalments", p: "Reserve with a deposit today; the balance is charged automatically on the scheduled dates." },
            { t: "Your room, guaranteed", p: "Live inventory: once your deposit is in, nobody else can book your room." },
          ].map((x) => (
            <div className="panel" key={x.t}><h3 className="h3">{x.t}</h3><p className="muted" style={{ marginTop: 10 }}>{x.p}</p></div>
          ))}
        </div>
      </section>
    </>
  );
}
