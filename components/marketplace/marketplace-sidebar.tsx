"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Star,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function MarketplaceSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");

  const navItems = [
    {
      title: "All Items",
      href: "/marketplace",
      icon: ShoppingBag,
      count: null,
    },
    {
      title: "Verified Only",
      href: "/marketplace?verified=verified",
      icon: CheckCircle2,
      count: null,
    },
    {
      title: "Trending",
      href: "/marketplace?sort=trending",
      icon: TrendingUp,
      count: null,
    },
    {
      title: "Top Rated",
      href: "/marketplace?sort=rating",
      icon: Star,
      count: null,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/marketplace") {
      return pathname === "/marketplace" && !verified;
    }
    return pathname === "/marketplace" && searchParams.toString() === href.split("?")[1];
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-muted/40 h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Filter className="size-5" />
            Browse
          </h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.title}</span>
                  {item.count !== null && (
                    <span className="ml-auto text-xs opacity-70">{item.count}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Quick Links</h3>
          <nav className="space-y-1">
            <Link
              href="/seller/listings"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Package className="size-4" />
              <span>My Listings</span>
            </Link>
            <Link
              href="/orders"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ShoppingBag className="size-4" />
              <span>My Orders</span>
            </Link>
            <Link
              href="/seller/listings/create"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Package className="size-4" />
              <span>Create Listing</span>
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}

