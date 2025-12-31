import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { getListingsByStatus } from "@/lib/db/listings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApproveButton, RejectButton } from "@/components/admin/listing-actions";

export default async function AdminReviewPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  if (!user || user.role !== "ADMIN") {
    redirect("/marketplace");
  }

  const pendingListings = await getListingsByStatus([
    "SUBMITTED",
    "UNDER_ADMIN_REVIEW",
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Listing Review Queue</h1>
      {pendingListings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No pending listings</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingListings.map((listing) => (
            <Card key={listing.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{listing.title}</CardTitle>
                  <StatusBadge status={listing.status} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {listing.description}
                </p>
                <div className="flex items-center justify-between">
                  <PriceDisplay cents={listing.priceCents} className="text-2xl font-bold" />
                  <div className="flex gap-2">
                    <Link href={`/listings/${listing.id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                    <ApproveButton listingId={listing.id} />
                    <RejectButton listingId={listing.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

