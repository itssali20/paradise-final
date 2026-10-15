"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReduced } from "@/lib/gsap";
import { img } from "@/content/media";

const OPTIONS = [
  { k: "Option one", t: "The tropical resort", s: true, p: "The beach is magnificent, but the resort is filled with honeymooners, couples and families. You hoped to meet new people, yet you may end up dining alone.", bg: "un:1630252421399-ddde79af47b3" },
  { k: "Option two", t: "The typical adults-only club", s: true, p: "The advertisements promise excitement, but the atmosphere, the activities and the other guests may not match your expectations.", bg: "/media/ev-nightclub.webp" },
  { k: "Option three", t: "The traditional singles resort", s: true, p: "A singles label alone doesn't guarantee shared interests, a compatible atmosphere or a memorable experience.", bg: "un:1580541631971-a0e8ce42e97f" },
  { k: "Option four", t: "Elite Vacations", s: false, p: "A luxury beachfront escape designed around a private community of 200 guests — 100 women and 100 men — with shared adventures, special events and every opportunity to connect.", bg: "un:1749183563789-ae17d4a952d2" },
];

/** "Why we created Elite Vacations" — four options, three crossed out, pinned and cross-faded. */
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
    <section className="opts" ref={root} aria-label="Why we created Elite Vacations">
      <div className="opt-bg" style={{ position: "absolute", inset: 0 }}>
        {OPTIONS.map((o) => (
          // eslint-disable-next-line @next/next/no-img-element
          <div className="media" key={o.k}><img src={img(o.bg, 2000)} alt="" loading="lazy" /></div>
        ))}
      </div>
      <div className="opts__c">
        <div>
          <span className="caps caps--dim">Why we created Elite Vacations</span>
          <div className="opt-texts">
            {OPTIONS.map((o) => (
              <div className="otext" key={o.k}>
                <span className="caps caps--aqua">{o.k}</span>
                <h3>{o.s ? <s>{o.t}</s> : <em className="chrome">{o.t}</em>}</h3>
                <p>{o.p}</p>
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
