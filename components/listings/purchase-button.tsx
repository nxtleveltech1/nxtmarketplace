"use client";

import { Button } from "@/components/ui/button";
import { useCreateSale } from "@/hooks/use-sales";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PurchaseButtonProps {
  listingId: string;
  priceCents: number;
}

export function PurchaseButton({ listingId, priceCents }: PurchaseButtonProps) {
  const router = useRouter();
  const createSale = useCreateSale();

  const handlePurchase = async () => {
    try {
      const sale = await createSale.mutateAsync({
        listingId,
        courierCostsCents: 0, // TODO: Calculate actual courier costs
      });
      toast.success("Purchase successful!");
      router.push(`/orders/${sale.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to complete purchase");
    }
  };

  return (
    <Button
      onClick={handlePurchase}
      disabled={createSale.isPending}
      size="lg"
      className="w-full"
    >
      {createSale.isPending ? "Processing..." : "Purchase Now"}
    </Button>
  );
}

