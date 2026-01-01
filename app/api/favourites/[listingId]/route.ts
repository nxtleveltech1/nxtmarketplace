import { isFavourite, addFavourite, removeFavourite } from "@/lib/db/favourites";
import { getUserByClerkId } from "@/lib/db/users";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const favourite = await isFavourite(user.id, params.listingId);
    return NextResponse.json({ isFavourite: favourite });
  } catch (error) {
    console.error("Error checking favourite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const alreadyFavourite = await isFavourite(user.id, params.listingId);
    if (alreadyFavourite) {
      return NextResponse.json({ error: "Already favourited" }, { status: 400 });
    }

    const favourite = await addFavourite(user.id, params.listingId);
    return NextResponse.json(favourite, { status: 201 });
  } catch (error) {
    console.error("Error adding favourite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await removeFavourite(user.id, params.listingId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing favourite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

