import "server-only";
import { Resend } from "resend";
import { SITE } from "@/content/site";

const key = process.env.RESEND_API_KEY;
const resend = key ? new Resend(key) : null;
const FROM = process.env.EMAIL_FROM || "Paradise Club <onboarding@resend.dev>";

/** Branded HTML shell for every email. */
export function layout(title: string, body: string, cta?: { href: string; label: string }) {
  const btn = cta
    ? `<p style="margin:32px 0"><a href="${cta.href}" style="background:#e9eff4;color:#05090f;padding:14px 26px;border-radius:999px;text-decoration:none;font:700 12px/1 Arial;letter-spacing:3px;text-transform:uppercase">${cta.label}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#03060b;color:#eef3f7;font:15px/1.7 Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 28px">
    <img src="${SITE.url}/brand/logo-email.png" alt="Paradise Club" width="220" style="display:block;margin:0 auto 30px">
    <h1 style="font:400 30px/1.2 Georgia,serif;margin:0 0 18px;color:#ffffff">${title}</h1>
    <div style="color:#b9c6d2">${body}</div>
    ${btn}
    <hr style="border:0;border-top:1px solid #1d2b3b;margin:36px 0">
    <p style="font-size:12px;color:#6b7d90">Paradise Club · Elite Vacations · ${SITE.phone} · <a style="color:#2fd8f2" href="${SITE.url}">${SITE.url.replace(/^https?:\/\//, "")}</a></p>
  </div></body></html>`;
}

export async function sendEmail(to: string | string[], subject: string, html: string) {
  if (!resend) {
    console.log(`[email:dev] → ${to} | ${subject}`);
    return { ok: true, dev: true };
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return { ok: true };
  } catch (e) {
    console.error("[email] failed", e);
    return { ok: false };
  }
}

export async function notifyAdmin(subject: string, html: string) {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (to) await sendEmail(to, `[Paradise Club] ${subject}`, html);
  else console.log(`[admin-notify] ${subject}`);
}
