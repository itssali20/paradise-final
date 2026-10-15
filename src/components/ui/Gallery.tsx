"use client";
import { useCallback, useRef, useState } from "react";
import { gsap, Flip, ScrollTrigger, useGSAP, prefersReduced } from "@/lib/gsap";
import { img, mx, mxPoster, VIDEO } from "@/content/media";
import type { GalleryItem } from "@/content/program";
import Lightbox, { type LbItem } from "./Lightbox";

const CATS = ["All", "Models", "Nights", "Resorts", "Adventure"] as const;

/** Masonry gallery: Flip-animated filters, staggered reveals and a lightbox. */
export function Gallery({ items }: { items: GalleryItem[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [open, setOpen] = useState<number | null>(null);
  const visible = items.filter((i) => cat === "All" || i.cat === cat);

  useGSAP(() => {
    if (prefersReduced()) return;
    ScrollTrigger.batch(".gi", { start: "top 95%", once: true, onEnter: (b) => gsap.from(b, { y: 70, opacity: 0, stagger: 0.06, duration: 1.1, ease: "expo.out" }) });
  }, { scope: root });

  const filter = (c: (typeof CATS)[number]) => {
    if (!root.current) return;
    const els = root.current.querySelectorAll(".gi");
    const state = Flip.getState(els);
    setCat(c);
    requestAnimationFrame(() => {
      els.forEach((el) => {
        const show = c === "All" || (el as HTMLElement).dataset.cat === c;
        el.classList.toggle("is-hidden", !show);
      });
      if (!prefersReduced()) {
        Flip.from(state, { duration: 0.8, ease: "expo.inOut", absolute: true, onEnter: (e) => gsap.fromTo(e, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6 }), onLeave: (e) => gsap.to(e, { opacity: 0, scale: 0.9, duration: 0.4 }), onComplete: () => ScrollTrigger.refresh() });
      }
    });
  };

  const lbItems: LbItem[] = visible.map((i) => ({ type: "img", src: img(i.src, 2000), caption: i.alt }));
  const close = useCallback(() => setOpen(null), []);

  return (
    <div ref={root}>
      <div className="filters" role="group" aria-label="Filter gallery">
        {CATS.map((c) => (
          <button key={c} aria-pressed={cat === c} onClick={() => filter(c)}>{c}</button>
        ))}
      </div>
      <div className="gal">
        {items.map((it) => (
          <button
            key={it.src}
            className={`gi${cat !== "All" && it.cat !== cat ? " is-hidden" : ""}`}
            data-cat={it.cat}
            data-cursor="View"
            style={{ ["--ar" as string]: it.ar }}
            onClick={() => setOpen(visible.findIndex((v) => v.src === it.src))}
            aria-label={`Open photo: ${it.alt}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(it.src, 800)} alt={it.alt} loading="lazy" />
          </button>
        ))}
      </div>
      <Lightbox items={lbItems} index={open} onClose={close} onIndex={setOpen} />
    </div>
  );
}

/** Promo film + mood clips. */
export function Films({ films }: { films: { id: string; title: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const items: LbItem[] = [
    { type: "video", src: VIDEO.promo, caption: "Paradise Club · Preview" },
    ...films.map((f) => ({ type: "video" as const, src: mx(f.id, "720"), caption: `${f.title} · mood film` })),
  ];
  const close = useCallback(() => setOpen(null), []);
  return (
    <>
      <button className="film-main" data-reveal="clip" data-cursor="Play" onClick={() => setOpen(0)} aria-label="Play the Paradise Club preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={VIDEO.promoPoster} alt="" loading="lazy" />
        <span className="play">Play</span>
        <span className="caps" style={{ position: "absolute", left: 28, bottom: 24, zIndex: 2 }}>Paradise Club · Preview film</span>
      </button>
      <div className="film-grid" data-stagger>
        {films.map((f, i) => (
          <button key={f.id} className="fthumb" data-cursor="Play" onClick={() => setOpen(i + 1)} aria-label={`Play ${f.title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mxPoster(f.id)} alt="" loading="lazy" />
            <span>{f.title}</span>
          </button>
        ))}
      </div>
      <Lightbox items={items} index={open} onClose={close} onIndex={setOpen} />
    </>
  );
}
