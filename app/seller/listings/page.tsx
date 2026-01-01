import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { getListingsBySellerId } from "@/lib/db/listings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Edit } from "lucide-react";

export default async function SellerListingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
    redirect("/marketplace");
  }

  const listings = await getListingsBySellerId(user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link href="/seller/listings/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        </Link>
      </div>
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No listings yet</p>
          <Link href="/seller/listings/create">
            <Button>Create Your First Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <Card key={item.listing.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-2">{item.listing.title}</CardTitle>
                  <StatusBadge status={item.listing.status} />
                </div>
              </CardHeader>
              <CardContent>
                <PriceDisplay cents={item.listing.priceCents} className="text-2xl font-bold mb-4" />
                <div className="flex gap-2">
                  <Link href={`/seller/listings/${item.listing.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View
                    </Button>
                  </Link>
                  {item.listing.status === "DRAFT" && (
                    <>
                      <Link href={`/seller/listings/${item.listing.id}/edit`}>
                        <Button variant="outline" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

