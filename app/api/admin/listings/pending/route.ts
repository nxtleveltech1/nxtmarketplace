import { getListingsByStatus } from "@/lib/db/listings";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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

    const pendingListings = await getListingsByStatus([
      "SUBMITTED",
      "UNDER_ADMIN_REVIEW",
    ]);

    return NextResponse.json(pendingListings);
  } catch (error) {
    console.error("Error fetching pending listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending listings" },
      { status: 500 }
    );
  }
}

