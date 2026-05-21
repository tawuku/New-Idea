import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

let _client: ReturnType<typeof drizzle> | null = null;

export function getDb(databaseUrl?: string): ReturnType<typeof drizzle<typeof schema>> {
  if (_client) return _client as ReturnType<typeof drizzle<typeof schema>>;

  const url = databaseUrl ?? process.env["DATABASE_URL"];
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = postgres(url, { max: 10 });
  _client = drizzle(sql, { schema });
  return _client as ReturnType<typeof drizzle<typeof schema>>;
}

export type Db = ReturnType<typeof getDb>;
