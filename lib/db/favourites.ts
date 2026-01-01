import { favourites, listings } from "@/db/schema";
import { db } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";

export async function getFavouritesByUserId(userId: string) {
  return await db
    .select({
      favourite: favourites,
      listing: listings,
    })
    .from(favourites)
    .innerJoin(listings, eq(favourites.listingId, listings.id))
    .where(eq(favourites.userId, userId))
    .orderBy(desc(favourites.createdAt));
}

export async function isFavourite(userId: string, listingId: string) {
  const [favourite] = await db
    .select()
    .from(favourites)
    .where(and(eq(favourites.userId, userId), eq(favourites.listingId, listingId)))
    .limit(1);
  return !!favourite;
}

export async function addFavourite(userId: string, listingId: string) {
  const [newFavourite] = await db
    .insert(favourites)
    .values({
      userId,
      listingId,
      createdAt: new Date(),
    })
    .returning();
  return newFavourite;
}

export async function removeFavourite(userId: string, listingId: string) {
  await db
    .delete(favourites)
    .where(and(eq(favourites.userId, userId), eq(favourites.listingId, listingId)));
}

