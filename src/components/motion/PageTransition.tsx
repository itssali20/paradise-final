"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger, prefersReduced, scrollToTarget } from "@/lib/gsap";

const WAVE = "M0,120 C240,40 480,40 720,90 C960,140 1200,140 1440,70 L1440,160 L0,160 Z";
const WAVE_2 = "M0,90 C260,150 520,150 760,80 C1000,10 1220,30 1440,110 L1440,160 L0,160 Z";

/** Aqua wave page transition. Intercepts internal link clicks, covers, navigates, then reveals. */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const covering = useRef(false);
  const failSafe = useRef<number>(0);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element)?.closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("http") && !href.startsWith(location.origin)) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;

      // same page → smooth scroll to hash, let Next handle query-only changes
      if (url.pathname === location.pathname) {
        if (url.hash) {
          e.preventDefault();
          scrollToTarget(url.hash);
        }
        return;
      }
      // dashboard areas navigate instantly
      if (url.pathname.startsWith("/admin") || location.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return;
      if (prefersReduced()) return;

      e.preventDefault();
      cover(() => router.push(url.pathname + url.search + url.hash));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  function cover(then: () => void) {
    const el = root.current;
    if (!el || covering.current) return;
    covering.current = true;
    const panels = el.querySelectorAll(".ptrans__panel");
    const paths = el.querySelectorAll<SVGPathElement>(".ptrans__panel svg:not(.b) path");
    gsap.timeline({ onComplete: then })
      .set(el, { visibility: "visible" })
      .set(panels, { yPercent: 100 })
      .to(panels, { yPercent: 0, duration: 0.9, ease: "expo.inOut", stagger: 0.08 })
      .fromTo(paths, { attr: { d: WAVE_2 } }, { attr: { d: WAVE }, duration: 0.9, ease: "sine.inOut" }, 0)
      .to(".ptrans__logo", { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }, 0.55);
    failSafe.current = window.setTimeout(reveal, 5000);
  }

  function reveal() {
    const el = root.current;
    if (!el || !covering.current) return;
    window.clearTimeout(failSafe.current);
    covering.current = false;
    scrollToTarget(0, true);
    ScrollTrigger.refresh();
    const panels = Array.from(el.querySelectorAll(".ptrans__panel")).reverse();
    gsap.timeline({ onComplete: () => { gsap.set(el, { visibility: "hidden" }); ScrollTrigger.refresh(); } })
      .to(".ptrans__logo", { opacity: 0, scale: 0.94, duration: 0.35, ease: "power2.in" })
      .to(panels, { yPercent: -110, duration: 1, ease: "expo.inOut", stagger: 0.08 }, 0.15)
      .from("main", { y: 80, duration: 1.2, ease: "expo.out", clearProps: "transform" }, 0.45);
  }

  useEffect(() => {
    if (covering.current) {
      // give the new page one frame to paint before revealing
      requestAnimationFrame(() => requestAnimationFrame(reveal));
    } else {
      window.scrollTo(0, 0);
    }
    document.body.classList.remove("menu-open");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="ptrans" ref={root} aria-hidden="true">
      <div className="ptrans__panel ptrans__panel--2">
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none"><path d={WAVE} /></svg>
      </div>
      <div className="ptrans__panel">
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none"><path d={WAVE} /></svg>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ptrans__logo" src="/brand/logo-600.webp" alt="" />
      </div>
    </div>
  );
}
