import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { User } from "../../../types/user.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }, false, "auth/setAuth"),
      setAccessToken: (accessToken) => set({ accessToken }, false, "auth/setAccessToken"),
      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }, false, "auth/clearAuth"),
    }),
    { name: "AuthStore" }
  )
);
