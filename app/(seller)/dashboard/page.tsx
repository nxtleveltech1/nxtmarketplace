import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { getListingsBySellerId } from "@/lib/db/listings";
import { getSalesBySellerId } from "@/lib/db/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

export default async function SellerDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
    redirect("/marketplace");
  }

  const listings = await getListingsBySellerId(user.id);
  const sales = await getSalesBySellerId(user.id);

  const pendingListings = listings.filter(
    (l) => l.status === "SUBMITTED" || l.status === "UNDER_ADMIN_REVIEW"
  ).length;

  const totalSales = sales.length;
  const totalEarnings = sales.reduce(
    (sum, sale) => sum + sale.sellerPayoutCents,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <Link href="/listings/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{listings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingListings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalSales}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${(totalEarnings / 100).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {listings.length === 0 ? (
              <p className="text-muted-foreground">No listings yet</p>
            ) : (
              <div className="space-y-2">
                {listings.slice(0, 5).map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="block p-2 hover:bg-muted rounded"
                  >
                    <p className="font-medium">{listing.title}</p>
                    <p className="text-sm text-muted-foreground">{listing.status}</p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <p className="text-muted-foreground">No sales yet</p>
            ) : (
              <div className="space-y-2">
                {sales.slice(0, 5).map((sale) => (
                  <Link
                    key={sale.id}
                    href={`/sales/${sale.id}`}
                    className="block p-2 hover:bg-muted rounded"
                  >
                    <p className="font-medium">Sale #{sale.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{sale.status}</p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

