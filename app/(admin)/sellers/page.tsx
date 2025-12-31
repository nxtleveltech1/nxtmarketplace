import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { db } from "@/lib/db";
import { sellerProfiles, users } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function AdminSellersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  if (!user || user.role !== "ADMIN") {
    redirect("/marketplace");
  }

  const sellers = await db
    .select({
      user: users,
      profile: sellerProfiles,
    })
    .from(users)
    .leftJoin(sellerProfiles, eq(users.id, sellerProfiles.userId))
    .where(eq(users.role, "SELLER"));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Seller Management</h1>
      {sellers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No sellers yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.map(({ user: seller, profile }) => (
            <Card key={seller.id}>
              <CardHeader>
                <CardTitle>{seller.displayName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{seller.email}</p>
                  </div>
                  {profile && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Tier</p>
                        <StatusBadge status={profile.tier} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <p>{profile.rating}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Sales</p>
                        <p>{profile.totalSales}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Failed Verifications</p>
                        <p>{profile.failedVerifications}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

