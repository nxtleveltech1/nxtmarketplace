import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";

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
          Complete your profile to get started
        </p>
        <div className="w-full space-y-4">
          <p className="text-center text-muted-foreground">
            Hello, {user?.display_name || "there"}! Let's set up your account.
          </p>
          {/* Onboarding form can be added here */}
        </div>
      </main>
    </div>
  );
}

