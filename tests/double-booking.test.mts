/**
 * Proves the "no double booking" guarantee: 12 guests try to buy the LAST room at the same moment.
 * Run:  npm run test:race
 */
import fs from "node:fs";
for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\n]*)"?/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
delete process.env.STRIPE_SECRET_KEY;
process.env.PAYMENTS_DEMO = "1";

const { db, s } = await import("../src/db");
const { createHold, BookingError } = await import("../src/lib/booking");
const { eq, inArray } = await import("drizzle-orm");

const [ev] = await db.select().from(s.events).where(eq(s.events.status, "PUBLISHED")).limit(1);
const [rt] = await db.insert(s.roomTypes).values({ eventId: ev.id, name: "TEST last room", priceCents: 100000, inventory: 1 }).returning();
const users = await db.insert(s.users).values(Array.from({ length: 12 }, (_, i) => ({ email: `race${i}-${Date.now()}@test.com`, name: `Racer ${i}`, passwordHash: "x" }))).returning();

const results = await Promise.allSettled(users.map((u) => createHold({
  userId: u.id, eventId: ev.id, roomTypeId: rt.id, withLady: false, plan: "FULL",
  contact: { name: u.name, email: u.email },
})));
const ok = results.filter((r) => r.status === "fulfilled").length;
const soldOut = results.filter((r) => r.status === "rejected" && r.reason instanceof BookingError).length;
const other = results.filter((r) => r.status === "rejected" && !(r.reason instanceof BookingError));
console.log(`succeeded: ${ok} · rejected as sold out: ${soldOut} · unexpected errors: ${other.length}`);
other.forEach((r) => console.log((r as PromiseRejectedResult).reason));

// cleanup
await db.delete(s.bookings).where(eq(s.bookings.roomTypeId, rt.id));
await db.delete(s.roomTypes).where(eq(s.roomTypes.id, rt.id));
await db.delete(s.users).where(inArray(s.users.id, users.map((u) => u.id)));
console.log(ok === 1 && soldOut === 11 ? "PASS ✓ exactly one guest got the last room" : "FAIL ✗");
process.exit(ok === 1 ? 0 : 1);
