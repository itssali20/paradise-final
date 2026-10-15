"use client";
import { useEffect } from "react";
import { ScrollTrigger, prefersReduced } from "@/lib/gsap";

/**
 * Native scrolling (no scroll-jacking — it's the fastest, smoothest option on every device),
 * plus a debounced ScrollTrigger refresh whenever the page height changes as media loads.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReduced()) document.documentElement.classList.add("reduced");
    document.documentElement.style.scrollBehavior = "auto";
    let timer = 0;
    let lastH = 0;
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - lastH) < 40) return;
      lastH = h;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    });
    ro.observe(document.body);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => { ro.disconnect(); window.clearTimeout(timer); };
  }, []);
  return null;
}
