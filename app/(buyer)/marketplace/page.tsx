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

  return (
    <div className="min-h-screen flex flex-col">
      <MarketplaceHeader searchQuery={params?.search || ""} />
      <MarketplaceContent initialListings={listings} initialSearch={params?.search || ""} />
    </div>
  );
}
