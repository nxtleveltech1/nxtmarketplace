import { getListingById } from "@/lib/db/listings";
import { createSale } from "@/lib/db/sales";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user to get their sales
    const { getUserByClerkId } = await import("@/lib/db/users");
    const user = await getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { getSalesByUserId } = await import("@/lib/db/sales");
    const sales = await getSalesByUserId(user.id);

    return NextResponse.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { listingId, courierCostsCents } = body;

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

    // Check if listing is available for purchase
    if (listing.status !== "LIVE") {
      return NextResponse.json(
        { error: "Listing is not available for purchase" },
        { status: 400 }
      );
    }

    // Check if user is trying to buy their own listing
    if (listing.sellerId === user.id) {
      return NextResponse.json(
        { error: "Cannot purchase your own listing" },
        { status: 400 }
      );
    }

    // Check if listing is verified
    const { getVerificationByListingId } = await import("@/lib/db/verifications");
    const verification = await getVerificationByListingId(listingId);

    const isVerified = verification?.status === "VERIFIED";
    const saleStatus = isVerified ? "CONFIRMED" : "PENDING_VERIFICATION";
    const financialStatus = "HELD_IN_ESCROW";

    const sale = await createSale({
      listingId,
      buyerId: user.id,
      sellerId: listing.sellerId,
      salePriceCents: listing.priceCents,
      courierCostsCents: courierCostsCents || 0,
      status: saleStatus,
      financialStatus,
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}

