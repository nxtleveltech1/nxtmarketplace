import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { getSaleById } from "@/lib/db/sales";
import { getListingById } from "@/lib/db/listings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { formatDateTime } from "@/lib/formatters";
import { notFound, redirect } from "next/navigation";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    redirect("/sign-in");
  }

  const sale = await getSaleById(id);

  if (!sale) {
    notFound();
  }

  // Check if user is involved in this sale
  if (sale.buyerId !== user.id && sale.sellerId !== user.id && user.role !== "ADMIN") {
    redirect("/orders");
  }

  const listing = await getListingById(sale.listingId);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order Details</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono">{sale.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={sale.status} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Financial Status</p>
              <StatusBadge status={sale.financialStatus} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p>{formatDateTime(sale.createdAt)}</p>
            </div>
            {sale.completedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p>{formatDateTime(sale.completedAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pricing Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Sale Price</span>
              <PriceDisplay cents={sale.salePriceCents} />
            </div>
            <div className="flex justify-between">
              <span>Commission (20%)</span>
              <PriceDisplay cents={sale.commissionCents} />
            </div>
            <div className="flex justify-between font-bold text-lg pt-4 border-t">
              <span>Seller Payout</span>
              <PriceDisplay cents={sale.sellerPayoutCents} />
            </div>
          </CardContent>
        </Card>
      </div>
      {listing && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-lg">{listing.title}</h3>
            <p className="text-muted-foreground mt-2">{listing.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

