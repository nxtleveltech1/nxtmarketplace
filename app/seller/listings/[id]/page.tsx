import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { getListingById } from "@/lib/db/listings";
import { getVerificationByListingId } from "@/lib/db/verifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { Button } from "@/components/ui/button";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatDateTime } from "@/lib/formatters";

export default async function SellerListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);
  if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
    redirect("/marketplace");
  }

  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  // Check ownership
  if (listing.sellerId !== user.id && user.role !== "ADMIN") {
    redirect("/seller/listings");
  }

  const verification = await getVerificationByListingId(listing.id);
  const isVerified = verification?.status === "VERIFIED";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/seller/listings">
          <Button variant="outline">← Back to Listings</Button>
        </Link>
      </div>
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Status Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <StatusBadge status={listing.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p>{formatDateTime(listing.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p>{formatDateTime(listing.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
          {listing.status === "APPROVED" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Your listing has been approved! You can now choose to request verification
                  or publish it directly.
                </p>
                <div className="flex gap-2">
                  <Button>Request Verification</Button>
                  <Button variant="outline">Publish Listing</Button>
                </div>
              </CardContent>
            </Card>
          )}
          {listing.status === "REJECTED" && (
            <Card className="mb-6 border-red-200">
              <CardHeader>
                <CardTitle>Listing Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  Your listing was rejected. Please review and update it before resubmitting.
                </p>
                <Link href={`/seller/listings/${listing.id}/edit`}>
                  <Button>Edit & Resubmit</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

