"use client";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { submitApplication, type FormState } from "@/actions/public";
import { gsap } from "@/lib/gsap";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "date" | "number" | "textarea" | "select" | "file";
  options?: string[];
  required?: boolean;
  full?: boolean;
  placeholder?: string;
  hint?: string;
  multiple?: boolean;
  accept?: string;
  defaultValue?: string;
};

type Props = {
  type: "LADY" | "COMPETITION" | "PARTNER" | "SPONSOR" | "GENERAL" | "MEMBER";
  fields?: Field[];
  submit?: string;
  adult?: boolean;
  hidden?: Record<string, string>;
  defaults?: { name?: string; email?: string };
};

const BASE: Field[] = [
  { name: "name", label: "Full name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone / WhatsApp", type: "tel" },
  { name: "country", label: "Country" },
];

/** One form component for every public application (ladies, contests, partners, sponsors, contact). */
export default function ApplicationForm({ type, fields = [], submit = "Send application", adult = false, hidden = {}, defaults }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitApplication, { ok: false, message: "" });
  const okRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.ok && okRef.current) gsap.from(okRef.current.children, { y: 30, opacity: 0, stagger: 0.1, duration: 1, ease: "expo.out" });
  }, [state.ok]);

  if (state.ok) {
    return (
      <div className="form-ok" ref={okRef} role="status">
        <span className="caps caps--aqua">Received</span>
        <h3 className="chrome" style={{ marginTop: 14 }}>Thank you.</h3>
        <p className="lead" style={{ margin: "0 auto" }}>{state.message}</p>
        <p style={{ marginTop: 24 }}><Link className="btn btn--sm" href="/events">See upcoming events</Link></p>
      </div>
    );
  }

  const err = state.errors || {};
  const render = (f: Field) => {
    const id = `f-${type}-${f.name}`;
    const common = { id, name: f.name, required: f.required, placeholder: f.placeholder, defaultValue: f.defaultValue ?? (f.name === "name" ? defaults?.name : f.name === "email" ? defaults?.email : undefined) };
    return (
      <div key={f.name} className={`f${f.full || f.type === "textarea" || f.type === "file" ? " f--full" : ""}${err[f.name] ? " has-err" : ""}`}>
        <label htmlFor={id}>{f.label}{f.required ? " *" : ""}</label>
        {f.type === "textarea" ? (
          <textarea {...common} />
        ) : f.type === "select" ? (
          <select {...common}>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>
        ) : f.type === "file" ? (
          <input id={id} name={f.name} type="file" multiple={f.multiple} accept={f.accept ?? "image/*"} />
        ) : (
          <input {...common} type={f.type ?? "text"} autoComplete={f.name === "name" ? "name" : f.name === "email" ? "email" : f.name === "phone" ? "tel" : f.name === "country" ? "country-name" : undefined} />
        )}
        {f.hint && <span className="hint">{f.hint}</span>}
        {err[f.name] && <span className="err">{err[f.name]}</span>}
      </div>
    );
  };

  return (
    <form className="form form--card" action={action} noValidate={false}>
      <input type="hidden" name="type" value={type} />
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <div className="hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {BASE.map(render)}
      {fields.map(render)}
      {adult && (
        <label className="check"><input type="checkbox" name="adult" required /> I confirm I am 18 or older.</label>
      )}
      <label className="check"><input type="checkbox" name="consent" required /> I agree to be contacted about Paradise Club and accept the <Link href="/legal/privacy">privacy policy</Link>.</label>
      {state.message && !state.ok && <p className="form-msg is-err" role="alert">{state.message}</p>}
      <div className="f--full" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button className="btn btn--chrome" disabled={pending}>{pending ? "Sending…" : submit}</button>
        <span className="fine">Your details stay private. We use them only to reply to you.</span>
      </div>
    </form>
  );
}
