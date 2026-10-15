"use client";
import { useActionState } from "react";
import { subscribe } from "@/actions/public";

export default function Newsletter() {
  const [state, action, pending] = useActionState(subscribe, { ok: false, message: "" });
  if (state.ok) return <p className="caps caps--aqua" role="status">{state.message}</p>;
  return (
    <form className="foot__news" action={action}>
      <label className="sr-only" htmlFor="news-email">Email</label>
      <input id="news-email" name="email" type="email" required placeholder="Email for next month's destination" autoComplete="email" />
      <button className="btn btn--aqua btn--sm" disabled={pending}>{pending ? "…" : "Notify me"}</button>
      {state.message && !state.ok && <span className="fine" role="alert">{state.message}</span>}
    </form>
  );
}
