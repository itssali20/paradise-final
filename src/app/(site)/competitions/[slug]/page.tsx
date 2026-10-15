import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ApplicationForm from "@/components/forms/ApplicationForm";
import { COMPETITIONS } from "@/content/program";
import { img } from "@/content/media";

export function generateStaticParams() {
  return COMPETITIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = COMPETITIONS.find((x) => x.slug === slug);
  return c ? { title: `${c.name} · ${c.prize} prize`, description: c.description } : { title: "Competition" };
}

export default async function CompetitionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = COMPETITIONS.find((x) => x.slug === slug);
  if (!c) notFound();
  const others = COMPETITIONS.filter((x) => x.slug !== c.slug);

  return (
    <>
      <PageHero
        eyebrow={`${c.prize} proposed first prize · ${c.night}`}
        title={<>{c.name.split(" ")[0]} <em className="chrome">{c.name.split(" ").slice(1).join(" ") || "Contest"}</em></>}
        lead={c.short}
        image={c.image}
        crumbs={[{ href: "/competitions", label: "Competitions" }, { href: `/competitions/${c.slug}`, label: c.name }]}
      >
        <Link className="btn btn--chrome" href="#enter" data-magnetic>Enter now</Link>
      </PageHero>

      <section className="section bg-glow">
        <div className="container grid-2">
          <div>
            <p className="statement" data-fill>{c.description}</p>
          </div>
          <div className="stack-l">
            <div data-reveal><span className="caps caps--aqua">Eligibility</span><ul className="ticks" style={{ marginTop: 10 }}>{c.eligibility.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div data-reveal><span className="caps caps--aqua">Judging</span><ul className="ticks" style={{ marginTop: 10 }}>{c.judging.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div data-reveal><span className="caps caps--aqua">How to enter</span><ol className="rows" style={{ marginTop: 10 }}>{c.entry.map((x, i) => <li key={x}><b>{i + 1}</b><div><p style={{ color: "var(--ink)" }}>{x}</p></div></li>)}</ol></div>
            <p className="fine">Prize amounts are proposed and confirmed in the official rules for each event, together with eligibility, schedule and prize conditions. <Link className="link-line" href="/legal/contest-rules">Contest rules</Link>.</p>
          </div>
        </div>
      </section>

      <section className="section bg-navy" id="enter">
        <div className="container grid-2" style={{ alignItems: "start" }}>
          <div>
            <span className="caps caps--aqua eyebrow" data-reveal>Registration</span>
            <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Enter <em className="chrome">{c.name}</em></h2>
            <div className="frame" style={{ aspectRatio: "4/5", borderRadius: 24, marginTop: 30, maxWidth: 440 }} data-reveal="clip">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(c.image, 900)} alt="" loading="lazy" />
            </div>
          </div>
          <div data-reveal>
            <ApplicationForm
              type="COMPETITION"
              adult
              submit={`Enter ${c.name}`}
              hidden={{ competition: c.name }}
              fields={[
                { name: "social", label: "Instagram / portfolio", type: "url", placeholder: "https://", full: true },
                { name: "about", label: "About you", type: "textarea" },
                { name: "files", label: "Photos or video", type: "file", multiple: true, accept: "image/*,video/mp4,video/quicktime" },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="section--tight bg-abyss">
        <div className="container cards-3">
          {others.map((o) => (
            <Link key={o.slug} className="card card--over" href={`/competitions/${o.slug}`} data-reveal>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="card__img"><img src={img(o.image, 800)} alt={o.name} loading="lazy" /></div>
              <div className="card__b"><span className="caps caps--aqua">{o.prize}</span><h3>{o.name}</h3></div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
