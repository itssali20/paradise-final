"use client";
import Link from "next/link";
import { useActionState } from "react";
import { login, register, requestReset, resetPassword, type AuthState } from "@/actions/auth";

const init: AuthState = { ok: false, message: "" };

export function LoginForm({ next, error }: { next?: string; error?: string }) {
  const [st, act, pending] = useActionState(login, init);
  return (
    <form className="form" action={act}>
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="f f--full"><label htmlFor="l-email">Email</label><input id="l-email" name="email" type="email" required autoComplete="email" /></div>
      <div className="f f--full"><label htmlFor="l-pw">Password</label><input id="l-pw" name="password" type="password" required autoComplete="current-password" /></div>
      {(st.message || error) && <p className="form-msg is-err" role="alert">{st.message || error}</p>}
      <div className="f--full" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn btn--chrome" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
        <Link className="link-line fine" href="/reset">Forgot password?</Link>
      </div>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [st, act, pending] = useActionState(register, init);
  return (
    <form className="form" action={act}>
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="f f--full">
        <span className="label">I am a</span>
        <div className="seg">
          <label><input type="radio" name="gender" value="GENTLEMAN" defaultChecked /><b>Gentleman</b><span>Reserve rooms, invite a lady</span></label>
          <label><input type="radio" name="gender" value="LADY" /><b>Lady</b><span>Complimentary invitations for selected ladies</span></label>
        </div>
      </div>
      <div className="f"><label htmlFor="r-name">Full name</label><input id="r-name" name="name" required autoComplete="name" /></div>
      <div className="f"><label htmlFor="r-email">Email</label><input id="r-email" name="email" type="email" required autoComplete="email" /></div>
      <div className="f"><label htmlFor="r-dob">Date of birth</label><input id="r-dob" name="birthDate" type="date" required /></div>
      <div className="f"><label htmlFor="r-country">Country</label><input id="r-country" name="country" required autoComplete="country-name" /></div>
      <div className="f f--full"><label htmlFor="r-pw">Password</label><input id="r-pw" name="password" type="password" minLength={8} required autoComplete="new-password" /><span className="hint">At least 8 characters.</span></div>
      <label className="check"><input type="checkbox" name="adult" required /> I confirm I am 18 or older.</label>
      <label className="check"><input type="checkbox" name="terms" required /> I accept the <Link href="/legal/terms">terms</Link>, <Link href="/legal/privacy">privacy policy</Link> and <Link href="/legal/community">community standards</Link>.</label>
      {st.message && <p className="form-msg is-err" role="alert">{st.message}</p>}
      <div className="f--full"><button className="btn btn--chrome" disabled={pending}>{pending ? "Creating…" : "Create my account"}</button></div>
    </form>
  );
}

export function ResetForm({ token }: { token?: string }) {
  const [st, act, pending] = useActionState(token ? resetPassword : requestReset, init);
  if (st.ok) return <p className="notice" role="status">{st.message} {token && <Link href="/login" className="link-line">Sign in</Link>}</p>;
  return (
    <form className="form" action={act}>
      {token ? (
        <>
          <input type="hidden" name="token" value={token} />
          <div className="f f--full"><label htmlFor="p-new">New password</label><input id="p-new" name="password" type="password" minLength={8} required autoComplete="new-password" /></div>
        </>
      ) : (
        <div className="f f--full"><label htmlFor="p-email">Email</label><input id="p-email" name="email" type="email" required /></div>
      )}
      {st.message && <p className="form-msg is-err" role="alert">{st.message}</p>}
      <div className="f--full"><button className="btn btn--chrome" disabled={pending}>{token ? "Save password" : "Send reset link"}</button></div>
    </form>
  );
}
