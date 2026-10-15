"use client";
import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, prefersReduced } from "@/lib/gsap";
import { img } from "@/content/media";

type Item = { n: string; tag: string; title: string; text: string; image: string };

/** Pinned horizontal gallery (desktop) with per-card parallax; stacked clip reveals on phones. */
export default function HorizontalScroll({ items, head }: { items: Item[]; head: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (prefersReduced()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 821px)", () => {
      const tr = root.current!.querySelector<HTMLElement>(".hs__track")!;
      const dist = () => Math.max(0, tr.scrollWidth - window.innerWidth);
      const h = gsap.to(tr, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: tr, start: "bottom bottom", end: () => "+=" + dist(), pin: root.current, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      gsap.utils.toArray<HTMLElement>(".evp img", root.current).forEach((im) => {
        gsap.fromTo(im, { xPercent: -8, scale: 1.18 }, { xPercent: 8, scale: 1.18, ease: "none", scrollTrigger: { trigger: im.closest(".evp"), containerAnimation: h, start: "left right", end: "right left", scrub: true } });
      });
    });
    mm.add("(max-width: 820px)", () => {
      gsap.utils.toArray<HTMLElement>(".evp", root.current).forEach((p) => {
        gsap.from(p, { clipPath: "inset(14% 10% 14% 10% round 26px)", duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: p, start: "top 85%", once: true } });
      });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section className="hs" ref={root}>
      <div className="hs__head">{head}</div>
      <div className="hs__track">
        {items.map((e) => (
          <article className="evp" key={e.title}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="media"><img src={img(e.image, 1200)} alt={e.title} loading="lazy" /></div>
            <span className="evp__n">{e.n}</span>
            <div className="evp__c">
              <span className="caps caps--aqua">{e.tag}</span>
              <h3>{e.title}</h3>
              <p>{e.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
