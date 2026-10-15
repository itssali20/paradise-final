"use client";
import { useEffect, useRef } from "react";
import { gsap, lockScroll } from "@/lib/gsap";

export type LbItem = { type: "img" | "video"; src: string; caption?: string };

/** Accessible full-screen viewer with keyboard navigation and focus trap. */
export default function Lightbox({ items, index, onClose, onIndex }: { items: LbItem[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const open = index !== null;
  const item = open ? items[index!] : null;

  useEffect(() => {
    if (!open) return;
    const last = document.activeElement as HTMLElement | null;
    lockScroll(true);
    ref.current?.querySelector<HTMLButtonElement>(".lb__x")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (items.length > 1 && e.key === "ArrowRight") onIndex((index! + 1) % items.length);
      if (items.length > 1 && e.key === "ArrowLeft") onIndex((index! - 1 + items.length) % items.length);
      if (e.key === "Tab" && ref.current) {
        const f = Array.from(ref.current.querySelectorAll<HTMLElement>("button,video[controls]"));
        if (!f.length) return;
        const first = f[0], end = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); end.focus(); }
        else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", key);
    gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    return () => { window.removeEventListener("keydown", key); lockScroll(false); last?.focus?.({ preventScroll: true }); };
  }, [open, index, items.length, onClose, onIndex]);

  useEffect(() => {
    if (!open) return;
    gsap.fromTo(".lb__stage > *", { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" });
  }, [open, index]);

  if (!open || !item) return null;
  return (
    <div className="lb" ref={ref} role="dialog" aria-modal="true" aria-label={item.caption || "Viewer"}>
      <div className="lb__top">
        <span className="caps caps--dim">{item.caption} {items.length > 1 ? `· ${index! + 1} / ${items.length}` : ""}</span>
        <button className="circ lb__x" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div className="lb__stage" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {item.type === "img"
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={item.src} alt={item.caption || ""} />
          : <video src={item.src} controls autoPlay playsInline />}
      </div>
      {items.length > 1 && (
        <div className="lb__nav">
          <button className="circ" onClick={() => onIndex((index! - 1 + items.length) % items.length)} aria-label="Previous">←</button>
          <button className="circ" onClick={() => onIndex((index! + 1) % items.length)} aria-label="Next">→</button>
        </div>
      )}
    </div>
  );
}
