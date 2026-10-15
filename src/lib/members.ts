import "server-only";
import { and, eq, or } from "drizzle-orm";
import { db, s } from "@/db";

export async function isBlockedEither(a: string, b: string) {
  const r = await db.select().from(s.blocks).where(or(and(eq(s.blocks.blockerId, a), eq(s.blocks.blockedId, b)), and(eq(s.blocks.blockerId, b), eq(s.blocks.blockedId, a)))).limit(1);
  return r.length > 0;
}

export function age(d: Date | null | undefined) {
  if (!d) return null;
  return Math.floor((Date.now() - new Date(d).getTime()) / (365.25 * 864e5));
}

export const initials = (n: string) => n.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();
