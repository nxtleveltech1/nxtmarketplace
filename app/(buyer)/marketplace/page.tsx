import { getPublicListings } from "@/lib/db/listings";
import { ListingCard } from "@/components/listings/listing-card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

async function ListingsGrid() {
  const listings = await getPublicListings({
    status: ["LIVE"],
    limit: 50,
  });

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No listings found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Marketplace</h1>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        }
      >
        <ListingsGrid />
      </Suspense>
    </div>
  );
}

