// Runs before `next build` on Vercel: applies migrations, then creates the admin account
// (from ADMIN_EMAIL / ADMIN_PASSWORD) and the starter event calendar if the database is empty.
// Never fails the deploy because of seeding.
import { spawnSync } from "node:child_process";
import fs from "node:fs";

for (const f of [".env.local", ".env"]) {
  if (!process.env.DATABASE_URL && fs.existsSync(f)) {
    for (const line of fs.readFileSync(f, "utf8").split("\n")) {
      const m = line.match(/^\s*DATABASE_URL\s*=\s*"?([^"\n]+)"?/);
      if (m) process.env.DATABASE_URL = m[1];
    }
  }
}
if (!process.env.DATABASE_URL) {
  console.log("[setup] DATABASE_URL not set — site builds in showcase mode (bookings, accounts and admin need a database).");
  process.exit(0);
}
const run = (cmd, args) => spawnSync(cmd, args, { stdio: "inherit", env: process.env });
const mig = run("node", ["scripts/migrate-if-db.mjs"]);
if (mig.status !== 0) process.exit(mig.status ?? 1);
const seed = run("npx", ["tsx", "src/db/seed.ts"]);
if (seed.status !== 0) console.warn("[setup] seeding skipped/failed — you can run `npm run db:seed` manually");
