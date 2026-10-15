// Local development database (no install needed): `node scripts/dev-db.mjs`
// Starts an embedded Postgres on port 5433 and keeps it running.
import EmbeddedPostgres from "embedded-postgres";

const pg = new EmbeddedPostgres({
  databaseDir: "./.pgdata",
  user: "postgres",
  password: "postgres",
  port: 5433,
  persistent: true,
  createPostgresUser: true,
});

const fresh = !(await import("node:fs")).existsSync("./.pgdata/PG_VERSION");
if (fresh) await pg.initialise();
await pg.start();
if (fresh) await pg.createDatabase("paradise").catch(() => {});
console.log("Postgres ready → postgresql://postgres:postgres@localhost:5433/paradise");
process.on("SIGINT", async () => { await pg.stop(); process.exit(0); });
setInterval(() => {}, 1 << 30);
