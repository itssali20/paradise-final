"use client";
import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReduced } from "@/lib/gsap";

/** Infinite marquee whose speed and direction react to scroll velocity. */
export default function Marquee({ children, speed = 40, reverse = false, className = "" }: { children: ReactNode; speed?: number; reverse?: boolean; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (prefersReduced()) return;
    const tracks = gsap.utils.toArray<HTMLElement>(".marquee__track", root.current);
    const w = tracks[0].offsetWidth;
    const dir = reverse ? 1 : -1;
    let x = reverse ? -w : 0;
    let boost = 0;
    let sign = 1;
    const st = ScrollTrigger.create({
      trigger: root.current, start: "top bottom", end: "bottom top",
      onUpdate: (s) => {
        const v = s.getVelocity();
        boost = gsap.utils.clamp(0, 14, Math.abs(v) / 200);
        if (Math.abs(v) > 60) sign = v < 0 ? -1 : 1;
      },
    });
    const tick = (_t: number, dt: number) => {
      if (!st.isActive) return; // off-screen marquees cost nothing
      boost *= 0.94;
      x += dir * sign * speed * (1 + boost * 0.3) * (dt / 1000);
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      gsap.set(tracks, { x });
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); st.kill(); };
  }, { scope: root });
  return (
    <div className={`marquee ${className}`} ref={root} aria-hidden="true">
      <div className="marquee__track">{children}</div>
      <div className="marquee__track">{children}</div>
    </div>
  );
}
