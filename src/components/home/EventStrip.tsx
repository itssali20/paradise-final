"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReduced, isTouch } from "@/lib/gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { img } from "@/content/media";

if (typeof window !== "undefined") gsap.registerPlugin(Draggable, InertiaPlugin);

export type StripEvent = {
  slug: string; dest: string; month: string; year: number; dates: string; image: string | null;
  fromPrice: string; roomsLeft: number; roomsTotal: number; start: string;
};

function useCountdown(to: string | undefined) {
  const [t, setT] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  useEffect(() => {
    if (!to) return;
    const end = new Date(to).getTime();
    const tick = () => {
      const ms = Math.max(0, end - Date.now());
      setT({ d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [to]);
  return t;
}

/** "A new paradise every month" — draggable passport cards with live availability and a countdown. */
export default function EventStrip({ events, title = true }: { events: StripEvent[]; title?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const cd = useCountdown(events[0]?.start);

  useGSAP(() => {
    if (prefersReduced()) return;
    gsap.from(".pass", { x: 160, opacity: 0, rotate: 3, stagger: 0.07, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 70%", once: true } });
    if (!isTouch() && wrap.current) {
      Draggable.create(wrap.current, { type: "scrollLeft", inertia: true, edgeResistance: 0.85, cursor: "grab", activeCursor: "grabbing", allowContextMenu: true, minimumMovement: 6 });
    }
    gsap.to(".pass__stamp", { rotate: 8, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
  }, { scope: root });

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="estrip" ref={root} aria-label="Upcoming events">
      <div className="estrip__head">
        <div>
          {title && <span className="caps caps--aqua eyebrow">A new paradise every month</span>}
          {title && <h2 className="h2" style={{ marginTop: 18 }} data-split="words">Twelve months. <em className="chrome">Twelve resorts.</em></h2>}
        </div>
        {cd && events[0] && (
          <div>
            <span className="caps caps--dim">Next departure · {events[0].dest}</span>
            <div className="countdown" style={{ marginTop: 14 }} aria-label="Countdown to next event">
              <div><b>{cd.d}</b><span>Days</span></div>
              <div><b>{pad(cd.h)}</b><span>Hours</span></div>
              <div><b>{pad(cd.m)}</b><span>Min</span></div>
              <div><b className="aqua-text">{pad(cd.s)}</b><span>Sec</span></div>
            </div>
          </div>
        )}
      </div>
      <div ref={wrap} style={{ overflowX: "auto", scrollbarWidth: "none" }} data-cursor="Drag">
        <div className="estrip__track">
          {events.map((e) => {
            const pct = e.roomsTotal ? Math.round(((e.roomsTotal - e.roomsLeft) / e.roomsTotal) * 100) : 0;
            return (
              <Link key={e.slug} href={`/events/${e.slug}`} className="pass ripple-hover" draggable={false}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="media"><img src={img(e.image, 900)} alt={e.dest} loading="lazy" draggable={false} /></div>
                <div className="pass__top">
                  <div className="pass__month chrome-static">{e.month}<small>{e.year}</small></div>
                  <div className="pass__stamp">7 days<br />6 nights</div>
                </div>
                <div className="pass__b">
                  <span className="caps caps--aqua">{e.dates}</span>
                  <h3>{e.dest}</h3>
                  <div className="avail" title={`${pct}% reserved`}><i style={{ width: `${Math.max(6, pct)}%` }} /></div>
                  <div className="pass__meta">
                    <span>From {e.fromPrice}</span>
                    <span className={e.roomsLeft < 15 ? "chip chip--hot" : "chip"}>{e.roomsLeft} rooms left</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
