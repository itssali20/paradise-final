"use client";
import Link from "next/link";
import { useState } from "react";
import { img } from "@/content/media";

type Tier = { tier: number; name: string; image: string; description: string; from: string };

/** Four room tiers as an expanding accordion of photographs. */
export default function RoomTiers({ tiers, href = "/rooms" }: { tiers: Tier[]; href?: string }) {
  const [open, setOpen] = useState(2);
  return (
    <div className="tiers" data-reveal="fade">
      {tiers.map((t, i) => (
        <Link
          key={t.name}
          href={href}
          className={`tier ripple-hover${open === i ? " is-open" : ""}`}
          onMouseEnter={() => setOpen(i)}
          onFocus={() => setOpen(i)}
          data-cursor="View"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="media"><img src={img(t.image, 1400)} alt={t.name} loading="lazy" /></div>
          <span className="tier__n">0{t.tier}</span>
          <span className="tier__v">{t.name}</span>
          <div className="tier__b">
            <span className="caps caps--aqua">Tier {t.tier} of 4</span>
            <h3 style={{ marginTop: 10 }}>{t.name}</h3>
            <p>{t.description}</p>
            <div className="tier__price"><span className="caps caps--dim">From</span><b className="chrome-static">{t.from}</b><span className="caps caps--dim">/ 7 days</span></div>
          </div>
        </Link>
      ))}
    </div>
  );
}
