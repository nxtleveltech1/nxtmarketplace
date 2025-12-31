"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ApproveButtonProps {
  listingId: string;
}

export function ApproveButton({ listingId }: ApproveButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/listings/${listingId}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to approve listing");
      toast.success("Listing approved!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve listing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleApprove} disabled={isLoading} variant="default">
      {isLoading ? "Approving..." : "Approve"}
    </Button>
  );
}

interface RejectButtonProps {
  listingId: string;
}

export function RejectButton({ listingId }: RejectButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/listings/${listingId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: "" }),
      });
      if (!res.ok) throw new Error("Failed to reject listing");
      toast.success("Listing rejected");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject listing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleReject} disabled={isLoading} variant="destructive">
      {isLoading ? "Rejecting..." : "Reject"}
    </Button>
  );
}

