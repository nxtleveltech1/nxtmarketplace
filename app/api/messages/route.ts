import { createMessage } from "@/lib/db/messages";
import { createUser, getUserByClerkId } from "@/lib/db/users";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const messageSchema = z.object({
  recipientId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  listingId: z.string().uuid().optional(), // This is for reference, not saleId
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let currentUserRecord = await getUserByClerkId(userId);
    if (!currentUserRecord) {
      // User exists in Clerk but not in DB - create them
      const clerkUserData = await currentUser();
      if (!clerkUserData) {
        return NextResponse.json({ error: "User not found in Clerk" }, { status: 404 });
      }
      currentUserRecord = await createUser({
        clerkId: userId,
        email: clerkUserData.emailAddresses[0]?.emailAddress || "",
        displayName: clerkUserData.fullName || clerkUserData.firstName || clerkUserData.username || "User",
        firstName: clerkUserData.firstName || undefined,
        lastName: clerkUserData.lastName || undefined,
        imageUrl: clerkUserData.imageUrl || undefined,
      });
    }

    const body = await req.json();
    const validatedData = messageSchema.parse(body);

    if (currentUserRecord.id === validatedData.recipientId) {
      return NextResponse.json({ error: "Cannot send message to yourself" }, { status: 400 });
    }

    // saleId is for actual sales, not listings - leave it undefined for inquiry messages
    const newMessage = await createMessage({
      senderId: currentUserRecord.id,
      recipientId: validatedData.recipientId,
      content: validatedData.content,
      saleId: undefined, // Only set when there's an actual sale, not for listing inquiries
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

