import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export const hasDb = Boolean(process.env.DATABASE_URL);

type DB = NodePgDatabase<typeof schema>;
const g = globalThis as unknown as { __pcPool?: Pool; __pcDb?: DB };

function create(): DB {
  const url = process.env.DATABASE_URL!;
  const local = /localhost|127\.0\.0\.1/.test(url);
  g.__pcPool ??= new Pool({
    connectionString: url,
    max: 5,
    ssl: local || /sslmode=disable/.test(url) ? undefined : { rejectUnauthorized: false },
  });
  g.__pcDb ??= drizzle(g.__pcPool, { schema });
  return g.__pcDb;
}

/** Database handle. Throws a clear error if DATABASE_URL is missing. */
export const db: DB = new Proxy({} as DB, {
  get(_t, prop) {
    if (!hasDb) throw new Error("DATABASE_URL is not configured");
    return Reflect.get(create(), prop);
  },
});

export * as s from "./schema";
