"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

type ContactSellerButtonProps = {
  sellerId: string;
  sellerName: string;
  listingId: string;
  listingTitle: string;
  currentUserId?: string;
};

export function ContactSellerButton({ sellerId, sellerName, listingId, listingTitle, currentUserId }: ContactSellerButtonProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Fetch database user ID when Clerk user is loaded
  useEffect(() => {
    if (isLoaded && user) {
      if (currentUserId) {
        setDbUserId(currentUserId);
      } else {
        // Fetch user from API
        fetch("/api/users")
          .then((res) => {
            if (res.ok) {
              return res.json();
            }
            throw new Error("Not authenticated");
          })
          .then((data) => {
            if (data && data.id) {
              setDbUserId(data.id);
            }
          })
          .catch((err) => {
            // User might not exist in DB yet or not authenticated
            console.log("Could not fetch user:", err);
          });
      }
    }
  }, [user, isLoaded, currentUserId]);

  const handleSendMessage = async () => {
    const userId = dbUserId || currentUserId;
    
    if (!userId || !isLoaded || !user) {
      toast.error("Please sign in to contact the seller");
      router.push("/sign-in");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (userId === sellerId) {
      toast.error("You cannot message yourself");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: sellerId,
          content: message,
          listingId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      toast.success("Message sent successfully!");
      setMessage("");
      setOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const userId = dbUserId || currentUserId;
  
  if (!isLoaded) {
    return (
      <Button variant="outline" className="w-full" disabled>
        <MessageSquare className="size-4 mr-2" />
        Loading...
      </Button>
    );
  }

  if (!userId || !user) {
    return (
      <Button onClick={() => router.push("/sign-in")} variant="outline" className="w-full">
        <MessageSquare className="size-4 mr-2" />
        Sign in to Contact Seller
      </Button>
    );
  }

  if (userId === sellerId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <MessageSquare className="size-4 mr-2" />
          Contact Seller
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact {sellerName}</DialogTitle>
          <DialogDescription>
            Send a message about: <strong>{listingTitle}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Ask about the product, shipping, or make an offer..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={loading || !message.trim()}>
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

