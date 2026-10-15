"use client";
import { useActionState } from "react";
import { changePassword, type MState } from "@/actions/member";

export default function PasswordForm() {
  const [st, act, pending] = useActionState<MState, FormData>(changePassword, { ok: false, message: "" });
  return (
    <form className="form" action={act}>
      <div className="f"><label htmlFor="pw-c">Current password</label><input id="pw-c" name="current" type="password" required autoComplete="current-password" /></div>
      <div className="f"><label htmlFor="pw-n">New password</label><input id="pw-n" name="password" type="password" minLength={8} required autoComplete="new-password" /></div>
      {st.message && <p className={`form-msg${st.ok ? "" : " is-err"}`}>{st.message}</p>}
      <div className="f--full"><button className="mini-btn mini-btn--solid" disabled={pending}>Update password</button></div>
    </form>
  );
}
