import { getListingById } from "@/lib/db/listings";
import { requestVerification } from "@/lib/db/verifications";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: "Missing listingId" },
        { status: 400 }
      );
    }

    // Get user and listing
    const { getUserByClerkId } = await import("@/lib/db/users");
    const user = await getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const listing = await getListingById(listingId);

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Only seller can request verification for their own listings
    if (listing.sellerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const verification = await requestVerification(listingId);

    return NextResponse.json(verification, { status: 201 });
  } catch (error) {
    console.error("Error requesting verification:", error);
    return NextResponse.json(
      { error: "Failed to request verification" },
      { status: 500 }
    );
  }
}

