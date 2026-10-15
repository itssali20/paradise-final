"use client";
import { useCallback, useState, useTransition } from "react";
import Lightbox, { type LbItem } from "@/components/ui/Lightbox";
import { toggleCastingVote } from "@/actions/casting";
import { PHOTO_SETS } from "@/content/casting";
import type { CastingPhotoSets } from "@/db/schema";

export type BoardEntry = {
  id: string;
  name: string;
  age: number | null;
  place: string;
  heightCm: number | null;
  languages: string | null;
  about: string | null;
  photos: CastingPhotoSets;
  voted: boolean;
};

/** Gentlemen's private voting board: one heart per lady, a fixed number of hearts in total. */
export default function VoteBoard({ entries, used: initialUsed, limit }: { entries: BoardEntry[]; used: number; limit: number }) {
  const [voted, setVoted] = useState(() => new Set(entries.filter((e) => e.voted).map((e) => e.id)));
  const [used, setUsed] = useState(initialUsed);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [, start] = useTransition();
  const [lbItems, setLbItems] = useState<LbItem[]>([]);
  const [lbIndex, setLbIndex] = useState<number | null>(null);
  const close = useCallback(() => setLbIndex(null), []);

  function vote(id: string) {
    setBusy(id);
    setNote("");
    start(async () => {
      const r = await toggleCastingVote(id);
      setUsed(r.used);
      setVoted((v) => { const n = new Set(v); if (r.voted) n.add(id); else n.delete(id); return n; });
      if (r.message) setNote(r.message);
      setBusy(null);
    });
  }

  function open(e: BoardEntry, index = 0) {
    const items = PHOTO_SETS.flatMap((s) => e.photos[s.key].map((src, i) => ({ type: "img" as const, src, caption: `${e.name} · ${s.short} ${i + 1}` })));
    setLbItems(items);
    setLbIndex(index);
  }

  return (
    <>
      <div className="vote-bar" role="status" aria-live="polite">
        <div>
          <span className="caps caps--aqua">Your votes</span>
          <b className="tnum">{used} <small>/ {limit}</small></b>
        </div>
        <div className="vote-bar__meter" aria-hidden="true"><i style={{ width: `${Math.min(100, (used / limit) * 100)}%` }} /></div>
        {note ? <p className="vote-bar__note">{note}</p> : <p className="fine">Tap the heart to vote. Tap again to take it back. Votes are private.</p>}
      </div>

      <div className="vgrid">
        {entries.map((e) => {
          const on = voted.has(e.id);
          let offset = 0;
          return (
            <article key={e.id} className={`vcard${on ? " is-voted" : ""}`}>
              <button type="button" className="vcard__img" onClick={() => open(e)} aria-label={`View all photos of ${e.name}`} data-cursor="View">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.photos.dress[0]} alt="" loading="lazy" />
              </button>
              <div className="vcard__thumbs">
                {PHOTO_SETS.map((s) => {
                  const at = offset;
                  offset += e.photos[s.key].length;
                  return (
                    <button key={s.key} type="button" onClick={() => open(e, at)} aria-label={`${e.name} ${s.short.toLowerCase()} photos`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={e.photos[s.key][0]} alt="" loading="lazy" />
                      <span>{s.tag}</span>
                    </button>
                  );
                })}
              </div>
              <div className="vcard__b">
                <div style={{ minWidth: 0 }}>
                  <h3>{e.name}{e.age ? <span>, {e.age}</span> : null}</h3>
                  <p>{[e.place, e.heightCm ? `${e.heightCm} cm` : null].filter(Boolean).join(" · ")}</p>
                  {e.languages && <p className="fine">{e.languages}</p>}
                </div>
                <button type="button" className="heart" aria-pressed={on} disabled={busy === e.id} onClick={() => vote(e.id)} aria-label={on ? `Remove your vote for ${e.name}` : `Vote for ${e.name}`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" /></svg>
                </button>
              </div>
              {e.about && <p className="vcard__about">{e.about}</p>}
            </article>
          );
        })}
      </div>

      <Lightbox items={lbItems} index={lbIndex} onClose={close} onIndex={setLbIndex} />
    </>
  );
}
