import { create } from "zustand";

interface AuthState {
  user: {
    id: string;
    role: "SELLER" | "BUYER" | "ADMIN";
  } | null;
  setUser: (user: { id: string; role: "SELLER" | "BUYER" | "ADMIN" } | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

