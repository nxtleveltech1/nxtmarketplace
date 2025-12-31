import { getPublicListings } from "@/lib/db/listings";
import { ListingCard } from "@/components/listings/listing-card";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageSearch } from "lucide-react";
import { getVerificationByListingId } from "@/lib/db/verifications";

async function ListingsGrid({
  search,
  sort,
  verified,
}: {
  search?: string;
  sort?: string;
  verified?: string;
}) {
  let listings = await getPublicListings({
    status: ["LIVE"],
    search: search || undefined,
    limit: 100,
  });

  // Filter verified items if requested
  if (verified === "verified") {
    const verifiedListings = await Promise.all(
      listings.map(async (listing) => {
        const verification = await getVerificationByListingId(listing.id);
        return verification?.status === "VERIFIED" ? listing : null;
      })
    );
    listings = verifiedListings.filter((l): l is NonNullable<typeof l> => l !== null);
  }

  // Sort listings
  if (sort === "price-low") {
    listings.sort((a, b) => a.priceCents - b.priceCents);
  } else if (sort === "price-high") {
    listings.sort((a, b) => b.priceCents - a.priceCents);
  } else if (sort === "oldest") {
    listings.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
  }
  // "newest" is default (already sorted by getPublicListings)

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <PackageSearch className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No listings found</h2>
        <p className="text-muted-foreground max-w-md">
          {search || verified === "verified"
            ? "Try adjusting your search or filters to find what you're looking for."
            : "Be the first to list an item on the marketplace!"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-sm text-muted-foreground">
        {listings.length} {listings.length === 1 ? "item" : "items"} found
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </>
  );
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string; verified?: string }>;
}) {
  const params = await searchParams;
  const search = params?.search;
  const sort = params?.sort || "newest";
  const verified = params?.verified || "all";

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
        <p className="text-muted-foreground">
          Discover verified items from trusted sellers
        </p>
      </div>

      <div className="mb-8">
        <MarketplaceFilters />
      </div>

      <Suspense
        key={`${search}-${sort}-${verified}`}
        fallback={
          <div>
            <div className="mb-4">
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          </div>
        }
      >
        <ListingsGrid search={search} sort={sort} verified={verified} />
      </Suspense>
    </div>
  );
}

