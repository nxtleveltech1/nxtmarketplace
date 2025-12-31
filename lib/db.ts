import * as schema from "@/db/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const DATABASE_URL = process.env.DATABASE_URL;

// Only throw error at runtime, not during build
if (!DATABASE_URL && process.env.NEXT_PHASE !== "phase-production-build") {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Use a placeholder during build if DATABASE_URL is not set
const sql = neon(DATABASE_URL || "postgresql://");
export const db = drizzle(sql, { schema });

export { sql };

