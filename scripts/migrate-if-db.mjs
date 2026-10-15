// Applies database migrations when DATABASE_URL is set (runs automatically before `next build`).
import fs from "node:fs";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

for (const f of [".env.local", ".env"]) {
  if (!process.env.DATABASE_URL && fs.existsSync(f)) {
    for (const line of fs.readFileSync(f, "utf8").split("\n")) {
      const m = line.match(/^\s*DATABASE_URL\s*=\s*"?([^"\n]+)"?/);
      if (m) process.env.DATABASE_URL = m[1];
    }
  }
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.log("[migrate] DATABASE_URL not set — skipping migrations (site runs in showcase mode).");
  process.exit(0);
}
const local = /localhost|127\.0\.0\.1/.test(url);
const pool = new pg.Pool({ connectionString: url, ssl: local ? undefined : { rejectUnauthorized: false } });
try {
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  console.log("[migrate] database is up to date");
} catch (e) {
  console.error("[migrate] failed:", e.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
