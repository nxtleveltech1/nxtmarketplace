import { sales, listings, users } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function getSalesByBuyerId(buyerId: string) {
  const results = await db
    .select({
      sale: sales,
      listing: listings,
      sellerId: sales.sellerId,
    })
    .from(sales)
    .innerJoin(listings, eq(sales.listingId, listings.id))
    .where(eq(sales.buyerId, buyerId))
    .orderBy(desc(sales.createdAt));

  const salesWithSeller = await Promise.all(
    results.map(async (item) => {
      const [seller] = await db
        .select()
        .from(users)
        .where(eq(users.id, item.sellerId))
        .limit(1);
      return {
        sale: item.sale,
        listing: item.listing,
        seller: seller!,
      };
    })
  );

  return salesWithSeller;
}

export async function getSalesBySellerId(sellerId: string) {
  const results = await db
    .select({
      sale: sales,
      listing: listings,
      buyerId: sales.buyerId,
    })
    .from(sales)
    .innerJoin(listings, eq(sales.listingId, listings.id))
    .where(eq(sales.sellerId, sellerId))
    .orderBy(desc(sales.createdAt));

  const salesWithBuyer = await Promise.all(
    results.map(async (item) => {
      const [buyer] = await db
        .select()
        .from(users)
        .where(eq(users.id, item.buyerId))
        .limit(1);
      return {
        sale: item.sale,
        listing: item.listing,
        buyer: buyer!,
      };
    })
  );

  return salesWithBuyer;
}

export async function getSaleById(id: string) {
  const [sale] = await db
    .select()
    .from(sales)
    .where(eq(sales.id, id))
    .limit(1);
  return sale;
}

export async function getSaleWithDetails(id: string) {
  const [saleData] = await db
    .select({
      sale: sales,
      listing: listings,
      sellerId: sales.sellerId,
      buyerId: sales.buyerId,
    })
    .from(sales)
    .innerJoin(listings, eq(sales.listingId, listings.id))
    .where(eq(sales.id, id))
    .limit(1);

  if (!saleData) return null;

  const [seller] = await db.select().from(users).where(eq(users.id, saleData.sellerId)).limit(1);
  const [buyer] = await db.select().from(users).where(eq(users.id, saleData.buyerId)).limit(1);

  return {
    sale: saleData.sale,
    listing: saleData.listing,
    seller: seller!,
    buyer: buyer!,
  };
}
