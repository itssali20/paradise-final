import "server-only";
import { count, eq } from "drizzle-orm";
import { db, hasDb, s } from "@/db";
import { getSession } from "@/lib/auth";
import type { User } from "@/db/schema";

export type Voter = { user: User | null; canVote: boolean; reason?: "signin" | "lady" | "suspended" | "admin" | "nodb" };

/** Only signed-in, active gentlemen vote. Ladies and admins can't influence the ranking. */
export async function getVoter(): Promise<Voter> {
  if (!hasDb) return { user: null, canVote: false, reason: "nodb" };
  const sess = await getSession();
  if (!sess) return { user: null, canVote: false, reason: "signin" };
  const [u] = await db.select().from(s.users).where(eq(s.users.id, sess.uid)).limit(1);
  if (!u) return { user: null, canVote: false, reason: "signin" };
  if (u.suspended) return { user: u, canVote: false, reason: "suspended" };
  if (u.role === "ADMIN") return { user: u, canVote: false, reason: "admin" };
  if (u.gender !== "GENTLEMAN") return { user: u, canVote: false, reason: "lady" };
  return { user: u, canVote: true };
}

export async function votesUsed(voterId: string) {
  const [r] = await db.select({ n: count() }).from(s.castingVotes).where(eq(s.castingVotes.voterId, voterId));
  return r.n;
}

export async function castingCounts() {
  if (!hasDb) return { applied: 0, live: 0, chosen: 0 };
  const rows = await db.select({ status: s.castingEntries.status, n: count() }).from(s.castingEntries).groupBy(s.castingEntries.status);
  const by = Object.fromEntries(rows.map((r) => [r.status, r.n])) as Record<string, number>;
  return {
    applied: rows.reduce((a, r) => a + r.n, 0),
    live: (by.APPROVED ?? 0) + (by.CHOSEN ?? 0),
    chosen: by.CHOSEN ?? 0,
  };
}

