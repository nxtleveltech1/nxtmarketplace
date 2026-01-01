"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserAccountMenu } from "./user-account-menu";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b sticky top-0 z-50 bg-background">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/marketplace" className="text-xl font-bold">
          NXT Marketplace
        </Link>
        <nav className="flex items-center gap-6">
          <SignedIn>
            <Link
              href="/marketplace"
              className={pathname === "/marketplace" ? "font-semibold" : ""}
            >
              Marketplace
            </Link>
            <Link
              href="/seller/listings"
              className={pathname?.startsWith("/seller") ? "font-semibold" : ""}
            >
              Sell
            </Link>
            <Link
              href="/orders"
              className={pathname?.startsWith("/orders") ? "font-semibold" : ""}
            >
              Orders
            </Link>
            <UserAccountMenu />
          </SignedIn>
          <SignedOut>
            <SignInButton />
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}

