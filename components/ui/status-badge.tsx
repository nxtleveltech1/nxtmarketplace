import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  // Listing statuses
  DRAFT: "bg-gray-500",
  SUBMITTED: "bg-blue-500",
  UNDER_ADMIN_REVIEW: "bg-yellow-500",
  REJECTED: "bg-red-500",
  APPROVED: "bg-green-500",
  LIVE: "bg-emerald-500",
  // Verification statuses
  NOT_REQUESTED: "bg-gray-500",
  AWAITING_ITEM: "bg-blue-500",
  IN_INSPECTION: "bg-yellow-500",
  VERIFIED: "bg-green-500",
  FAILED: "bg-red-500",
  // Sale statuses
  INITIATED: "bg-blue-500",
  PENDING_VERIFICATION: "bg-yellow-500",
  CONFIRMED: "bg-green-500",
  DISPATCHED: "bg-purple-500",
  DELIVERED: "bg-emerald-500",
  COMPLETED: "bg-green-600",
  CANCELLED: "bg-red-500",
  // Financial statuses
  PENDING: "bg-gray-500",
  HELD_IN_ESCROW: "bg-yellow-500",
  SETTLED: "bg-blue-500",
  PAID_OUT: "bg-green-500",
  REFUNDED: "bg-red-500",
  // Courier statuses
  NOT_REQUIRED: "bg-gray-500",
  AWAITING_PICKUP: "bg-blue-500",
  IN_TRANSIT: "bg-purple-500",
  RECEIVED_AT_NXT: "bg-yellow-500",
  DISPATCHED_TO_BUYER: "bg-blue-500",
  DELIVERED: "bg-green-500",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = statusColors[status] || "bg-gray-500";
  return (
    <Badge className={cn(colorClass, "text-white", className)}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

