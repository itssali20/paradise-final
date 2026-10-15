"use client";
import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { submitCasting } from "@/actions/casting";
import type { FormState } from "@/actions/public";
import { CASTING, PHOTO_SETS, type PhotoSetKey } from "@/content/casting";
import { gsap } from "@/lib/gsap";

type Pic = { file: File; url: string };
const EMPTY: Record<PhotoSetKey, Pic[]> = { dress: [], sport: [], bikini: [] };
const MAX_EDGE = 1600;
const MAX_TOTAL = 4.2 * 1024 * 1024; // stays under the hosting request limit

/** Resizes a photo in the browser (long edge 1600px, JPEG) so nine photos upload quickly on mobile data. */
async function shrink(file: File): Promise<File> {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const k = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.84));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // e.g. HEIC on a browser that can't decode it: send as is
  }
}

export default function CastingForm({ events, defaults }: { events: string[]; defaults?: { name?: string; email?: string } }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitCasting, { ok: false, message: "" });
  const [pics, setPics] = useState(EMPTY);
  const [busy, setBusy] = useState<PhotoSetKey | null>(null);
  const [local, setLocal] = useState<{ message: string; errors: Record<string, string> } | null>(null);
  const okRef = useRef<HTMLDivElement>(null);
  const urls = useRef<string[]>([]);

  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);
  useEffect(() => {
    if (state.ok && okRef.current) gsap.from(okRef.current.children, { y: 30, opacity: 0, stagger: 0.1, duration: 1, ease: "expo.out" });
  }, [state.ok]);
  useEffect(() => { if (state.message) setLocal(null); }, [state]);

  async function add(key: PhotoSetKey, list: FileList | null) {
    if (!list?.length) return;
    setBusy(key);
    const room = CASTING.maxPerSet - pics[key].length;
    const files = await Promise.all(Array.from(list).filter((f) => f.type.startsWith("image/") || /\.hei[cf]$/i.test(f.name)).slice(0, room).map(shrink));
    const next = files.map((file) => { const url = URL.createObjectURL(file); urls.current.push(url); return { file, url }; });
    setPics((p) => ({ ...p, [key]: [...p[key], ...next].slice(0, CASTING.maxPerSet) }));
    setBusy(null);
  }

  function remove(key: PhotoSetKey, i: number) {
    setPics((p) => ({ ...p, [key]: p[key].filter((_, j) => j !== i) }));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors: Record<string, string> = {};
    for (const s of PHOTO_SETS) if (pics[s.key].length < CASTING.perSet) errors[s.key] = `Add ${CASTING.perSet - pics[s.key].length} more`;
    if (Object.keys(errors).length) {
      setLocal({ message: `Please add at least ${CASTING.perSet} photos in each outfit (${CASTING.perSet * PHOTO_SETS.length} in total).`, errors });
      document.getElementById(`set-${Object.keys(errors)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const total = Object.values(pics).flat().reduce((a, p) => a + p.file.size, 0);
    if (total > MAX_TOTAL) {
      setLocal({ message: "Your photos are too large to send together. Please choose smaller JPG photos (or take a screenshot of each).", errors: {} });
      return;
    }
    const fd = new FormData(e.currentTarget);
    for (const s of PHOTO_SETS) for (const p of pics[s.key]) fd.append(s.key, p.file, p.file.name);
    setLocal(null);
    startTransition(() => action(fd));
  }

  if (state.ok) {
    return (
      <div className="form-ok" ref={okRef} role="status">
        <span className="caps caps--aqua">Application received</span>
        <h3 className="chrome" style={{ marginTop: 14 }}>Thank you.</h3>
        <p className="lead" style={{ margin: "0 auto" }}>{state.message}</p>
        <p style={{ marginTop: 24 }}><Link className="btn btn--sm" href="/ladies">What ladies receive</Link></p>
      </div>
    );
  }

  const err = { ...(state.errors || {}), ...(local?.errors || {}) };
  const msg = local?.message || (!state.ok && state.message);
  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, full = false) => (
    <div className={`f${full ? " f--full" : ""}${err[name] ? " has-err" : ""}`}>
      <label htmlFor={`c-${name}`}>{label}{props.required ? " *" : ""}</label>
      <input id={`c-${name}`} name={name} {...props} />
      {err[name] && <span className="err">{err[name]}</span>}
    </div>
  );

  return (
    <form className="form form--card cast-form" onSubmit={onSubmit} noValidate={false}>
      <div className="hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>

      <div className="f--full cast-form__h"><span className="caps caps--aqua">01 · About you</span></div>
      {field("name", "Full name", { required: true, autoComplete: "name", defaultValue: defaults?.name })}
      {field("email", "Email", { type: "email", required: true, autoComplete: "email", defaultValue: defaults?.email })}
      {field("phone", "Phone / WhatsApp", { type: "tel", required: true, autoComplete: "tel" })}
      {field("birthDate", "Date of birth", { type: "date", required: true, max: new Date(Date.now() - 18 * 365.25 * 864e5).toISOString().slice(0, 10) })}
      {field("country", "Country", { required: true, autoComplete: "country-name" })}
      {field("city", "City")}
      {field("heightCm", "Height (cm)", { type: "number", min: 120, max: 220, inputMode: "numeric" })}
      {field("languages", "Languages", { placeholder: "English, Spanish…" })}
      {field("instagram", "Instagram / portfolio", { type: "text", placeholder: "@yourname or link" })}
      <div className="f">
        <label htmlFor="c-event">Preferred event</label>
        <select id="c-event" name="event">{events.map((o) => <option key={o}>{o}</option>)}</select>
      </div>
      <div className="f f--full">
        <label htmlFor="c-about">About you</label>
        <textarea id="c-about" name="about" maxLength={1500} placeholder="A few lines about you, what you do and what you'd love to experience in paradise." />
      </div>

      <div className="f--full cast-form__h">
        <span className="caps caps--aqua">02 · Your photos</span>
        <p className="fine" style={{ marginTop: 8 }}>{CASTING.perSet} photos in each outfit, {CASTING.perSet * PHOTO_SETS.length} in total. Clear, recent photos of you alone. Face visible in at least one per set.</p>
      </div>
      {PHOTO_SETS.map((set, si) => {
        const list = pics[set.key];
        const done = list.length >= CASTING.perSet;
        return (
          <fieldset key={set.key} id={`set-${set.key}`} className={`cset f--full${err[set.key] ? " has-err" : ""}${done ? " is-done" : ""}`}>
            <legend className="sr-only">{set.label}</legend>
            <div className="cset__head">
              <b>{String(si + 1).padStart(2, "0")}</b>
              <div><h4>{set.label}</h4><p>{set.hint}</p></div>
              <span className={`status ${done ? "status--ok" : "status--info"}`}>{Math.min(list.length, CASTING.perSet)} / {CASTING.perSet}</span>
            </div>
            <div className="cset__slots">
              {list.map((p, i) => (
                <div className="cslot is-filled" key={p.url}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`${set.short} photo ${i + 1}`} />
                  <button type="button" className="cslot__x" onClick={() => remove(set.key, i)} aria-label={`Remove ${set.short.toLowerCase()} photo ${i + 1}`}>✕</button>
                </div>
              ))}
              {list.length < CASTING.maxPerSet && (
                <label className={`cslot cslot--add${busy === set.key ? " is-busy" : ""}`}>
                  <input type="file" accept="image/*,.heic,.heif" multiple className="sr-only" disabled={busy !== null}
                    onChange={(e) => { add(set.key, e.target.files); e.target.value = ""; }} />
                  <span aria-hidden="true">+</span>
                  <small>{busy === set.key ? "Preparing…" : list.length < CASTING.perSet ? `Add ${CASTING.perSet - list.length} photo${CASTING.perSet - list.length > 1 ? "s" : ""}` : "Optional extra"}</small>
                </label>
              )}
              {Array.from({ length: Math.max(0, CASTING.perSet - list.length - 1) }).map((_, i) => <div className="cslot cslot--ghost" key={i} aria-hidden="true" />)}
            </div>
            {err[set.key] && <span className="err">{err[set.key]}</span>}
          </fieldset>
        );
      })}

      <label className={`check${err.adult ? " has-err" : ""}`}><input type="checkbox" name="adult" required /> <span>I confirm I am 18 or older and I will show a valid ID before travelling.</span></label>
      <label className={`check${err.consent ? " has-err" : ""}`}><input type="checkbox" name="consent" required /> <span>I agree that my photos are shown privately to Paradise Club gentlemen for voting, never published, and I accept the <Link href="/legal/privacy">privacy policy</Link>.</span></label>
      {msg && <p className="form-msg is-err" role="alert">{msg}</p>}
      <div className="f--full" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button className="btn btn--chrome" disabled={pending || busy !== null}>{pending ? "Sending photos…" : "Send my application"}</button>
        <span className="fine">You can ask us to withdraw your application and delete your photos at any time.</span>
      </div>
    </form>
  );
}
