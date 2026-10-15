import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, hasDb, s } from "@/db";

const COOKIE = "pc_session";
const MAX_AGE = 60 * 60 * 24 * 30;

export type Session = { uid: string; role: "MEMBER" | "ADMIN"; name: string; email: string };

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s || "paradise-dev-secret-change-me-paradise-dev-secret");
}

export const hashPassword = (p: string) => bcrypt.hash(p, 11);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);

export async function createSession(u: { id: string; role: "MEMBER" | "ADMIN"; name: string; email: string }) {
  const token = await new SignJWT({ role: u.role, name: u.name, email: u.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(u.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  if (!hasDb) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { uid: payload.sub!, role: payload.role as Session["role"], name: String(payload.name), email: String(payload.email) };
  } catch {
    return null;
  }
}

async function currentPath() {
  const h = await headers();
  return h.get("x-pathname") || "/account";
}

/** Signed-in, not suspended member (fresh from the database). */
export async function requireUser() {
  const sess = await getSession();
  if (!sess) redirect(`/login?next=${encodeURIComponent(await currentPath())}`);
  const [u] = await db.select().from(s.users).where(eq(s.users.id, sess.uid)).limit(1);
  if (!u || u.suspended) {
    redirect("/login?error=suspended");
  }
  return u;
}

export async function requireAdmin() {
  const sess = await getSession();
  if (!sess) redirect(`/login?next=${encodeURIComponent(await currentPath())}`);
  const [u] = await db.select().from(s.users).where(eq(s.users.id, sess.uid)).limit(1);
  if (!u || u.role !== "ADMIN" || u.suspended) redirect("/login?error=admin");
  return u;
}
