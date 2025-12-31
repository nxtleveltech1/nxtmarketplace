import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { PriceDisplay } from "@/components/ui/price-display";

type ListingCardProps = {
  listing: {
    id: string;
    title: string;
    description: string;
    priceCents: number;
    status: string;
    sellerLocation?: string | null;
    createdAt?: string | null;
    images?: string[];
    category?: string;
  };
};

export function ListingCardNew({ listing }: ListingCardProps) {
  const formatDate = (date: string | null | undefined) => {
    if (!date) return "Recently";
    const now = new Date();
    const created = new Date(date);
    const diffInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const imageUrl = listing.images?.[0] || "/placeholder.svg";

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="aspect-square relative bg-muted">
          {imageUrl !== "/placeholder.svg" ? (
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No image</div>
          )}
          {listing.status === "sold" && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                SOLD
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">{listing.title}</h3>
          <div className="mb-2">
            <PriceDisplay cents={listing.priceCents} className="text-2xl font-bold text-primary" />
          </div>
          {listing.sellerLocation && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3" />
              <span className="line-clamp-1">{listing.sellerLocation}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(listing.createdAt)}</span>
          {listing.category && (
            <Badge variant="outline" className="text-xs">
              {listing.category}
            </Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}

