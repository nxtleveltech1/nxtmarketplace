import { listings, listingImages, users } from "@/db/schema";
import { db } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";

export async function getListingsBySellerId(sellerId: string) {
  return await db
    .select({
      listing: listings,
    })
    .from(listings)
    .where(eq(listings.sellerId, sellerId))
    .orderBy(desc(listings.createdAt));
}

export async function getListingWithImages(id: string) {
  const listing = await db
    .select()
    .from(listings)
    .where(eq(listings.id, id))
    .limit(1);

  if (!listing[0]) return null;

  const images = await db
    .select()
    .from(listingImages)
    .where(eq(listingImages.listingId, id))
    .orderBy(listingImages.sortOrder);

  return {
    ...listing[0],
    images,
  };
}
