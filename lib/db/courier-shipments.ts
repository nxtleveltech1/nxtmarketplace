import { courierShipments } from "@/db/schema";
import { db } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";

export async function getCourierShipmentById(id: string) {
  const [shipment] = await db
    .select()
    .from(courierShipments)
    .where(eq(courierShipments.id, id))
    .limit(1);
  return shipment;
}

export async function getCourierShipmentsBySaleId(saleId: string) {
  return await db
    .select()
    .from(courierShipments)
    .where(eq(courierShipments.saleId, saleId))
    .orderBy(desc(courierShipments.createdAt));
}

export async function createCourierShipment(data: {
  saleId: string;
  direction: "SELLER_TO_NXT" | "NXT_TO_BUYER";
  status?: "NOT_REQUIRED" | "AWAITING_PICKUP" | "IN_TRANSIT" | "RECEIVED_AT_NXT" | "DISPATCHED_TO_BUYER" | "DELIVERED";
  trackingReference?: string;
  costCents?: number;
}) {
  const [newShipment] = await db
    .insert(courierShipments)
    .values({
      saleId: data.saleId,
      direction: data.direction,
      status: data.status || "AWAITING_PICKUP",
      trackingReference: data.trackingReference,
      costCents: data.costCents,
      createdAt: new Date(),
    })
    .returning();
  return newShipment;
}

export async function updateCourierShipmentStatus(
  id: string,
  status: "NOT_REQUIRED" | "AWAITING_PICKUP" | "IN_TRANSIT" | "RECEIVED_AT_NXT" | "DISPATCHED_TO_BUYER" | "DELIVERED",
  trackingReference?: string
) {
  const updates: { status: typeof status; trackingReference?: string } = {
    status,
  };

  if (trackingReference) {
    updates.trackingReference = trackingReference;
  }

  const [updatedShipment] = await db
    .update(courierShipments)
    .set(updates)
    .where(eq(courierShipments.id, id))
    .returning();
  return updatedShipment;
}

export async function getShipmentByDirection(
  saleId: string,
  direction: "SELLER_TO_NXT" | "NXT_TO_BUYER"
) {
  const [shipment] = await db
    .select()
    .from(courierShipments)
    .where(
      and(
        eq(courierShipments.saleId, saleId),
        eq(courierShipments.direction, direction)
      )
    )
    .limit(1);
  return shipment;
}

