import { Header } from "@/components/layout/header";
import { EmptyState } from "@/components/ui/empty-state";
import { Heart } from "lucide-react";
import Link from "next/link";
import { getFavouritesByUserId } from "@/lib/db/favourites";
import { getUserByClerkId } from "@/lib/db/users";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ListingCardNew } from "@/components/listings/listing-card-new";
import { listingImages } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

async function getListingImages(listingId: string) {
  const images = await db
    .select()
    .from(listingImages)
    .where(eq(listingImages.listingId, listingId))
    .orderBy(listingImages.sortOrder);
  return images.map((img) => img.imageUrl);
}

export default async function FavouritesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getUserByClerkId(userId);
  if (!user) redirect("/sign-in");

  const favourites = await getFavouritesByUserId(user.id);

  const listingsWithImages = await Promise.all(
    favourites.map(async (fav) => {
      const images = await getListingImages(fav.listing.id);
      const { createdAt, ...listingData } = fav.listing;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Favourites</h1>
          <p className="text-muted-foreground">Your saved listings</p>
        </div>

        {listingsWithImages.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No favourites yet"
            description="Save listings you're interested in by clicking the heart icon"
            action={
              <Link href="/marketplace" className="text-sm font-medium text-primary hover:underline">
                Browse Marketplace
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

