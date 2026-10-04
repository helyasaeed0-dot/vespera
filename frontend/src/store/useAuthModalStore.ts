import { create } from "zustand";

interface OpenAuthModalOptions {
  mode?: "signin" | "signup";
  message?: string;
  onSuccess?: () => void;
}

interface AuthModalStore {
  isOpen: boolean;
  mode: "signin" | "signup";
  message: string;
  onSuccess?: () => void;
  openAuthModal: (options?: OpenAuthModalOptions) => void;
  closeAuthModal: () => void;
  setMode: (mode: "signin" | "signup") => void;
  setMessage: (message: string) => void;
}

export const useAuthModalStore = create<AuthModalStore>((set) => ({
  isOpen: false,
  mode: "signin",
  message: "",
  onSuccess: undefined,
  openAuthModal: (options) =>
    set({
      isOpen: true,
      mode: options?.mode || "signin",
      message: options?.message || "",
      onSuccess: options?.onSuccess,
    }),
  closeAuthModal: () =>
    set({
      isOpen: false,
      message: "",
      onSuccess: undefined,
    }),
  setMode: (mode) => set({ mode }),
  setMessage: (message) => set({ message }),
}));
