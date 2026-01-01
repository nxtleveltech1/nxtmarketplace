import { addFavourite, getFavouritesByUserId, isFavourite, removeFavourite } from "@/lib/db/favourites";
import { getUserByClerkId } from "@/lib/db/users";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const favouriteSchema = z.object({
  listingId: z.string().uuid(),
});

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const favourites = await getFavouritesByUserId(user.id);
    return NextResponse.json(favourites);
  } catch (error) {
    console.error("Error fetching favourites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { listingId } = favouriteSchema.parse(body);

    const alreadyFavourite = await isFavourite(user.id, listingId);
    if (alreadyFavourite) {
      return NextResponse.json({ error: "Already favourited" }, { status: 400 });
    }

    const favourite = await addFavourite(user.id, listingId);
    return NextResponse.json(favourite, { status: 201 });
  } catch (error) {
    console.error("Error adding favourite:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    await removeFavourite(user.id, listingId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing favourite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

