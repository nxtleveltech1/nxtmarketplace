import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { createMessage } from "@/lib/db/messages";
import { NextResponse } from "next/server";
import { z } from "zod";

const messageSchema = z.object({
  recipientId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  listingId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await getUserByClerkId(userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const validatedData = messageSchema.parse(body);

    if (currentUser.id === validatedData.recipientId) {
      return NextResponse.json({ error: "Cannot send message to yourself" }, { status: 400 });
    }

    const newMessage = await createMessage({
      senderId: currentUser.id,
      recipientId: validatedData.recipientId,
      content: validatedData.content,
      saleId: validatedData.listingId,
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

