import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { getSalesByBuyerId } from "@/lib/db/sales";
import { getUserByClerkId } from "@/lib/db/users";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { PriceDisplay } from "@/components/ui/price-display";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function PurchasesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getUserByClerkId(userId);
  if (!user) redirect("/sign-in");

  const purchases = await getSalesByBuyerId(user.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Purchase History</h1>
          <p className="text-muted-foreground">Your completed and pending purchases</p>
        </div>

        {purchases.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No purchases yet"
            description="Your purchase history will appear here"
            action={
              <Link href="/marketplace" className="text-sm font-medium text-primary hover:underline">
                Browse Marketplace
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Link key={purchase.sale.id} href={`/orders/${purchase.sale.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{purchase.listing.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Seller: {purchase.seller.displayName}</span>
                          <span>
                            {formatDistanceToNow(new Date(purchase.sale.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={purchase.sale.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <PriceDisplay cents={purchase.sale.salePriceCents} className="text-xl font-bold" />
                      <Badge variant="outline">{purchase.sale.financialStatus}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

