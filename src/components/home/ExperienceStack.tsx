"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReduced, scrollToTarget } from "@/lib/gsap";
import Video from "@/components/ui/Video";
import { img } from "@/content/media";

export type Slide = { name: string; title: string; em: string; text: string; mixkit?: string; image?: string };

/** Pinned full-screen stack: each experience wipes up over the last while the previous one sinks away. */
export default function ExperienceStack({ slides, tag = "The experiences" }: { slides: Slide[]; tag?: string }) {
  const root = useRef<HTMLElement>(null);
  const [cur, setCur] = useState(0);
  const stRef = useRef<{ start: number; end: number } | null>(null);

  useGSAP(() => {
    const els = gsap.utils.toArray<HTMLElement>(".slide", root.current);
    if (prefersReduced()) return;
    gsap.set(els, { zIndex: (i) => i + 1 });
    gsap.set(els.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root.current, start: "top top", end: () => "+=" + els.length * window.innerHeight, scrub: 1, pin: true, anticipatePin: 1,
        onUpdate: (s) => setCur(Math.min(els.length - 1, Math.round(s.progress * (els.length - 1)))),
        onRefresh: (s) => { stRef.current = { start: s.start, end: s.end }; },
      },
    });
    els.forEach((s, i) => {
      if (!i) return;
      const prev = els[i - 1];
      tl.to(s, { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut", duration: 1 }, i - 1)
        .fromTo(s.querySelector(".media"), { scale: 1.3 }, { scale: 1, ease: "power2.out", duration: 1 }, i - 1)
        .to(prev.querySelector(".media"), { scale: 1.12, yPercent: -12, ease: "power2.in", duration: 1 }, i - 1)
        .fromTo(s.querySelectorAll(".slide__c > div > *"), { y: 80, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.5, ease: "power3.out" }, i - 0.45);
    });
  }, { scope: root });

  const jump = (i: number) => {
    const st = stRef.current;
    if (!st) return;
    scrollToTarget(st.start + (st.end - st.start) * (i / (slides.length - 1)));
  };

  return (
    <section className="exp" ref={root} aria-label={tag}>
      <span className="exp__tag caps caps--aqua">{tag}</span>
      {slides.map((s, i) => (
        <div className="slide" key={s.name}>
          <div className="media shade">
            {s.mixkit ? <Video mixkit={s.mixkit} poster={s.image ? img(s.image, 1600) : undefined} active={i === cur} /> : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img(s.image, 2000)} alt="" loading="lazy" />
            )}
          </div>
          <div className="slide__c">
            <div>
              <span className="slide__n">{String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
              <h3>{s.title} <em className="chrome">{s.em}</em></h3>
              <p>{s.text}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="exp__idx">
        {slides.map((s, i) => (
          <button key={s.name} className={i === cur ? "on" : ""} onClick={() => jump(i)}>{s.name}</button>
        ))}
      </div>
    </section>
  );
}
