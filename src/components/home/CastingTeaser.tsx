import Link from "next/link";
import { CASTING, PHOTO_SETS } from "@/content/casting";
import { img } from "@/content/media";

/** Home: Paradise Casting in one screen. Ladies apply with nine photos, gentlemen vote, the top 120 are invited. */
export default function CastingTeaser() {
  const total = CASTING.perSet * PHOTO_SETS.length;
  return (
    <section className="section bg-abyss cteaser" aria-labelledby="cteaser-h">
      <div className="container grid-2" style={{ alignItems: "center" }}>
        <div>
          <span className="caps caps--aqua eyebrow" data-reveal>Paradise Casting</span>
          <h2 id="cteaser-h" className="h2" style={{ marginTop: 18 }} data-split="words">Thousands apply. <em className="chrome">The gentlemen choose.</em></h2>
          <p className="lead" style={{ marginTop: 20 }} data-reveal>Every month ladies from around the world send {total} photos to join Paradise Club. Our gentlemen vote, and the {CASTING.shortlist} ladies with the most votes are invited to paradise, free.</p>
          <ol className="cteaser__steps" data-stagger>
            <li><b>{total}</b><span>photos: {PHOTO_SETS.map((s) => `${CASTING.perSet} ${s.short.toLowerCase()}`).join(", ")}</span></li>
            <li><b>♥</b><span>gentlemen vote privately</span></li>
            <li><b>{CASTING.shortlist}</b><span>shortlisted, {CASTING.invited} travel</span></li>
          </ol>
          <div className="cteaser__cta" data-reveal>
            <Link className="btn btn--chrome" href="/casting#apply" data-magnetic>Ladies · apply</Link>
            <Link className="btn btn--ghost" href="/casting/vote">Gentlemen · vote</Link>
          </div>
        </div>

        <div className="cteaser__art" aria-hidden="true">
          <div className="cteaser__card cteaser__card--back frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img("/media/comp-bikini.webp", 700)} alt="" loading="lazy" />
          </div>
          <div className="cteaser__card frame" data-reveal="clip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img("/media/ladies.webp", 900)} alt="" loading="lazy" />
            <div className="cteaser__ui">
              <div className="cteaser__sets">{PHOTO_SETS.map((s) => <span key={s.key}>{CASTING.perSet} × {s.short}</span>)}</div>
              <span className="heart is-on"><svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" /></svg></span>
            </div>
          </div>
          <div className="cteaser__badge glass">
            <span className="caps caps--aqua">Top {CASTING.shortlist}</span>
            <b className="chrome-static">invited</b>
          </div>
        </div>
      </div>
    </section>
  );
}
