import { approveListing, getListingById } from "@/lib/db/listings";
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

    const listing = await getListingById(id);

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    const approvedListing = await approveListing(id);

    return NextResponse.json(approvedListing);
  } catch (error) {
    console.error("Error approving listing:", error);
    return NextResponse.json(
      { error: "Failed to approve listing" },
      { status: 500 }
    );
  }
}

