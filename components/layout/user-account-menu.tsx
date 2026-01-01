"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Heart, 
  ShoppingBag, 
  Package, 
  Settings,
  LogOut,
  Store
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export function UserAccountMenu() {
  const { user } = useUser();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/messages/unread-count");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user) return null;

  const initials = user.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || user.emailAddresses[0]?.emailAddress[0].toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.fullName || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account/messages" className="flex items-center w-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {unreadCount}
              </Badge>
            )}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/favourites" className="flex items-center w-full">
            <Heart className="mr-2 h-4 w-4" />
            Favourites
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/purchases" className="flex items-center w-full">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Purchase History
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/listings" className="flex items-center w-full">
            <Package className="mr-2 h-4 w-4" />
            My Listings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/seller/sales" className="flex items-center w-full">
            <Store className="mr-2 h-4 w-4" />
            My Sales
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account/settings" className="flex items-center w-full">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="p-2">
          <UserButton />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

