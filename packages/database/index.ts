import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { keys } from "./keys";
// biome-ignore lint/performance/noNamespaceImport: Drizzle requires namespace import for schema
import * as schema from "./schema";

const globalForDrizzle = global as unknown as {
  db: ReturnType<typeof createDrizzleClient>;
};

function createDrizzleClient() {
  const databaseUrl = keys().DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Please add it to your .env.local file."
    );
  }

  const client = postgres(databaseUrl);
  return drizzle(client, { schema });
}

export const database = globalForDrizzle.db || createDrizzleClient();

if (process.env.NODE_ENV !== "production") {
  globalForDrizzle.db = database;
}

export {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  notInArray,
  or,
  sql,
} from "drizzle-orm";
export * from "./schema";
