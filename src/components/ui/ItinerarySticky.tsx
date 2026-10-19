"use client";
import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { img } from "@/content/media";

type Day = { day: string; title: string; text: string; image: string };

/** Seven days: the photo on the left changes as each day scrolls past. */
export default function ItinerarySticky({ days }: { days: Day[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(0);
  useGSAP(() => {
    root.current!.querySelectorAll(".dayrow").forEach((row, i) => {
      ScrollTrigger.create({ trigger: row, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setOn(i) });
    });
  }, { scope: root });
  return (
    <div className="sticky-pair" ref={root}>
      <div className="sticky-pair__media">
        {days.map((d, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <div key={d.day} className={`media${i === on ? " on" : ""}`}><img src={img(d.image, 1400)} alt={d.title} loading="lazy" /></div>
        ))}
      </div>
      <div>
        {days.map((d) => (
          <div className="dayrow" key={d.day}>
            <span className="caps caps--aqua">Day</span>
            <b className="chrome">{d.day}</b>
            <h3>{d.title}</h3>
            <p>{d.text}</p>
          </div>
        ))}
        <p className="fine" style={{ marginTop: 30 }}>Illustrative itinerary only. Actual programming depends on destination, venue availability, weather, production arrangements, and finalized rules.</p>
      </div>
    </div>
  );
}
