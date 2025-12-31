import { MarketplaceHeader } from "@/components/marketplace/marketplace-header";
import { MarketplaceContent } from "@/components/marketplace/marketplace-content";
import { getPublicListings } from "@/lib/db/listings";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await searchParams;
  const listings = await getPublicListings({
    status: ["LIVE"],
    search: params?.search,
    limit: 100,
  });

  // Convert Date objects to strings for the client component
  const listingsForClient = listings.map((listing) => ({
    ...listing,
    createdAt: listing.createdAt ? listing.createdAt.toISOString() : null,
    updatedAt: listing.updatedAt ? listing.updatedAt.toISOString() : null,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <MarketplaceHeader searchQuery={params?.search || ""} />
      <MarketplaceContent initialListings={listingsForClient} initialSearch={params?.search || ""} />
    </div>
  );
}
