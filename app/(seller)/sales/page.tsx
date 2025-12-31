import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { getSalesBySellerId } from "@/lib/db/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { formatDate } from "@/lib/formatters";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SellerSalesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
    redirect("/marketplace");
  }

  const sales = await getSalesBySellerId(user.id);

  const totalEarnings = sales.reduce(
    (sum, sale) => sum + sale.sellerPayoutCents,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sales & Payouts</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Total Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <PriceDisplay cents={totalEarnings} className="text-4xl font-bold" />
        </CardContent>
      </Card>
      {sales.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No sales yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <Link key={sale.id} href={`/sales/${sale.id}`}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Sale #{sale.id.slice(0, 8)}</CardTitle>
                    <StatusBadge status={sale.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Sale Price</p>
                      <PriceDisplay cents={sale.salePriceCents} className="font-semibold" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Commission</p>
                      <PriceDisplay cents={sale.commissionCents} className="font-semibold" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payout</p>
                      <PriceDisplay cents={sale.sellerPayoutCents} className="font-semibold text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">{formatDate(sale.createdAt)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <StatusBadge status={sale.financialStatus} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

