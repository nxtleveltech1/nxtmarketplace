import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface VerificationBadgeProps {
  verified: boolean;
  className?: string;
}

export function VerificationBadge({
  verified,
  className,
}: VerificationBadgeProps) {
  if (!verified) return null;

  return (
    <Badge
      variant="outline"
      className={`bg-green-50 text-green-700 border-green-200 ${className}`}
    >
      <CheckCircle2 className="w-3 h-3 mr-1" />
      Verified
    </Badge>
  );
}

