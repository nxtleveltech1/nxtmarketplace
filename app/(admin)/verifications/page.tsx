import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { getPendingVerifications } from "@/lib/db/verifications";
import { getListingById } from "@/lib/db/listings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { VerifyButton, FailButton } from "@/components/admin/verification-actions";

export default async function AdminVerificationsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  if (!user || user.role !== "ADMIN") {
    redirect("/marketplace");
  }

  const pendingVerifications = await getPendingVerifications();

  const verificationsWithListings = await Promise.all(
    pendingVerifications.map(async (verification) => {
      const listing = await getListingById(verification.listingId);
      return { verification, listing };
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Verification Panel</h1>
      {pendingVerifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No pending verifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {verificationsWithListings.map(({ verification, listing }) => (
            <Card key={verification.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>
                    {listing ? listing.title : `Verification ${verification.id.slice(0, 8)}`}
                  </CardTitle>
                  <StatusBadge status={verification.status} />
                </div>
              </CardHeader>
              <CardContent>
                {listing && (
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {listing.description}
                  </p>
                )}
                <div className="flex gap-2">
                  {listing && (
                    <Link href={`/listings/${listing.id}`}>
                      <Button variant="outline">View Listing</Button>
                    </Link>
                  )}
                  <VerifyButton verificationId={verification.id} />
                  <FailButton verificationId={verification.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

