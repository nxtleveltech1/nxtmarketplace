import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { join } from "path";

config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(DATABASE_URL);

async function checkMigrations() {
  console.log("Checking database migrations...\n");

  // Get all migration files
  const drizzleDir = join(process.cwd(), "drizzle");
  const migrationFiles = readdirSync(drizzleDir)
    .filter((f) => f.endsWith(".sql") && f.startsWith("000"))
    .sort();

  console.log(`Found ${migrationFiles.length} migration files:`);
  migrationFiles.forEach((f) => console.log(`  - ${f}`));

  // Check tables in database
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE' 
    ORDER BY table_name
  `;

  console.log(`\nTables in database (${tables.length}):`);
  tables.forEach((t: any) => console.log(`  - ${t.table_name}`));

  // Check for expected tables from schema
  const expectedTables = [
    "users",
    "seller_profiles",
    "listings",
    "listing_images",
    "verifications",
    "sales",
    "courier_shipments",
    "reviews",
    "messages",
  ];

  console.log(`\nExpected tables: ${expectedTables.length}`);
  const missingTables = expectedTables.filter(
    (table) => !tables.some((t: any) => t.table_name === table)
  );

  if (missingTables.length > 0) {
    console.log(`\n⚠ Missing tables:`);
    missingTables.forEach((t) => console.log(`  - ${t}`));
  } else {
    console.log("✓ All expected tables exist");
  }

  // Check for CHECK constraints
  const checkConstraints = await sql`
    SELECT constraint_name, table_name
    FROM information_schema.table_constraints
    WHERE constraint_type = 'CHECK'
    AND table_schema = 'public'
    ORDER BY table_name, constraint_name
  `;

  console.log(`\nCHECK constraints (${checkConstraints.length}):`);
  checkConstraints.forEach((c: any) =>
    console.log(`  - ${c.table_name}.${c.constraint_name}`)
  );

  const expectedConstraints = [
    "reviews_rating_check",
    "courier_shipments_direction_check",
  ];

  const missingConstraints = expectedConstraints.filter(
    (constraint) =>
      !checkConstraints.some((c: any) => c.constraint_name === constraint)
  );

  if (missingConstraints.length > 0) {
    console.log(`\n⚠ Missing CHECK constraints:`);
    missingConstraints.forEach((c) => console.log(`  - ${c}`));
  } else {
    console.log("✓ All expected CHECK constraints exist");
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  if (missingTables.length === 0 && missingConstraints.length === 0) {
    console.log("✓ All migrations appear to have been applied successfully!");
  } else {
    console.log("⚠ Some migrations may not have been fully applied.");
    console.log("   Run: bun run scripts/run-migration.ts");
  }
}

checkMigrations().catch(console.error);

