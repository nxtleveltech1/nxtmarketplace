import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { PriceDisplay } from "@/components/ui/price-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { getVerificationByListingId } from "@/lib/db/verifications";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    description: string;
    priceCents: number;
    status: string;
    sellerLocation?: string | null;
  };
}

export async function ListingCard({ listing }: ListingCardProps) {
  const verification = await getVerificationByListingId(listing.id);
  const isVerified = verification?.status === "VERIFIED";

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold line-clamp-2">{listing.title}</h3>
            <StatusBadge status={listing.status} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {listing.description}
          </p>
          <div className="flex items-center justify-between">
            <PriceDisplay cents={listing.priceCents} className="text-2xl font-bold" />
            <VerificationBadge verified={isVerified} />
          </div>
          {listing.sellerLocation && (
            <p className="text-xs text-muted-foreground mt-2">
              📍 {listing.sellerLocation}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

