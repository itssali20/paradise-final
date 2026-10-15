import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ExperienceStack from "@/components/home/ExperienceStack";
import { ACTIVITIES } from "@/content/program";
import { CLIPS, img } from "@/content/media";

export const metadata: Metadata = { title: "Activities", description: "Scuba diving, jet skiing, snorkeling, parasailing, sunset cruises and excursions — reserve activities for your Paradise Club week." };

export default function ActivitiesPage() {
  const cats = ["Ocean", "Beach", "Evenings"] as const;
  return (
    <>
      <PageHero
        eyebrow="Activities & adventures"
        title={<>Every day is <em className="chrome">a new adventure</em></>}
        image="/media/act-wakeboard.webp"
        crumbs={[{ href: "/activities", label: "Activities" }]}
      >
        <Link className="btn btn--chrome" href="/account" data-magnetic>Reserve activities</Link>
      </PageHero>

      <ExperienceStack
        tag="On the water"
        slides={[
          { name: "Scuba", title: "Scuba", em: "diving", text: "Guided dives on the reef for every level.", image: "/media/act-scuba.webp" },
          { name: "Jet ski", title: "Jet", em: "ski", text: "Full throttle across the bay.", image: "/media/act-jet-ski.webp" },
          { name: "Parasailing", title: "Para", em: "sailing", text: "Float above the turquoise water.", image: "/media/act-parasailing.webp" },
          { name: "Snorkel", title: "Coral", em: "gardens", text: "Tropical fish, a mask and a fin kick away.", image: "/media/act-coral.webp" },
          { name: "Horseback", title: "Horseback", em: "at sunset", text: "Ride the shoreline at golden hour.", mixkit: CLIPS.horseback, image: "un:1618066860737-df4d383c98c3" },
        ]}
      />

      {cats.map((c) => (
        <section key={c} className={`section--tight ${c === "Beach" ? "bg-abyss" : "bg-navy"}`}>
          <div className="container">
            <span className="caps caps--aqua eyebrow" data-reveal>{c}</span>
            <div className="cards-4" style={{ marginTop: 30 }}>
              {ACTIVITIES.filter((a) => a.cat === c).map((a) => (
                <article className="card card--over ripple-hover" key={a.name} data-reveal>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div className="card__img"><img src={img(a.image, 800)} alt={a.name} loading="lazy" /></div>
                  <div className="card__b"><h3>{a.name}</h3><p>{a.text}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="section--tight bg-glow">
        <div className="container grid-2">
          <div>
            <h2 className="h2" data-split="words">Reserve <em className="chrome">before you fly</em></h2>
          </div>
          <div className="stack" data-reveal>
            <p className="lead">Once your room is booked, open <b style={{ color: "var(--ink)" }}>My account</b> to reserve scuba, jet ski, parasailing and excursions for your week. Places are limited per activity.</p>
            <p className="fine">Which activities are included, optional or extra-cost depends on the destination and local operators, and is confirmed in your event programme. Safety briefings and operator requirements apply.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="btn btn--chrome" href="/account">My account</Link>
              <Link className="btn" href="/events">Book a room first</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
