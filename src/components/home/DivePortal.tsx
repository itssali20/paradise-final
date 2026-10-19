"use client";
import { useRef } from "react";
import { gsap, useGSAP, prefersReduced } from "@/lib/gsap";
import Video from "@/components/ui/Video";
import { CLIPS } from "@/content/media";

/** Pinned "Dive in." — a porthole of reef footage widens until it swallows the screen. */
export default function DivePortal() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (prefersReduced()) return;
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=170%", scrub: 1, pin: true, anticipatePin: 1 } });
    tl.fromTo(".portal", { clipPath: "circle(10% at 50% 55%)" }, { clipPath: "circle(78% at 50% 50%)", ease: "power2.in" }, 0)
      .fromTo(".dive .media.top", { scale: 1 }, { scale: 1.4, ease: "none" }, 0)
      .fromTo(".portal .media", { scale: 1.45 }, { scale: 1, ease: "none" }, 0)
      .fromTo(".dive__t", { opacity: 1, y: 0 }, { opacity: 0, y: -90, ease: "power1.in" }, 0.45);
  }, { scope: root });

  return (
    <section className="dive" ref={root} aria-label="Dive in">
      <div className="media top"><Video mixkit={CLIPS.turquoise} poster="/media/dest-bahamas.webp" /></div>
      <div className="portal"><div className="media"><Video mixkit={CLIPS.underwater} poster="/media/act-coral.webp" /></div></div>
      <div className="dive__t">
        <span className="caps">Crystalline sand · turquoise water</span>
        <div className="display chrome">Dive in.</div>
        <p>Turquoise waters, pristine white-sand beaches and fascinating singles from around the world.</p>
      </div>
    </section>
  );
}
