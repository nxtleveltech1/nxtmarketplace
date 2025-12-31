import { getListingById } from "@/lib/db/listings";
import { getVerificationByListingId } from "@/lib/db/verifications";
import { PriceDisplay } from "@/components/ui/price-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { PurchaseButton } from "@/components/listings/purchase-button";

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

  const verification = await getVerificationByListingId(listing.id);
  const isVerified = verification?.status === "VERIFIED";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
            <span className="text-muted-foreground">Image Gallery</span>
          </div>
        </div>
        <div>
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold">{listing.title}</h1>
            <StatusBadge status={listing.status} />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <PriceDisplay cents={listing.priceCents} className="text-4xl font-bold" />
            <VerificationBadge verified={isVerified} />
          </div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{listing.description}</p>
            </CardContent>
          </Card>
          {listing.sellerLocation && (
            <p className="text-sm text-muted-foreground mb-6">
              📍 Location: {listing.sellerLocation}
            </p>
          )}
          {listing.status === "LIVE" && (
            <PurchaseButton listingId={listing.id} priceCents={listing.priceCents} />
          )}
        </div>
      </div>
    </div>
  );
}

