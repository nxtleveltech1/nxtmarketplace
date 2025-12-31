import { getListingById } from "@/lib/db/listings";
import { incrementFailedVerifications } from "@/lib/db/seller-profiles";
import {
    getVerificationById,
    markVerificationFailed,
} from "@/lib/db/verifications";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user to check admin role
    const { getUserByClerkId } = await import("@/lib/db/users");
    const user = await getUserByClerkId(userId);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const verification = await getVerificationById(id);

    if (!verification) {
      return NextResponse.json(
        { error: "Verification not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { inspectorNotes } = body;

    const failed = await markVerificationFailed(id, inspectorNotes);

    // Update seller's failed verification count
    const listing = await getListingById(verification.listingId);
    if (listing) {
      await incrementFailedVerifications(listing.sellerId);
    }

    return NextResponse.json(failed);
  } catch (error) {
    console.error("Error failing verification:", error);
    return NextResponse.json(
      { error: "Failed to mark verification as failed" },
      { status: 500 }
    );
  }
}

