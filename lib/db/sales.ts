import { sales } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, eq, or } from "drizzle-orm";

export function calculateCommission(salePriceCents: number): number {
  return Math.floor(salePriceCents * 0.2); // 20% commission
}

export function calculateSellerPayout(
  salePriceCents: number,
  courierCostsCents: number = 0
): number {
  const commission = calculateCommission(salePriceCents);
  return salePriceCents - commission - courierCostsCents;
}

export async function getSaleById(id: string) {
  const [sale] = await db.select().from(sales).where(eq(sales.id, id)).limit(1);
  return sale;
}

export async function getSalesByBuyerId(buyerId: string) {
  return await db
    .select()
    .from(sales)
    .where(eq(sales.buyerId, buyerId))
    .orderBy(desc(sales.createdAt));
}

export async function getSalesBySellerId(sellerId: string) {
  return await db
    .select()
    .from(sales)
    .where(eq(sales.sellerId, sellerId))
    .orderBy(desc(sales.createdAt));
}

export async function getSalesByUserId(userId: string) {
  return await db
    .select()
    .from(sales)
    .where(or(eq(sales.buyerId, userId), eq(sales.sellerId, userId)))
    .orderBy(desc(sales.createdAt));
}

export async function createSale(data: {
  listingId: string;
  buyerId: string;
  sellerId: string;
  salePriceCents: number;
  courierCostsCents?: number;
  status?: "INITIATED" | "PENDING_VERIFICATION" | "CONFIRMED";
  financialStatus?: "PENDING" | "HELD_IN_ESCROW";
}) {
  const commissionCents = calculateCommission(data.salePriceCents);
  const sellerPayoutCents = calculateSellerPayout(
    data.salePriceCents,
    data.courierCostsCents || 0
  );

  const [newSale] = await db
    .insert(sales)
    .values({
      listingId: data.listingId,
      buyerId: data.buyerId,
      sellerId: data.sellerId,
      salePriceCents: data.salePriceCents,
      commissionCents,
      sellerPayoutCents,
      status: data.status || "INITIATED",
      financialStatus: data.financialStatus || "HELD_IN_ESCROW",
      createdAt: new Date(),
    })
    .returning();
  return newSale;
}

export async function updateSaleStatus(
  id: string,
  status: string,
  financialStatus?: string
) {
  const updates: any = {
    status,
    updatedAt: new Date(),
  };

  if (financialStatus) {
    updates.financialStatus = financialStatus;
  }

  if (status === "COMPLETED") {
    updates.completedAt = new Date();
    updates.financialStatus = financialStatus || "PAID_OUT";
  }

  const [updatedSale] = await db
    .update(sales)
    .set(updates)
    .where(eq(sales.id, id))
    .returning();
  return updatedSale;
}

export async function updateSaleFinancialStatus(
  id: string,
  financialStatus: string
) {
  const [updatedSale] = await db
    .update(sales)
    .set({
      financialStatus,
    })
    .where(eq(sales.id, id))
    .returning();
  return updatedSale;
}

export async function completeSale(id: string) {
  const [updatedSale] = await db
    .update(sales)
    .set({
      status: "COMPLETED",
      financialStatus: "PAID_OUT",
      completedAt: new Date(),
    })
    .where(eq(sales.id, id))
    .returning();
  return updatedSale;
}

export async function cancelSale(id: string) {
  const [updatedSale] = await db
    .update(sales)
    .set({
      status: "CANCELLED",
      financialStatus: "REFUNDED",
    })
    .where(eq(sales.id, id))
    .returning();
  return updatedSale;
}

