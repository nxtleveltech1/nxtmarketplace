import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { getConversationsByUserId } from "@/lib/db/messages";
import { getUserByClerkId, getUserById } from "@/lib/db/users";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function MessagesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getUserByClerkId(userId);
  if (!user) redirect("/sign-in");

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">Your conversations with buyers and sellers</p>
        </div>

        {conversationsWithUsers.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Start a conversation by contacting a seller or buyer"
            action={
              <Link href="/marketplace" className="text-sm font-medium text-primary hover:underline">
                Browse Marketplace
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {conversationsWithUsers.map((conv) => {
              const initials = conv.otherUser?.displayName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "U";

              return (
                <Link
                  key={`${conv.otherUserId}-${conv.saleId || ""}`}
                  href={`/account/messages/${conv.otherUserId}${conv.saleId ? `?saleId=${conv.saleId}` : ""}`}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conv.otherUser?.imageUrl || ""} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <CardTitle className="text-base">
                              {conv.otherUser?.displayName || "Unknown User"}
                            </CardTitle>
                            {conv.unreadCount > 0 && (
                              <Badge variant="destructive">{conv.unreadCount}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {conv.lastMessage.content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

