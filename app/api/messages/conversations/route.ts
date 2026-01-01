import { getConversationsByUserId } from "@/lib/db/messages";
import { getUserByClerkId, getUserById } from "@/lib/db/users";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

    const conversations = await getConversationsByUserId(user.id);
    
    const conversationsWithUsers = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = await getUserById(conv.otherUserId);
        return {
          ...conv,
          otherUser: otherUser ? {
            id: otherUser.id,
            displayName: otherUser.displayName,
            imageUrl: otherUser.imageUrl,
          } : null,
        };
      })
    );

    return NextResponse.json(conversationsWithUsers);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

