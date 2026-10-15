/**
 * Seeds the database: first admin account + the 12-month event calendar with four room tiers,
 * physical room lists and bookable activities. Safe to run more than once.
 *   npm run db:seed
 */
import fs from "node:fs";
for (const f of [".env.local", ".env"]) {
  if (fs.existsSync(f)) {
    for (const line of fs.readFileSync(f, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\n]*)"?/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  }
}

async function main() {
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { eq } = await import("drizzle-orm");
  const pg = (await import("pg")).default;
  const bcrypt = (await import("bcryptjs")).default;
  const s = await import("./schema");
  const { sampleEvents } = await import("../content/sample-events");

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const pool = new pg.Pool({ connectionString: url, ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false } });
  const db = drizzle(pool, { schema: s });

  // admin
  const email = (process.env.ADMIN_EMAIL || "admin@paradise-club.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const [existing] = await db.select().from(s.users).where(eq(s.users.email, email));
  if (!existing && !password) {
    console.warn("! ADMIN_PASSWORD not set — skipping admin account (set ADMIN_EMAIL + ADMIN_PASSWORD and redeploy)");
  } else if (!existing) {
    await db.insert(s.users).values({ email, name: "Paradise Admin", role: "ADMIN", passwordHash: await bcrypt.hash(password!, 11) });
    console.log(`✓ admin created: ${email}`);
  } else if (existing.role !== "ADMIN") {
    await db.update(s.users).set({ role: "ADMIN" }).where(eq(s.users.id, existing.id));
    console.log(`✓ ${email} promoted to admin`);
  } else console.log(`• admin exists: ${email}`);

  // events
  const ACTS = [
    { name: "Jet Ski Safari", category: "Ocean", image: "/media/act-jet-ski.webp", priceCents: 12000, capacity: 30 },
    { name: "Parasailing", category: "Ocean", image: "/media/act-parasailing.webp", priceCents: 9500, capacity: 24 },
    { name: "Discover Scuba Dive", category: "Ocean", image: "/media/act-scuba.webp", priceCents: 16000, capacity: 20 },
    { name: "Reef Snorkel Trip", category: "Ocean", image: "/media/act-coral.webp", priceCents: 7500, capacity: 40 },
    { name: "Water Skiing", category: "Ocean", image: "/media/act-water-ski.webp", priceCents: 8500, capacity: 16 },
    { name: "Horseback at Sunset", category: "Beach", image: "un:1618066860737-df4d383c98c3", priceCents: 11000, capacity: 20 },
    { name: "Private Island Excursion", category: "Excursion", image: "un:1589197331516-4d84b72ebde3", priceCents: 19500, capacity: 40 },
  ];

  // only create the sample calendar on a fresh database (never overwrite the team's real events)
  const anyEvent = await db.select({ id: s.events.id }).from(s.events).limit(1);
  if (anyEvent.length && !process.argv.includes("--events")) {
    console.log("• events already exist — calendar left untouched");
    await pool.end();
    return;
  }
  for (const e of sampleEvents()) {
    const [found] = await db.select().from(s.events).where(eq(s.events.slug, e.slug));
    if (found) { console.log(`• event exists: ${e.slug}`); continue; }
    const [ev] = await db.insert(s.events).values({
      slug: e.slug, title: e.title, destinationSlug: e.destinationSlug, resortName: e.resortName, resortSummary: e.resortSummary,
      location: e.location, heroImage: e.heroImage, startDate: e.startDate, endDate: e.endDate, status: "PUBLISHED",
    }).returning();
    for (const [i, r] of e.roomTypes.entries()) {
      const [rt] = await db.insert(s.roomTypes).values({ eventId: ev.id, ...r }).returning();
      const prefix = ["L", "O", "S", "V"][i];
      const labels = Array.from({ length: r.inventory }, (_, k) => (prefix === "V" ? `Villa ${k + 1}` : `${prefix}${String(101 + k)}`));
      await db.insert(s.rooms).values(labels.map((label) => ({ eventId: ev.id, roomTypeId: rt.id, label })));
    }
    await db.insert(s.activities).values(ACTS.map((a, i) => ({ ...a, eventId: ev.id, sortOrder: i, description: null })));
    console.log(`✓ event ${e.slug}`);
  }

  await pool.end();
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
