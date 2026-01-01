import { listingImages, listings } from "@/db/schema";
import { db } from "@/lib/db";
import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";

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

export async function getListingById(id: string) {
  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, id))
    .limit(1);
  return listing || null;
}

export async function getListingImages(listingId: string) {
  return await db
    .select()
    .from(listingImages)
    .where(eq(listingImages.listingId, listingId))
    .orderBy(listingImages.sortOrder);
}

export async function getPublicListings(options?: {
  verified?: boolean;
  status?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}) {
  let query = db.select().from(listings);

  const conditions = [];

  if (options?.status && options.status.length > 0) {
    conditions.push(inArray(listings.status, options.status as any));
  } else {
    // Default to LIVE listings if no status specified
    conditions.push(eq(listings.status, "LIVE"));
  }

  if (options?.search) {
    const searchTerm = `%${options.search}%`;
    conditions.push(
      or(
        ilike(listings.title, searchTerm),
        ilike(listings.description, searchTerm)
      )!
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)!) as any;
  }

  query = query.orderBy(desc(listings.createdAt)) as any;

  if (options?.limit) {
    query = query.limit(options.limit) as any;
  }

  if (options?.offset) {
    query = query.offset(options.offset) as any;
  }

  return await query;
}

export async function getListingsByStatus(statuses: string[]) {
  return await db
    .select()
    .from(listings)
    .where(inArray(listings.status, statuses as any))
    .orderBy(desc(listings.createdAt));
}

export async function createListing(data: {
  sellerId: string;
  title: string;
  description: string;
  priceCents: number;
  sellerLocation?: string | null;
  status?: string;
}) {
  const [listing] = await db
    .insert(listings)
    .values({
      sellerId: data.sellerId,
      title: data.title,
      description: data.description,
      priceCents: data.priceCents,
      sellerLocation: data.sellerLocation || null,
      status: (data.status as any) || "SUBMITTED",
      updatedAt: new Date(),
    })
    .returning();
  return listing;
}

export async function updateListing(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    priceCents: number;
    sellerLocation: string | null;
    status: string;
  }>
) {
  const [updated] = await db
    .update(listings)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(listings.id, id))
    .returning();
  return updated;
}

export async function deleteListing(id: string) {
  await db.delete(listings).where(eq(listings.id, id));
}

export async function approveListing(id: string) {
  const [approved] = await db
    .update(listings)
    .set({
      status: "LIVE",
      updatedAt: new Date(),
    })
    .where(eq(listings.id, id))
    .returning();
  return approved;
}

export async function rejectListing(id: string) {
  const [rejected] = await db
    .update(listings)
    .set({
      status: "REJECTED",
      updatedAt: new Date(),
    })
    .where(eq(listings.id, id))
    .returning();
  return rejected;
}
