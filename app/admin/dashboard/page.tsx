import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { getListingsByStatus } from "@/lib/db/listings";
import { getPendingVerifications } from "@/lib/db/verifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  if (!user || user.role !== "ADMIN") {
    redirect("/marketplace");
  }

  const pendingListings = await getListingsByStatus([
    "SUBMITTED",
    "UNDER_ADMIN_REVIEW",
  ]);
  const pendingVerifications = await getPendingVerifications();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Pending Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-4">{pendingListings.length}</p>
            <Link href="/admin/listings/review">
              <Button>Review Listings</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-4">{pendingVerifications.length}</p>
            <Link href="/admin/verifications">
              <Button>Review Verifications</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

