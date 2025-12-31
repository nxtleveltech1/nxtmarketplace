import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(DATABASE_URL);

async function addCheckConstraints() {
  try {
    await sql.query(
      `ALTER TABLE reviews ADD CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5)`
    );
    console.log("✓ reviews_rating_check added");
  } catch (e: any) {
    if (e.code === "42710") {
      console.log("  reviews_rating_check already exists");
    } else {
      throw e;
    }
  }

  try {
    await sql.query(
      `ALTER TABLE courier_shipments ADD CONSTRAINT courier_shipments_direction_check CHECK (direction IN ('SELLER_TO_NXT', 'NXT_TO_BUYER'))`
    );
    console.log("✓ courier_shipments_direction_check added");
  } catch (e: any) {
    if (e.code === "42710") {
      console.log("  courier_shipments_direction_check already exists");
    } else {
      throw e;
    }
  }

  console.log("\n✓ All CHECK constraints applied");
}

addCheckConstraints().catch(console.error);

