import { createReview, getReviewsByRevieweeId } from "@/lib/db/reviews";
import { getSaleById } from "@/lib/db/sales";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const revieweeId = searchParams.get("revieweeId");

    if (!revieweeId) {
      return NextResponse.json(
        { error: "Missing revieweeId" },
        { status: 400 }
      );
    }

    const reviews = await getReviewsByRevieweeId(revieweeId);

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
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
    const { saleId, rating, comment } = body;

    if (!saleId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Get user and sale
    const { getUserByClerkId } = await import("@/lib/db/users");
    const user = await getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sale = await getSaleById(saleId);

    if (!sale) {
      return NextResponse.json(
        { error: "Sale not found" },
        { status: 404 }
      );
    }

    // Check if sale is completed
    if (sale.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only review completed sales" },
        { status: 400 }
      );
    }

    // Determine reviewee (the other party in the sale)
    const revieweeId =
      sale.buyerId === user.id ? sale.sellerId : sale.buyerId;

    // Check if review already exists
    const { getReviewBySaleAndReviewer } = await import("@/lib/db/reviews");
    const existingReview = await getReviewBySaleAndReviewer(saleId, user.id);

    if (existingReview) {
      return NextResponse.json(
        { error: "Review already exists for this sale" },
        { status: 400 }
      );
    }

    const review = await createReview({
      saleId,
      reviewerId: user.id,
      revieweeId,
      rating,
      comment,
    });

    // Update seller rating if reviewee is a seller
    if (revieweeId === sale.sellerId) {
      const { calculateAverageRating } = await import("@/lib/db/reviews");
      const { updateSellerRating } = await import("@/lib/db/seller-profiles");
      const avgRating = await calculateAverageRating(revieweeId);
      await updateSellerRating(revieweeId, avgRating);
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

