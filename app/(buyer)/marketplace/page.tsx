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
    id: listing.id,
    title: listing.title,
    description: listing.description,
    priceCents: listing.priceCents,
    status: listing.status,
    sellerLocation: listing.sellerLocation,
    createdAt: listing.createdAt ? listing.createdAt.toISOString() : null,
    images: [],
    category: undefined,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <MarketplaceHeader searchQuery={params?.search || ""} />
      <MarketplaceContent initialListings={listingsForClient} initialSearch={params?.search || ""} />
    </div>
  );
}
