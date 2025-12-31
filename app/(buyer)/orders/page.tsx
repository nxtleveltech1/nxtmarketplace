import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { getSalesByUserId } from "@/lib/db/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriceDisplay } from "@/components/ui/price-display";
import Link from "next/link";
import { formatDate } from "@/lib/formatters";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  if (!user) {
    redirect("/sign-in");
  }

  const sales = await getSalesByUserId(user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      {sales.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <Link key={sale.id} href={`/orders/${sale.id}`}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Order #{sale.id.slice(0, 8)}</CardTitle>
                    <StatusBadge status={sale.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <PriceDisplay cents={sale.salePriceCents} className="text-xl font-bold" />
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(sale.createdAt)}
                      </p>
                    </div>
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

