import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({
  path: ".env.local",
});

console.log("🚀 Starting migration script...");
const runMigrate = async () => {
  console.log("🔍 Checking POSTGRES_URL...");
  if (!process.env.POSTGRES_URL) {
    console.log("⏭️  POSTGRES_URL not defined, skipping migrations");
    process.exit(0);
  }
  console.log("✅ POSTGRES_URL found");

  console.log("🔌 Connecting to database...");
  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  console.log("✅ Connected");

  console.log("💧 Initializing Drizzle...");
  const db = drizzle(connection);

  console.log("⏳ Running migrations...");

  const start = Date.now();
  try {
    await migrate(db, { migrationsFolder: "./lib/db/migrations" });
  } catch (e) {
    console.error("❌ Migration error details:", e);
    throw e;
  }
  const end = Date.now();

  console.log("✅ Migrations completed in", end - start, "ms");
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
