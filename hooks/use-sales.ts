import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const res = await fetch("/api/sales");
      if (!res.ok) throw new Error("Failed to fetch sales");
      return res.json();
    },
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: ["sale", id],
    queryFn: async () => {
      const res = await fetch(`/api/sales/${id}`);
      if (!res.ok) throw new Error("Failed to fetch sale");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      listingId: string;
      courierCostsCents?: number;
    }) => {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create sale");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

