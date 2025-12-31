import { listingImages, listings } from "@/db/schema";
import { db } from "@/lib/db";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";

export async function getListingById(id: string) {
  const [listing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  return listing;
}

export async function getListingsBySellerId(sellerId: string) {
  return await db
    .select()
    .from(listings)
    .where(eq(listings.sellerId, sellerId))
    .orderBy(desc(listings.createdAt));
}

export async function getListingsByStatus(status: string[]) {
  return await db
    .select()
    .from(listings)
    .where(inArray(listings.status, status))
    .orderBy(desc(listings.createdAt));
}

export async function getPublicListings(filters?: {
  verified?: boolean;
  status?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [eq(listings.status, "LIVE")];

  if (filters?.status) {
    conditions.push(inArray(listings.status, filters.status));
  }

  if (filters?.search) {
    conditions.push(
      or(
        sql`${listings.title} ILIKE ${`%${filters.search}%`}`,
        sql`${listings.description} ILIKE ${`%${filters.search}%`}`
      )!
    );
  }

  let query = db
    .select()
    .from(listings)
    .where(and(...conditions))
    .orderBy(desc(listings.createdAt));

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return await query;
}

export async function createListing(data: {
  sellerId: string;
  title: string;
  description: string;
  priceCents: number;
  sellerLocation?: string;
  status?: "DRAFT" | "SUBMITTED";
}) {
  const [newListing] = await db
    .insert(listings)
    .values({
      sellerId: data.sellerId,
      title: data.title,
      description: data.description,
      priceCents: data.priceCents,
      sellerLocation: data.sellerLocation,
      status: data.status || "DRAFT",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  return newListing;
}

export async function updateListing(
  id: string,
  updates: {
    title?: string;
    description?: string;
    priceCents?: number;
    sellerLocation?: string;
    status?: string;
  }
) {
  const [updatedListing] = await db
    .update(listings)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(listings.id, id))
    .returning();
  return updatedListing;
}

export async function deleteListing(id: string) {
  await db.delete(listings).where(eq(listings.id, id));
}

export async function submitListing(id: string) {
  const [updatedListing] = await db
    .update(listings)
    .set({
      status: "SUBMITTED",
      updatedAt: new Date(),
    })
    .where(and(eq(listings.id, id), eq(listings.status, "DRAFT")))
    .returning();
  return updatedListing;
}

export async function approveListing(id: string) {
  const [updatedListing] = await db
    .update(listings)
    .set({
      status: "APPROVED",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(listings.id, id),
        or(eq(listings.status, "SUBMITTED"), eq(listings.status, "UNDER_ADMIN_REVIEW"))
      )
    )
    .returning();
  return updatedListing;
}

export async function rejectListing(id: string) {
  const [updatedListing] = await db
    .update(listings)
    .set({
      status: "REJECTED",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(listings.id, id),
        or(eq(listings.status, "SUBMITTED"), eq(listings.status, "UNDER_ADMIN_REVIEW"))
      )
    )
    .returning();
  return updatedListing;
}

export async function setListingUnderReview(id: string) {
  const [updatedListing] = await db
    .update(listings)
    .set({
      status: "UNDER_ADMIN_REVIEW",
      updatedAt: new Date(),
    })
    .where(eq(listings.id, id))
    .returning();
  return updatedListing;
}

export async function publishListing(id: string) {
  const [updatedListing] = await db
    .update(listings)
    .set({
      status: "LIVE",
      updatedAt: new Date(),
    })
    .where(eq(listings.status, "APPROVED"))
    .returning();
  return updatedListing;
}

export async function getListingImages(listingId: string) {
  return await db
    .select()
    .from(listingImages)
    .where(eq(listingImages.listingId, listingId))
    .orderBy(listingImages.sortOrder);
}

export async function addListingImage(data: {
  listingId: string;
  imageUrl: string;
  sortOrder?: number;
}) {
  const [newImage] = await db
    .insert(listingImages)
    .values({
      listingId: data.listingId,
      imageUrl: data.imageUrl,
      sortOrder: data.sortOrder || 0,
    })
    .returning();
  return newImage;
}

export async function deleteListingImage(imageId: string) {
  await db.delete(listingImages).where(eq(listingImages.id, imageId));
}

