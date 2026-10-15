"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };

export const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isTouch = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;

type LenisLike = { scrollTo: (t: number | string | HTMLElement, o?: Record<string, unknown>) => void; stop: () => void; start: () => void };
export const lenis = (): LenisLike | undefined =>
  typeof window !== "undefined" ? (window as unknown as { __lenis?: LenisLike }).__lenis : undefined;

export function scrollToTarget(target: number | string | HTMLElement, immediate = false) {
  const l = lenis();
  if (l) l.scrollTo(target, { duration: 1.6, immediate, offset: typeof target === "number" ? 0 : -20 });
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  }
}

export function lockScroll(on: boolean) {
  document.documentElement.style.overflow = on ? "hidden" : "";
  const l = lenis();
  if (l) (on ? l.stop() : l.start());
}
