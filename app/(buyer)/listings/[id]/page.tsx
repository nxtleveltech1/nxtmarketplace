import { getListingById, getListingImages } from "@/lib/db/listings";
import { getVerificationByListingId } from "@/lib/db/verifications";
import { getUserById } from "@/lib/db/users";
import { PriceDisplay } from "@/components/ui/price-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { PurchaseButton } from "@/components/listings/purchase-button";
import { ListingImageGallery } from "@/components/listings/listing-image-gallery";
import { ContactSellerButton } from "@/components/listings/contact-seller-button";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  const images = await getListingImages(listing.id);
  const verification = await getVerificationByListingId(listing.id);
  const isVerified = verification?.status === "VERIFIED";
  const seller = await getUserById(listing.sellerId);

  // Get current user if authenticated
  const { userId } = await auth();
  const currentUser = userId ? await getUserByClerkId(userId) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <ListingImageGallery images={images.map((img) => img.imageUrl)} title={listing.title} />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl lg:text-4xl font-bold leading-tight">{listing.title}</h1>
                <StatusBadge status={listing.status} />
              </div>

              {/* Price and Verification */}
              <div className="flex items-center gap-4 flex-wrap">
                <PriceDisplay cents={listing.priceCents} className="text-4xl lg:text-5xl font-bold text-primary" />
                {isVerified && (
                  <Badge variant="secondary" className="gap-2 px-3 py-1.5">
                    <CheckCircle2 className="size-4" />
                    Verified
                  </Badge>
                )}
              </div>

              {/* Location */}
              {listing.sellerLocation && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4" />
                  <span className="text-sm font-medium">{listing.sellerLocation}, South Africa</span>
                </div>
              )}
            </div>

            {/* Seller Info */}
            {seller && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Seller Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={seller.imageUrl || undefined} />
                      <AvatarFallback>
                        {seller.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{seller.displayName}</p>
                      {seller.location && (
                        <p className="text-sm text-muted-foreground">{seller.location}</p>
                      )}
                    </div>
                  </div>
                  {listing.status === "LIVE" && (
                    <ContactSellerButton
                      sellerId={seller.id}
                      sellerName={seller.displayName}
                      listingId={listing.id}
                      listingTitle={listing.title}
                      currentUserId={currentUser?.id}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Purchase Section */}
            {listing.status === "LIVE" && (
              <div className="pt-4 border-t">
                <PurchaseButton listingId={listing.id} priceCents={listing.priceCents} />
              </div>
            )}

            {/* Description Card */}
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">{listing.status}</span>
                </div>
                {listing.sellerLocation && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{listing.sellerLocation}, South Africa</span>
                  </div>
                )}
                {isVerified && (
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Verification</span>
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="size-3" />
                      Verified
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

