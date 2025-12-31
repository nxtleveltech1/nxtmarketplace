import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(DATABASE_URL);

async function runMigration() {
  // Run all migration files in order
  const migrationFiles = [
    "0001_puzzling_vision.sql",
    "0002_add_check_constraints.sql",
  ];
  
  for (const migrationFile of migrationFiles) {
    const migrationPath = join(process.cwd(), "drizzle", migrationFile);
    if (!require("fs").existsSync(migrationPath)) {
      console.log(`Skipping ${migrationFile} (file not found)`);
      continue;
    }
    
    console.log(`\n=== Running migration: ${migrationFile} ===`);
    const migrationSQL = readFileSync(migrationPath, "utf-8");
  
    // Split by statement-breakpoint if present, otherwise split by semicolons
    let statements: string[];
    if (migrationSQL.includes("--> statement-breakpoint")) {
      statements = migrationSQL
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"));
    } else {
      // Split by semicolons for files without statement-breakpoint markers
      statements = migrationSQL
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"))
        .map((s) => s + ";"); // Add semicolon back
    }

  console.log(`Executing ${statements.length} migration statements...`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement || statement.trim().length === 0) continue;
    
    console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
    try {
      // Use sql.query for raw SQL statements
      await sql.query(statement);
      console.log("✓ Statement executed successfully");
    } catch (error: any) {
      console.error(`✗ Error executing statement ${i + 1}:`, error.message);
      if (error.code === "42P07") {
        console.log("  (Table already exists, continuing...)");
      } else if (error.code === "42704" || error.code === "42710") {
        console.log("  (Type already exists, continuing...)");
      } else if (error.code === "42P01") {
        console.log("  (Table does not exist, continuing...)");
      } else if (error.message?.includes("already exists")) {
        console.log("  (Object already exists, continuing...)");
      } else {
        console.error("  Full error:", error);
        throw error;
      }
    }
  }

    console.log(`\n✓ Migration ${migrationFile} completed successfully!`);
  }
  
  console.log("\n✓ All migrations completed successfully!");
}

runMigration().catch(console.error);

