import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

export function useUser() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await fetch("/api/users");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!userId,
  });
}

