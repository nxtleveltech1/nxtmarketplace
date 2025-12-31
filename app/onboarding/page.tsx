import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <main className="flex flex-col gap-8 items-center max-w-2xl">
        <h1 className="text-4xl font-bold text-center">Welcome to NXT Marketplace</h1>
        <p className="text-xl text-muted-foreground text-center">
          Your account has been created successfully!
        </p>
        <div className="w-full space-y-6">
          <p className="text-center text-muted-foreground">
            Hello, {user?.displayName || "there"}! You&apos;re all set to start buying and selling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/seller/listings">Start Selling</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

