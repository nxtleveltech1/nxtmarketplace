import { formatPrice } from "@/lib/formatters";

interface PriceDisplayProps {
  cents: number;
  className?: string;
}

export function PriceDisplay({ cents, className }: PriceDisplayProps) {
  return <span className={className}>{formatPrice(cents)}</span>;
}

