import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import { PACKAGES } from "@/content/program";
import { CLIPS, img } from "@/content/media";
import Video from "@/components/ui/Video";

export const metadata: Metadata = { title: "For gentlemen", description: "Invite her to Paradise. Three packages for gentlemen: Gentleman, Gentleman & Lady, and Paradise Villa." };

export default function GentlemenPage() {
  return (
    <>
      <PageHero
        eyebrow="For gentlemen"
        title={<>Invite her <em className="chrome">to Paradise</em></>}
        lead="Stop dreaming in front of a screen. Meet in person, at one of the world's most beautiful resorts."
        image="un:1520115736066-2190b58a4b9e"
        crumbs={[{ href: "/gentlemen", label: "Gentlemen" }]}
      >
        <Link className="btn btn--chrome" href="/events" data-magnetic>Choose your month</Link>
      </PageHero>

      <section className="split bg-navy">
        <div className="split__media"><div className="media"><Video mixkit={CLIPS.couple} poster={img("un:1507525428034-b723cf961d3e", 1600)} /></div></div>
        <div className="split__txt">
          <span className="caps caps--aqua eyebrow" data-reveal>The story we hear every week</span>
          <p className="statement" style={{ marginTop: 24, fontSize: "clamp(1.6rem,2.8vw,2.6rem)" }} data-fill>
            You&apos;ve been talking for months with a girl in Ukraine, Brazil or across the world. No dinners, no movies, no walks on the beach — just a screen.
          </p>
          <p className="lead" style={{ marginTop: 24 }} data-reveal><b style={{ color: "var(--ink)", fontWeight: 500 }}>Here is your chance.</b> Invite her for seven days and six nights in paradise. Even if you&apos;ve known each other for years, you&apos;re both welcome.</p>
          <blockquote className="quote chrome" data-reveal>And if you don&apos;t click? There are 99 other amazing women at Paradise Club.</blockquote>
        </div>
      </section>

      <section className="section bg-glow">
        <div className="container">
          <span className="caps caps--aqua eyebrow" data-reveal>Packages</span>
          <h2 className="h2" style={{ marginTop: 18, marginBottom: 46 }} data-split="words">Three ways <em className="chrome">to arrive</em></h2>
          <div className="cards-3">
            {PACKAGES.map((p) => (
              <article className="card" key={p.name} data-reveal>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="card__img"><img src={img(p.image, 900)} alt="" loading="lazy" /></div>
                <div className="card__b">
                  <span className="caps caps--aqua">Package {p.n}</span>
                  <h3>{p.name}</h3>
                  <ul className="ticks">{p.points.map((x) => <li key={x} className="muted">{x}</li>)}</ul>
                  <Link className="btn btn--sm" href={p.href} style={{ justifySelf: "start", marginTop: 10 }}>{p.cta}</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section--tight bg-abyss">
        <div className="container">
          <span className="caps caps--aqua eyebrow" data-reveal>Your safety</span>
          <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Feel secure about <em className="chrome">the people you meet</em></h2>
          <div className="trio" data-stagger>
            <div><b className="chrome-static">I</b><h3>Met in person</h3><p>Our coordinators meet guests and verify identities before confirming invitations.</p></div>
            <div><b className="chrome-static">II</b><h3>Dedicated security</h3><p>Professional event security in addition to the hotel&apos;s own team.</p></div>
            <div><b className="chrome-static">III</b><h3>A private event</h3><p>The resort is reserved for Paradise Club guests and staff wherever the hotel agreement allows.</p></div>
          </div>
        </div>
      </section>
    </>
  );
}
