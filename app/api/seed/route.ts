import { seedListings } from "@/scripts/seed-listings";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Only allow in development or with proper auth
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Seeding is not allowed in production" },
        { status: 403 }
      );
    }

    const result = await seedListings();

    return NextResponse.json({
      message: `Successfully created ${result.listingsCreated} listings with ${result.imagesCreated || 0} images`,
      ...result,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        error: "Failed to seed listings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

