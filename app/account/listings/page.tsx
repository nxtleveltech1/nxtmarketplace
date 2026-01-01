import { Header } from "@/components/layout/header";
import { EmptyState } from "@/components/ui/empty-state";
import { Package } from "lucide-react";
import Link from "next/link";
import { getListingsBySellerId } from "@/lib/db/listings";
import { getUserByClerkId } from "@/lib/db/users";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ListingCardNew } from "@/components/listings/listing-card-new";
import { listingImages } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

async function getListingImages(listingId: string) {
  const images = await db
    .select()
    .from(listingImages)
    .where(eq(listingImages.listingId, listingId))
    .orderBy(listingImages.sortOrder);
  return images.map((img) => img.imageUrl);
}

export default async function MyListingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getUserByClerkId(userId);
  if (!user) redirect("/sign-in");

  const listings = await getListingsBySellerId(user.id);

  const listingsWithImages = await Promise.all(
    listings.map(async (item) => {
      const images = await getListingImages(item.listing.id);
      const { createdAt, ...listingData } = item.listing;
      return {
        ...listingData,
        createdAt: createdAt.toISOString(),
        images,
      };
    })
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Listings</h1>
            <p className="text-muted-foreground">Manage your listings</p>
          </div>
          <Link href="/seller/listings/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Listing
            </Button>
          </Link>
        </div>

        {listingsWithImages.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No listings yet"
            description="Create your first listing to start selling"
            action={
              <Link href="/seller/listings/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Listing
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listingsWithImages.map((listing) => (
              <ListingCardNew key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

