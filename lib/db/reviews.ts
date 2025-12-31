import { reviews } from "@/db/schema";
import { db } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";

export async function getReviewById(id: string) {
  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);
  return review;
}

export async function getReviewsBySaleId(saleId: string) {
  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.saleId, saleId))
    .orderBy(desc(reviews.createdAt));
}

export async function getReviewsByRevieweeId(revieweeId: string) {
  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.revieweeId, revieweeId))
    .orderBy(desc(reviews.createdAt));
}

export async function getReviewsByReviewerId(reviewerId: string) {
  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.reviewerId, reviewerId))
    .orderBy(desc(reviews.createdAt));
}

export async function getReviewBySaleAndReviewer(
  saleId: string,
  reviewerId: string
) {
  const [review] = await db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.saleId, saleId),
        eq(reviews.reviewerId, reviewerId)
      )
    )
    .limit(1);
  return review;
}

export async function createReview(data: {
  saleId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment?: string;
}) {
  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const [newReview] = await db
    .insert(reviews)
    .values({
      saleId: data.saleId,
      reviewerId: data.reviewerId,
      revieweeId: data.revieweeId,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date(),
    })
    .returning();
  return newReview;
}

export async function calculateAverageRating(revieweeId: string): Promise<number> {
  const allReviews = await getReviewsByRevieweeId(revieweeId);
  
  if (allReviews.length === 0) {
    return 0;
  }

  const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / allReviews.length;
}

