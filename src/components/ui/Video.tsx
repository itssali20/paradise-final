"use client";
import { useEffect, useRef } from "react";
import { mx, mxPoster } from "@/content/media";

type Props = {
  src?: string;
  srcMobile?: string;
  mixkit?: string;
  poster?: string;
  className?: string;
  eager?: boolean;
  /** play only while visible (default) — set false when a parent controls playback */
  autoplay?: boolean;
  label?: string;
  /** when set, the clip only plays while it is the active one (e.g. a slide in a pinned stack) */
  active?: boolean;
};

/** Background video: loads near the viewport, plays only while visible, picks a lighter file on phones. */
export default function Video({ src, srcMobile, mixkit, poster, className, eager, autoplay = true, label, active }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const visible = useRef(false);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const v = ref.current;
    if (!v || active === undefined) return;
    if (active && visible.current) { const p = v.play(); if (p) p.catch(() => {}); }
    else v.pause();
  }, [active]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const small = window.matchMedia("(max-width: 760px)").matches;
    const load = () => {
      if (v.dataset.loaded) return;
      v.dataset.loaded = "1";
      const urls = mixkit
        ? small ? [mx(mixkit, "360"), mx(mixkit, "720")] : [mx(mixkit, "720"), mx(mixkit, "360")]
        : [small && srcMobile ? srcMobile : src!];
      urls.forEach((u) => {
        const s = document.createElement("source");
        s.src = u;
        s.type = "video/mp4";
        v.appendChild(s);
      });
      v.load();
    };
    const play = () => { load(); const p = v.play(); if (p) p.catch(() => {}); };
    if (eager) play();
    const near = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && load()), { rootMargin: "120% 0px" });
    const vis = new IntersectionObserver(
      (es) => es.forEach((e) => {
        visible.current = e.isIntersecting;
        if (!autoplay) return;
        if (e.isIntersecting && activeRef.current !== false) play(); else v.pause();
      }),
      { threshold: 0.05 },
    );
    near.observe(v);
    vis.observe(v);
    return () => { near.disconnect(); vis.disconnect(); };
  }, [src, srcMobile, mixkit, eager, autoplay]);

  return (
    <video
      ref={ref}
      className={className}
      muted
      loop
      playsInline
      preload={eager ? "auto" : "none"}
      poster={poster ?? (mixkit ? mxPoster(mixkit) : undefined)}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
