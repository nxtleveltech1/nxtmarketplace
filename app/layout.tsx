import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Providers } from "@/lib/providers";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NXT Marketplace",
  description: "Buy and sell verified items with confidence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // During build, if Clerk key is missing, render without ClerkProvider
  // This allows the build to complete, but Clerk features won't work until env vars are set
  if (!clerkPublishableKey && (process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL)) {
    return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers>
            <header className="border-b">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex gap-4">
                  <Link
                    href="/sign-in"
                    className="text-sm font-medium hover:underline"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="text-sm font-medium border border-border px-4 py-2 rounded-md hover:bg-accent"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </header>
            {children}
            <Toaster />
          </Providers>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider
      afterSignInUrl="/marketplace"
      afterSignUpUrl="/onboarding"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
