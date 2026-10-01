import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Next imports route modules while collecting the production build. The build does not
 * execute database queries, so it uses an unreachable placeholder when no URL was
 * supplied. At runtime we still fail fast with a useful configuration error.
 */
const databaseUrl =
  process.env.DATABASE_URL ??
  (process.env.NEXT_PHASE === "phase-production-build" ? "postgresql://build:build@127.0.0.1:5432/build" : undefined);

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
