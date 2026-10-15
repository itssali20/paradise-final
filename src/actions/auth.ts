"use server";
import { redirect } from "next/navigation";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { db, hasDb, s } from "@/db";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { layout, sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/stripe";
import { audit } from "@/lib/audit";

export type AuthState = { ok: boolean; message: string };

const safeNext = (n: unknown) => {
  const v = typeof n === "string" ? n : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : "/account";
};

const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  gender: z.enum(["GENTLEMAN", "LADY"], { message: "Please choose gentleman or lady" }),
  birthDate: z.string().min(8, "Date of birth is required"),
  country: z.string().trim().min(2, "Country is required"),
});

export async function register(_: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasDb) return { ok: false, message: "Accounts open as soon as the database is connected." };
  const parsed = registerSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  if (fd.get("adult") !== "on" || fd.get("terms") !== "on") return { ok: false, message: "Please confirm you are 18+ and accept the terms." };
  const v = parsed.data;
  const dob = new Date(v.birthDate);
  const age = (Date.now() - dob.getTime()) / (365.25 * 864e5);
  if (!(age >= 18 && age < 110)) return { ok: false, message: "Paradise Club members must be 18 or older." };
  const [exists] = await db.select({ id: s.users.id }).from(s.users).where(eq(s.users.email, v.email));
  if (exists) return { ok: false, message: "An account with this email already exists — please sign in." };
  const [u] = await db.insert(s.users).values({
    email: v.email, name: v.name, passwordHash: await hashPassword(v.password), gender: v.gender, birthDate: dob, country: v.country,
  }).returning();
  await db.insert(s.profiles).values({ userId: u.id, displayName: v.name.split(" ")[0] });
  await createSession({ id: u.id, role: u.role, name: u.name, email: u.email });
  await sendEmail(u.email, "Welcome to Paradise Club", layout(`Welcome, ${v.name.split(" ")[0]}.`, "<p>Your Paradise Club account is ready. Complete your profile so members can discover you, then choose the month you'd love to travel.</p>", { href: `${siteUrl()}/account/profile`, label: "Complete your profile" }));
  await audit(u.id, "user.registered", "user", u.id);
  redirect(safeNext(fd.get("next")));
}

export async function login(_: AuthState, fd: FormData): Promise<AuthState> {
  if (!hasDb) return { ok: false, message: "Sign-in opens as soon as the database is connected." };
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  const [u] = await db.select().from(s.users).where(eq(s.users.email, email));
  if (!u || !(await verifyPassword(password, u.passwordHash))) return { ok: false, message: "Incorrect email or password." };
  if (u.suspended) return { ok: false, message: "This account is suspended. Please contact us." };
  await createSession({ id: u.id, role: u.role, name: u.name, email: u.email });
  await db.update(s.users).set({ lastSeenAt: new Date() }).where(eq(s.users.id, u.id));
  const next = fd.get("next");
  redirect(next ? safeNext(next) : u.role === "ADMIN" ? "/admin" : "/account");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

async function sha256(t: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
  return Buffer.from(b).toString("hex");
}

export async function requestReset(_: AuthState, fd: FormData): Promise<AuthState> {
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const msg = { ok: true, message: "If an account exists for that email, a reset link is on its way." };
  if (!hasDb || !email) return msg;
  const [u] = await db.select().from(s.users).where(eq(s.users.email, email));
  if (!u) return msg;
  const token = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
  await db.insert(s.passwordResetTokens).values({ userId: u.id, tokenHash: await sha256(token), expiresAt: new Date(Date.now() + 3600e3) });
  const link = `${siteUrl()}/reset?token=${token}`;
  await sendEmail(u.email, "Reset your Paradise Club password", layout("Reset your password", "<p>Use the button below within one hour to choose a new password. If you didn't ask for this, ignore this email.</p>", { href: link, label: "Choose a new password" }));
  if (!process.env.RESEND_API_KEY) console.log("[reset-link]", link);
  return msg;
}

export async function resetPassword(_: AuthState, fd: FormData): Promise<AuthState> {
  const token = String(fd.get("token") || "");
  const pw = String(fd.get("password") || "");
  if (pw.length < 8) return { ok: false, message: "Password must be at least 8 characters." };
  const [t] = await db.select().from(s.passwordResetTokens)
    .where(and(eq(s.passwordResetTokens.tokenHash, await sha256(token)), isNull(s.passwordResetTokens.usedAt), gt(s.passwordResetTokens.expiresAt, new Date())));
  if (!t) return { ok: false, message: "This link has expired. Please request a new one." };
  await db.update(s.users).set({ passwordHash: await hashPassword(pw) }).where(eq(s.users.id, t.userId));
  await db.update(s.passwordResetTokens).set({ usedAt: new Date() }).where(eq(s.passwordResetTokens.id, t.id));
  return { ok: true, message: "Password updated — you can sign in now." };
}
