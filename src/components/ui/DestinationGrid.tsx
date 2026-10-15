"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, Flip, ScrollTrigger, useGSAP, prefersReduced } from "@/lib/gsap";
import { img } from "@/content/media";
import { REGIONS, type Destination } from "@/content/destinations";

/** Filterable editorial grid of destinations (Flip-animated). */
export default function DestinationGrid({ items }: { items: Destination[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [region, setRegion] = useState<string>("All");

  useGSAP(() => {
    if (prefersReduced()) return;
    ScrollTrigger.batch(".dcard", { start: "top 92%", once: true, onEnter: (b) => gsap.from(b, { y: 80, opacity: 0, stagger: 0.08, duration: 1.2, ease: "expo.out" }) });
  }, { scope: root });

  const pick = (r: string) => {
    const els = root.current!.querySelectorAll(".dcard");
    const state = Flip.getState(els);
    setRegion(r);
    requestAnimationFrame(() => {
      if (prefersReduced()) return;
      Flip.from(state, {
        duration: 0.9, ease: "expo.inOut", absolute: true, scale: true,
        onEnter: (e) => gsap.fromTo(e, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6 }),
        onLeave: (e) => gsap.to(e, { opacity: 0, scale: 0.9, duration: 0.4 }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    });
  };

  return (
    <div ref={root}>
      <div className="filters" role="group" aria-label="Filter by region">
        {["All", ...REGIONS].map((r) => (
          <button key={r} aria-pressed={region === r} onClick={() => pick(r)}>{r}</button>
        ))}
      </div>
      <div className="dgrid">
        {items.map((d) => (
          <Link key={d.slug} href={`/destinations/${d.slug}`} className={`dcard ripple-hover${region !== "All" && d.region !== region ? " is-hidden" : ""}`} data-cursor="Explore">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="media"><img src={img(d.image, 1400)} alt={d.name} loading="lazy" /></div>
            <div className="dcard__b">
              <span className="caps caps--aqua">{d.area}</span>
              <h3>{d.name}</h3>
              <p>{d.tagline}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
