import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <main className="flex flex-col gap-8 items-center max-w-4xl">
        <h1 className="text-5xl font-bold text-center">NXT Marketplace</h1>
        <p className="text-xl text-muted-foreground text-center">
          Buy and sell verified items with confidence
        </p>
        <SignedOut>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/marketplace">Marketplace</Link>
            </Button>
          </div>
        </SignedIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Verified Items</CardTitle>
              <CardDescription>
                All items are verified by our team before sale
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Secure Payments</CardTitle>
              <CardDescription>
                Funds held in escrow until delivery confirmation
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Easy Selling</CardTitle>
              <CardDescription>
                List your items and let us handle verification
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
