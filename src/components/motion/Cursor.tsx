"use client";
import { useEffect, useRef } from "react";
import { gsap, isTouch } from "@/lib/gsap";

/** Blend-mode cursor: a dot, a trailing ring, and a label over media ("Play", "View", "Drag"). */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || isTouch()) return;
    const dot = el.querySelector(".cursor__dot")!, ring = el.querySelector(".cursor__ring")!;
    const label = el.querySelector("span")!;
    const dx = gsap.quickTo(dot, "x", { duration: 0.08 }), dy = gsap.quickTo(dot, "y", { duration: 0.08 });
    const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" }), ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
    const move = (e: PointerEvent) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); };
    const over = (e: PointerEvent) => {
      const t = e.target as Element;
      const lab = t.closest<HTMLElement>("[data-cursor]");
      el.classList.toggle("is-label", !!lab);
      if (lab) label.textContent = lab.dataset.cursor || "View";
      el.classList.toggle("is-hover", !lab && !!t.closest("a,button,[role=button],input,select,textarea,label"));
    };
    gsap.set(el, { opacity: 0 });
    const show = () => gsap.to(el, { opacity: 1, duration: 0.3 });
    const hide = () => gsap.to(el, { opacity: 0, duration: 0.3 });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerenter", show);
    document.addEventListener("pointerleave", hide);
    window.addEventListener("pointermove", show, { once: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.removeEventListener("pointerenter", show);
      document.removeEventListener("pointerleave", hide);
    };
  }, []);
  return (
    <div className="cursor" ref={root} aria-hidden="true">
      <div className="cursor__ring"><span /></div>
      <div className="cursor__dot" />
    </div>
  );
}
