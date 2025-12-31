import { create } from "zustand";

interface FilterState {
  verified: boolean;
  search: string;
  priceRange: [number, number] | null;
  setVerified: (verified: boolean) => void;
  setSearch: (search: string) => void;
  setPriceRange: (range: [number, number] | null) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  verified: false,
  search: "",
  priceRange: null,
  setVerified: (verified) => set({ verified }),
  setSearch: (search) => set({ search }),
  setPriceRange: (priceRange) => set({ priceRange }),
  reset: () =>
    set({
      verified: false,
      search: "",
      priceRange: null,
    }),
}));

