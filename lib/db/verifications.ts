import { verifications } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, eq, inArray } from "drizzle-orm";

export async function getVerificationById(id: string) {
  const [verification] = await db
    .select()
    .from(verifications)
    .where(eq(verifications.id, id))
    .limit(1);
  return verification;
}

export async function getVerificationByListingId(listingId: string) {
  const [verification] = await db
    .select()
    .from(verifications)
    .where(eq(verifications.listingId, listingId))
    .limit(1);
  return verification;
}

export async function getPendingVerifications() {
  return await db
    .select()
    .from(verifications)
    .where(
      inArray(verifications.status, ["AWAITING_ITEM", "IN_INSPECTION"])
    )
    .orderBy(desc(verifications.createdAt));
}

export async function createVerification(listingId: string) {
  const [newVerification] = await db
    .insert(verifications)
    .values({
      listingId,
      status: "NOT_REQUESTED",
      createdAt: new Date(),
    })
    .returning();
  return newVerification;
}

export async function requestVerification(listingId: string) {
  // Check if verification already exists
  const existing = await getVerificationByListingId(listingId);
  
  if (existing) {
    const [updatedVerification] = await db
      .update(verifications)
      .set({
        status: "AWAITING_ITEM",
        createdAt: new Date(),
      })
      .where(eq(verifications.id, existing.id))
      .returning();
    return updatedVerification;
  }

  const [newVerification] = await db
    .insert(verifications)
    .values({
      listingId,
      status: "AWAITING_ITEM",
      createdAt: new Date(),
    })
    .returning();
  return newVerification;
}

export async function setVerificationInspection(id: string) {
  const [updatedVerification] = await db
    .update(verifications)
    .set({
      status: "IN_INSPECTION",
    })
    .where(eq(verifications.id, id))
    .returning();
  return updatedVerification;
}

export async function markVerificationVerified(
  id: string,
  inspectorNotes?: string
) {
  const [updatedVerification] = await db
    .update(verifications)
    .set({
      status: "VERIFIED",
      inspectorNotes,
      verifiedAt: new Date(),
    })
    .where(eq(verifications.id, id))
    .returning();
  return updatedVerification;
}

export async function markVerificationFailed(
  id: string,
  inspectorNotes?: string
) {
  const [updatedVerification] = await db
    .update(verifications)
    .set({
      status: "FAILED",
      inspectorNotes,
    })
    .where(eq(verifications.id, id))
    .returning();
  return updatedVerification;
}

