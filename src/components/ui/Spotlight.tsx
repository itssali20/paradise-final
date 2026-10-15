"use client";
import { useEffect, useRef } from "react";
import { gsap, isTouch } from "@/lib/gsap";

/** A stage light that follows the pointer (drifts on its own on touch screens). GPU transform only. */
export default function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const host = el.parentElement!;
    const place = (fx: number, fy: number) => ({ x: host.clientWidth * fx, y: host.clientHeight * fy });
    gsap.set(el, place(0.5, 0.3));
    if (isTouch()) {
      const t = gsap.to(el, { ...place(0.7, 0.45), duration: 6, yoyo: true, repeat: -1, ease: "sine.inOut" });
      return () => { t.kill(); };
    }
    const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
    };
    host.addEventListener("pointermove", move, { passive: true });
    return () => host.removeEventListener("pointermove", move);
  }, []);
  return <div className="spot" ref={ref} aria-hidden="true" />;
}
