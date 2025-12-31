import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { db } from "@/lib/db";
import { sales } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { formatDate } from "@/lib/formatters";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";

export default async function AdminTransactionsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  if (!user || user.role !== "ADMIN") {
    redirect("/marketplace");
  }

  const allSales = await db.select().from(sales).orderBy(desc(sales.createdAt));

  const totalCommissions = allSales.reduce(
    (sum, sale) => sum + sale.commissionCents,
    0
  );
  const pendingPayouts = allSales
    .filter((sale) => sale.financialStatus === "HELD_IN_ESCROW")
    .reduce((sum, sale) => sum + sale.sellerPayoutCents, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Transaction Monitor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceDisplay cents={totalCommissions} className="text-3xl font-bold" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceDisplay cents={pendingPayouts} className="text-3xl font-bold" />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        {allSales.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          allSales.map((sale) => (
            <Card key={sale.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>Sale #{sale.id.slice(0, 8)}</CardTitle>
                  <div className="flex gap-2">
                    <StatusBadge status={sale.status} />
                    <StatusBadge status={sale.financialStatus} />
                  </div>
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
                    <p className="text-sm text-muted-foreground">Seller Payout</p>
                    <PriceDisplay cents={sale.sellerPayoutCents} className="font-semibold" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">{formatDate(sale.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

