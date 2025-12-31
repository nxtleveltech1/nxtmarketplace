"use client";

import { useState, useMemo } from "react";
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header";
import { MarketplaceSidebarNew, type FilterState } from "@/components/marketplace/marketplace-sidebar-new";
import { ListingCardNew } from "@/components/listings/listing-card-new";
import { getPublicListings } from "@/lib/db/listings";
import { getVerificationByListingId } from "@/lib/db/verifications";

async function getListingsData() {
  const listings = await getPublicListings({
    status: ["LIVE"],
    limit: 100,
  });

  const listingsWithVerification = await Promise.all(
    listings.map(async (listing) => {
      const verification = await getVerificationByListingId(listing.id);
      return {
        ...listing,
        isVerified: verification?.status === "VERIFIED",
      };
    })
  );

  return listingsWithVerification;
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    category: "All",
    priceRange: [0, 5000],
    conditions: [],
    brands: [],
  });

  // Load listings on mount
  useState(() => {
    getListingsData().then(setListings);
  });

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      // Only show active listings
      if (listing.status !== "LIVE") return false;

      // Filter by search query
      const matchesSearch =
        searchQuery === "" ||
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by category (if we have category field)
      const matchesCategory = filters.category === "All" || listing.category === filters.category;

      // Filter by price range (convert cents to dollars)
      const priceInDollars = listing.priceCents / 100;
      const matchesPrice = priceInDollars >= filters.priceRange[0] && priceInDollars <= filters.priceRange[1];

      // Filter by condition (if we have condition field)
      const matchesCondition = filters.conditions.length === 0 || filters.conditions.includes(listing.condition);

      // Filter by brand (check if listing title contains any selected brand)
      const matchesBrand =
        filters.brands.length === 0 ||
        filters.brands.some((brand) => listing.title.toLowerCase().includes(brand.toLowerCase()));

      return matchesSearch && matchesCategory && matchesPrice && matchesCondition && matchesBrand;
    });
  }, [listings, searchQuery, filters]);

  return (
    <div className="min-h-screen flex flex-col">
      <MarketplaceHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)]">
            <MarketplaceSidebarNew filters={filters} onFiltersChange={setFilters} totalResults={filteredListings.length} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="container py-6 px-4">
            {/* Mobile Filters */}
            <div className="lg:hidden mb-4">
              <MarketplaceSidebarNew
                filters={filters}
                onFiltersChange={setFilters}
                totalResults={filteredListings.length}
              />
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Browse Audio Visual Equipment</h1>
              <p className="text-muted-foreground">Discover professional AV gear from trusted sellers</p>
            </div>

            {filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">No equipment found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredListings.map((listing) => (
                  <ListingCardNew key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

