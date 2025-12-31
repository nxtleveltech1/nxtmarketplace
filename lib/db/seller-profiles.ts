import { sellerProfiles } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

export async function getSellerProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(sellerProfiles)
    .where(eq(sellerProfiles.userId, userId))
    .limit(1);
  return profile;
}

export async function createSellerProfile(userId: string) {
  const [newProfile] = await db
    .insert(sellerProfiles)
    .values({
      userId,
      tier: "STANDARD",
      rating: "0.0",
      totalSales: 0,
      failedVerifications: 0,
      createdAt: new Date(),
    })
    .returning();
  return newProfile;
}

export async function updateSellerProfile(
  userId: string,
  updates: {
    tier?: "STANDARD" | "VERIFIED_SELLER" | "GOLD_SELLER";
    rating?: string;
    totalSales?: number;
    failedVerifications?: number;
  }
) {
  const [updatedProfile] = await db
    .update(sellerProfiles)
    .set(updates)
    .where(eq(sellerProfiles.userId, userId))
    .returning();
  return updatedProfile;
}

export async function incrementSellerSales(userId: string) {
  const profile = await getSellerProfile(userId);
  if (!profile) {
    await createSellerProfile(userId);
  }
  const [updatedProfile] = await db
    .update(sellerProfiles)
    .set({
      totalSales: sql`${sellerProfiles.totalSales} + 1`,
    })
    .where(eq(sellerProfiles.userId, userId))
    .returning();
  return updatedProfile;
}

export async function incrementFailedVerifications(userId: string) {
  const profile = await getSellerProfile(userId);
  if (!profile) {
    await createSellerProfile(userId);
  }
  const [updatedProfile] = await db
    .update(sellerProfiles)
    .set({
      failedVerifications: sql`${sellerProfiles.failedVerifications} + 1`,
    })
    .where(eq(sellerProfiles.userId, userId))
    .returning();
  return updatedProfile;
}

export async function updateSellerRating(userId: string, newRating: number) {
  const profile = await getSellerProfile(userId);
  if (!profile) {
    await createSellerProfile(userId);
  }
  const [updatedProfile] = await db
    .update(sellerProfiles)
    .set({
      rating: newRating.toFixed(2),
    })
    .where(eq(sellerProfiles.userId, userId))
    .returning();
  return updatedProfile;
}

export async function promoteSellerTier(
  userId: string,
  tier: "VERIFIED_SELLER" | "GOLD_SELLER"
) {
  const [updatedProfile] = await db
    .update(sellerProfiles)
    .set({
      tier,
    })
    .where(eq(sellerProfiles.userId, userId))
    .returning();
  return updatedProfile;
}

