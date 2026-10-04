import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

export interface Address {
  _id?: string;
  label?: string;
  fullName: string;
  phone?: string;
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  username?: string;
  email: string;
  avatar?: string;
  phoneNumber?: string;
  phone?: string;
  role?: string;
  provider?: string;
  isVerified?: boolean;
  addresses?: Address[];
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null, // No hardcoded default — real user comes from DB
      isLoading: false,
      setUser: (user) => set({ user }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const res = await api.get<{ user: User }>("/auth/me");
          if (res.success && res.data?.user) {
            set({ user: res.data.user });
          } else {
            set({ user: null });
          }
        } catch {
          set({ user: null });
        } finally {
          set({ isLoading: false });
        }
      },
      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // ignore
        }
        if (typeof window !== "undefined") {
          localStorage.removeItem("vespera_access_token");
        }
        set({ user: null });
      },
    }),
    {
      name: "vespera_user_session",
    }
  )
);
