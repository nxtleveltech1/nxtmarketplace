import { createCourierShipment } from "@/lib/db/courier-shipments";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user to check admin role
    const { getUserByClerkId } = await import("@/lib/db/users");
    const user = await getUserByClerkId(userId);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { saleId, direction, status, trackingReference, costCents } = body;

    if (!saleId || !direction) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const shipment = await createCourierShipment({
      saleId,
      direction,
      status,
      trackingReference,
      costCents,
    });

    return NextResponse.json(shipment, { status: 201 });
  } catch (error) {
    console.error("Error creating courier shipment:", error);
    return NextResponse.json(
      { error: "Failed to create courier shipment" },
      { status: 500 }
    );
  }
}

