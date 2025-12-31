"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface VerifyButtonProps {
  verificationId: string;
}

export function VerifyButton({ verificationId }: VerifyButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/verifications/${verificationId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inspectorNotes: "" }),
      });
      if (!res.ok) throw new Error("Failed to verify item");
      toast.success("Item verified!");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to verify item";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleVerify} disabled={isLoading} variant="default">
      {isLoading ? "Verifying..." : "Verify"}
    </Button>
  );
}

interface FailButtonProps {
  verificationId: string;
}

export function FailButton({ verificationId }: FailButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleFail = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/verifications/${verificationId}/fail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inspectorNotes: "" }),
      });
      if (!res.ok) throw new Error("Failed to mark verification as failed");
      toast.success("Verification marked as failed");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to mark verification as failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleFail} disabled={isLoading} variant="destructive">
      {isLoading ? "Failing..." : "Fail"}
    </Button>
  );
}

