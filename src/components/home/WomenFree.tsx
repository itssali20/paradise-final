"use client";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, prefersReduced } from "@/lib/gsap";
import { VIDEO } from "@/content/media";
import Video from "@/components/ui/Video";

/**
 * "…for ladies: COMPLIMENTARY BY INVITATION" — giant type cut out of a dark veil so the film plays
 * inside the letters. Scrolling zooms through the words until the whole screen is the film.
 */
export default function WomenFree({ cta = true }: { cta?: boolean }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (prefersReduced()) {
      gsap.set(".wf__after", { opacity: 1 });
      return;
    }
    gsap.from(".wf__line", { y: 120, opacity: 0, stagger: 0.14, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 65%", once: true } });
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=200%", scrub: 1, pin: true, anticipatePin: 1 } });
    tl.to({}, { duration: 0.3 })
      .to(".wf__mask", { scale: 9, transformOrigin: "50% 66%", ease: "power2.in", duration: 1.2 }, ">")
      .to(".wf__outline", { opacity: 0, duration: 0.3 }, "<0.25")
      .to(".wf__veil", { opacity: 0, ease: "power1.in", duration: 0.55 }, "<0.25")
      .to(".wf__after", { opacity: 1, duration: 0.4 }, ">")
      .from(".wf__after > *", { y: 50, stagger: 0.1, duration: 0.4 }, "<");
  }, { scope: root });

  const lines = (
    <>
      <text className="wf__line" x="800" y="200" textAnchor="middle" fontSize="96" fontStyle="italic" fontWeight="400">…for ladies</text>
      <text className="wf__line" x="800" y="455" textAnchor="middle" fontSize="240" textLength="1480" lengthAdjust="spacingAndGlyphs">COMPLIMENTARY</text>
      <text className="wf__line" x="800" y="740" textAnchor="middle" fontSize="250" textLength="1480" lengthAdjust="spacingAndGlyphs">BY INVITATION</text>
    </>
  );

  return (
    <section className="wf" ref={root} aria-label="For ladies: complimentary attendance by invitation">
      <div className="media"><Video src={VIDEO.ladiesDesktop} srcMobile={VIDEO.ladiesMobile} poster={VIDEO.ladiesPoster} /></div>
      <div className="wf__glow" />
      <svg className="wf__mask" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" style={{ overflow: "visible" }} aria-hidden="true">
        <defs>
          <mask id="wf-cut" maskUnits="userSpaceOnUse" x="-8000" y="-8000" width="17600" height="16900">
            <rect x="-8000" y="-8000" width="17600" height="16900" fill="white" />
            <g fill="black" fontFamily="'Bodoni Moda Variable', Didot, serif" fontWeight="600">{lines}</g>
          </mask>
          <linearGradient id="wf-chrome" x1="0" x2="1" y1="0" y2="0.3">
            <stop offset="0" stopColor="#7d8894" />
            <stop offset="0.25" stopColor="#ffffff" />
            <stop offset="0.5" stopColor="#9aa6b2" />
            <stop offset="0.7" stopColor="#ffffff" />
            <stop offset="1" stopColor="#8d99a6" />
          </linearGradient>
        </defs>
        <rect className="wf__veil" x="-8000" y="-8000" width="17600" height="16900" fill="#03060b" mask="url(#wf-cut)" />
        <g className="wf__outline" fill="none" stroke="url(#wf-chrome)" strokeWidth="2.2" fontFamily="'Bodoni Moda Variable', Didot, serif" fontWeight="600">{lines}</g>
      </svg>
      <div className="wf__after">
        <h3 className="chrome">Complimentary attendance.<br /><em>By invitation.</em></h3>
        <div className="stack-s" style={{ maxWidth: 460 }}>
          <p>Selected eligible ladies may receive complimentary event admission. Depending on the confirmed package, invitations may also include resort accommodation, dining, entertainment and selected activities. Exact inclusions are provided before invitations are accepted.</p>
          {cta && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
              <Link className="btn btn--chrome" href="/ladies#apply" data-magnetic>Apply to attend</Link>
              <Link className="btn btn--ghost" href="/ladies">What&apos;s included</Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
