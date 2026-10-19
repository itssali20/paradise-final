"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReduced } from "@/lib/gsap";
import { img } from "@/content/media";

const OPTIONS = [
  { k: "Option one", t: "The traditional tropical resort", s: true, p: "You arrive at a magnificent beachfront resort. The ocean is breathtaking, the accommodations are luxurious, and the restaurants are exceptional. Yet nearly everyone around you is honeymooning, celebrating an anniversary, or vacationing with family. The setting is beautiful, but the opportunity to share it with someone special is missing.", bg: "un:1630252421399-ddde79af47b3" },
  { k: "Option two", t: "The adults-only resort", s: true, p: "Adults-only does not necessarily mean singles-only. You may discover that most guests are couples and that the few available singles have little in common with you. You came looking for excitement and connection, but the experience may not deliver either.", bg: "/media/ev-nightclub.webp" },
  { k: "Option three", t: "The conventional singles vacation", s: true, p: "Many organized singles trips offer limited opportunities to meet compatible people, inconsistent age groups, unbalanced participation, and repetitive destinations. An expensive journey can still leave you feeling disconnected.", bg: "un:1580541631971-a0e8ce42e97f" },
  { k: "Option four", t: "Paradise Club", s: false, p: "Paradise Club is designed to bring together approximately 100 successful, charismatic gentlemen and 100 beautiful, fascinating, talented single women for seven days and six nights at an extraordinary luxury destination. Our vision is to reserve an entire resort for a private international gathering.", bg: "un:1749183563789-ae17d4a952d2" },
];

/** "Why we created Paradise Club" — four options, three crossed out, pinned and cross-faded. */
export default function OptionsPinned() {
  const root = useRef<HTMLElement>(null);
  const [n, setN] = useState(1);
  useGSAP(() => {
    if (prefersReduced()) {
      gsap.set(".otext", { position: "relative", opacity: 1, visibility: "visible", marginBottom: 40 });
      gsap.set(root.current, { height: "auto" });
      return;
    }
    const t = gsap.utils.toArray<HTMLElement>(".otext", root.current);
    const b = gsap.utils.toArray<HTMLElement>(".opt-bg .media", root.current);
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=300%", scrub: 1, pin: true, anticipatePin: 1, onUpdate: (s) => setN(Math.min(4, 1 + Math.floor(s.progress * 3.999))) } });
    for (let k = 1; k < 4; k++) {
      tl.to(t[k - 1], { autoAlpha: 0, y: -40, duration: 0.4 }, k - 1 + 0.3)
        .fromTo(t[k], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.4 }, k - 1 + 0.6)
        .to(b[k], { opacity: 1, duration: 0.6 }, k - 1 + 0.3)
        .fromTo(b[k].querySelector("img"), { scale: 1.2 }, { scale: 1, duration: 1 }, k - 1 + 0.3);
    }
    tl.to({}, { duration: 0.4 });
  }, { scope: root });

  return (
    <section className="opts" ref={root} aria-label="Why we created Paradise Club">
      <div className="opt-bg" style={{ position: "absolute", inset: 0 }}>
        {OPTIONS.map((o) => (
          // eslint-disable-next-line @next/next/no-img-element
          <div className="media" key={o.k}><img src={img(o.bg, 2000)} alt="" loading="lazy" /></div>
        ))}
      </div>
      <div className="opts__c">
        <div>
          <span className="caps caps--dim">Why we created Paradise Club</span>
          <div className="opt-texts">
            {OPTIONS.map((o) => (
              <div className="otext" key={o.k}>
                <span className="caps caps--aqua">{o.k}</span>
                <h3>{o.s ? <s>{o.t}</s> : <em className="chrome">{o.t}</em>}</h3>
                <p>{o.p}</p>
                {!o.s && <p className="caps caps--aqua" style={{ marginTop: 22 }}>One magnificent resort. Exceptional company. Unlimited possibilities.</p>}
                {!o.s && <div style={{ marginTop: 28 }}><Link className="btn btn--chrome" href="/events">Choose Paradise</Link></div>}
              </div>
            ))}
          </div>
        </div>
        <div className="opt-count"><span>{n}</span>/4</div>
      </div>
    </section>
  );
}
