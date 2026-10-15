"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReduced } from "@/lib/gsap";
import { img } from "@/content/media";

type D = { slug: string; name: string; area: string; image: string; tagline: string };

/** Full-screen destination wipe slider with autoplay progress, list and swipe. */
export default function DestinationSlider({ items }: { items: D[] }) {
  const root = useRef<HTMLElement>(null);
  const [idx, setIdx] = useState(0);
  const state = useRef({ idx: 0, busy: false, timer: null as gsap.core.Tween | null, visible: false });

  const { contextSafe } = useGSAP(() => {
    const st = state.current;
    if (prefersReduced()) return;
    ScrollTrigger.create({
      trigger: root.current, start: "top 60%", end: "bottom 40%",
      onToggle: (s) => { st.visible = s.isActive; if (st.timer) (s.isActive ? st.timer.play() : st.timer.pause()); },
    });
    gsap.fromTo(".dslide.on img", { scale: 1.2 }, { scale: 1.04, duration: 8, ease: "power1.out", scrollTrigger: { trigger: root.current, start: "top 80%", once: true } });
    restart();
    return () => st.timer?.kill();
  }, { scope: root });

  const restart = contextSafe(() => {
    const st = state.current;
    st.timer?.kill();
    if (prefersReduced()) return;
    gsap.set(".dest__prog", { scaleX: 0 });
    st.timer = gsap.to(".dest__prog", { scaleX: 1, duration: 7, ease: "none", paused: !st.visible, onComplete: () => go(st.idx + 1) });
  });

  const go = contextSafe((to: number) => {
    const st = state.current;
    const n = items.length;
    const i = ((to % n) + n) % n;
    if (i === st.idx || st.busy) return;
    const slides = gsap.utils.toArray<HTMLElement>(".dslide", root.current);
    const prev = slides[st.idx], next = slides[i];
    st.idx = i;
    if (prefersReduced()) {
      prev.classList.remove("on"); next.classList.add("on"); setIdx(i); return;
    }
    st.busy = true;
    gsap.set(next, { visibility: "visible", zIndex: 2, clipPath: "inset(0 0 0 100%)" });
    gsap.set(prev, { zIndex: 1 });
    gsap.to(next, {
      clipPath: "inset(0 0 0 0%)", duration: 1.4, ease: "expo.inOut",
      onComplete: () => { prev.classList.remove("on"); gsap.set(prev, { visibility: "hidden", clearProps: "zIndex" }); next.classList.add("on"); st.busy = false; },
    });
    gsap.fromTo(next.querySelector("img"), { scale: 1.2 }, { scale: 1.04, duration: 8, ease: "power1.out" });
    gsap.to(".dest__name span", {
      yPercent: 110, duration: 0.5, ease: "expo.in",
      onComplete: () => { setIdx(i); gsap.fromTo(".dest__name span", { yPercent: -110 }, { yPercent: 0, duration: 0.9, ease: "expo.out" }); },
    });
    gsap.fromTo(".dest__body", { opacity: 1 }, { opacity: 0, duration: 0.4, yoyo: true, repeat: 1 });
    restart();
  });

  const touchX = useRef(0);
  const d = items[idx];

  return (
    <section
      className="dest" ref={root} aria-roledescription="carousel" aria-label="Destinations"
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 60) go(state.current.idx + (dx < 0 ? 1 : -1)); }}
    >
      {items.map((it, i) => (
        <div key={it.slug} className={`dslide shade-left${i === 0 ? " on" : ""}`} aria-hidden={i !== idx}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="media"><img src={img(it.image, 2000)} alt={it.name} loading={i < 2 ? "eager" : "lazy"} /></div>
        </div>
      ))}
      <div className="dest__c">
        <div className="dest__txt">
          <span className="caps caps--aqua">{d.area}</span>
          <h2 className="dest__name"><span>{d.name}</span></h2>
          <p className="dest__body">{d.tagline}</p>
          <div className="dest__nav">
            <button className="circ" onClick={() => go(state.current.idx - 1)} aria-label="Previous destination">←</button>
            <span className="dest__count">{String(idx + 1).padStart(2, "0")} / {items.length}</span>
            <button className="circ" onClick={() => go(state.current.idx + 1)} aria-label="Next destination">→</button>
            <Link className="btn btn--ghost btn--sm" href={`/destinations/${d.slug}`}>Explore {d.name.split(" · ")[0]}</Link>
          </div>
        </div>
        <ul className="dest__list">
          {items.map((it, i) => (
            <li key={it.slug}><button className={i === idx ? "on" : ""} onClick={() => go(i)}>{it.name}</button></li>
          ))}
        </ul>
      </div>
      <div className="dest__prog" />
    </section>
  );
}
