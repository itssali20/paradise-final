"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, SplitText, prefersReduced, isTouch } from "@/lib/gsap";

/**
 * Declarative motion engine. Server-rendered markup opts in with data attributes:
 *  data-reveal            fade-up on enter        (="fade" | "clip" | "left" | "right" | "zoom")
 *  data-stagger           children fade-up, staggered
 *  data-split             SplitText reveal        (="lines" | "words" | "chars")
 *  data-parallax="12"     image parallax inside its frame (percent)
 *  data-count="40000"     number counter          (data-prefix / data-suffix)
 *  data-fill              words fill from 15% → 100% as you scroll
 *  data-magnetic          element follows the pointer slightly
 *  data-scrub-scale       media scales 1.25 → 1 while scrolling into view
 * Content is fully visible without JS; animations only start once the engine runs.
 */
export default function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    // graceful fallback for any broken remote image
    const onErr = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t?.tagName === "IMG") {
        t.style.visibility = "hidden";
        t.closest(".media, .frame")?.classList.add("is-broken");
      }
    };
    document.addEventListener("error", onErr, true);
    return () => document.removeEventListener("error", onErr, true);
  }, []);

  useEffect(() => {
    if (prefersReduced()) return;
    const splits: SplitText[] = [];
    const cleanups: (() => void)[] = [];

    let ctx: gsap.Context | null = null;
    let cancelled = false;
    const run = () => { if (!cancelled) ctx = gsap.context(build); };
    const build = () => {
      const q = <T extends Element = HTMLElement>(sel: string) => Array.from(document.querySelectorAll<T & HTMLElement>(sel));
      const st = (el: Element, start = "top 88%") => ({ trigger: el, start, once: true });

      q("[data-reveal]").forEach((el) => {
        if (el.closest("[data-motion-skip]")) return;
        const kind = el.dataset.reveal;
        const vars: gsap.TweenVars = { duration: 1.4, ease: "expo.out", scrollTrigger: st(el) };
        if (kind === "fade") gsap.from(el, { opacity: 0, ...vars });
        else if (kind === "clip") gsap.from(el, { clipPath: "inset(18% 12% 18% 12%)", duration: 1.8, ease: "expo.inOut", scrollTrigger: st(el, "top 85%") });
        else if (kind === "left") gsap.from(el, { x: -80, opacity: 0, ...vars });
        else if (kind === "right") gsap.from(el, { x: 80, opacity: 0, ...vars });
        else if (kind === "zoom") gsap.from(el, { scale: 0.86, opacity: 0, ...vars });
        else gsap.from(el, { y: 60, opacity: 0, ...vars });
      });

      q("[data-stagger]").forEach((el) => {
        gsap.from(Array.from(el.children), {
          y: 60, opacity: 0, duration: 1.2, ease: "expo.out", stagger: Number(el.dataset.stagger) || 0.08,
          scrollTrigger: st(el),
        });
      });

      q("[data-split]").forEach((el) => {
        const type = (el.dataset.split || "lines") as "lines" | "words" | "chars";
        const split = SplitText.create(el, {
          type: type === "chars" ? "lines,words,chars" : "lines,words",
          mask: "lines",
          linesClass: "split-line",
          wordsClass: "split-word",
          charsClass: "split-char",
        });
        splits.push(split);
        const targets = type === "chars" ? split.chars : type === "words" ? split.words : split.lines;
        gsap.from(targets, {
          yPercent: 115, rotate: type === "lines" ? 0 : 4, duration: 1.3, ease: "expo.out",
          stagger: type === "chars" ? 0.022 : type === "words" ? 0.05 : 0.1,
          scrollTrigger: st(el, "top 90%"),
          // hand the text back as one clean element: one continuous chrome gradient, nothing left to ghost
          onComplete: () => split.revert(),
        });
      });

      q("[data-parallax]").forEach((el) => {
        const amt = Number(el.dataset.parallax) || 10;
        gsap.fromTo(el, { yPercent: -amt, scale: 1 + amt / 50 }, {
          yPercent: amt, scale: 1 + amt / 50, ease: "none",
          scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      q("[data-scrub-scale]").forEach((el) => {
        gsap.fromTo(el, { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "top top", scrub: true } });
      });

      q("[data-count]").forEach((el) => {
        const to = Number(el.dataset.count) || 0;
        const pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
        const o = { v: 0 };
        el.textContent = pre + "0" + suf;
        gsap.to(o, {
          v: to, duration: 2.4, ease: "power3.out", scrollTrigger: st(el),
          onUpdate: () => { el.textContent = pre + Math.round(o.v).toLocaleString("en-US") + suf; },
        });
      });

      q("[data-fill]").forEach((el) => {
        const split = SplitText.create(el, { type: "words", wordsClass: "fill-word" });
        splits.push(split);
        gsap.fromTo(split.words, { opacity: 0.14 }, {
          opacity: 1, stagger: 0.08, ease: "none",
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
        });
      });

      if (!isTouch()) {
        q("[data-magnetic]").forEach((el) => {
          const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
          const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
          const move = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
            yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
          };
          const leave = () => { xTo(0); yTo(0); };
          el.addEventListener("mousemove", move);
          el.addEventListener("mouseleave", leave);
          cleanups.push(() => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); });
        });
      }
    };

    // split only once the web fonts are in, so line breaks never change after splitting
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1200))]).then(run);

    const id = window.setTimeout(() => ScrollTrigger.refresh(), 1400);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.clearTimeout(id);
      window.removeEventListener("load", onLoad);
      cleanups.forEach((f) => f());
      cancelled = true;
      splits.forEach((s) => s.revert());
      ctx?.revert();
    };
  }, [pathname]);

  return null;
}
