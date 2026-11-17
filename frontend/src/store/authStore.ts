import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "../features/auth/api/auth";
import type { UserPublic } from "../features/usuarios/types";

interface AuthState {
  usuario: UserPublic | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiar: () => void;
}

// Solo se persiste `usuario` (datos públicos). El token vive en la cookie HttpOnly.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await authApi.login({ username, password });
        const usuario = await authApi.me();
        set({ usuario });
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Si falla igual se limpia la sesión local.
        }
        set({ usuario: null });
      },

      checkSession: async () => {
        try {
          const usuario = await authApi.me();
          set({ usuario });
        } catch {
          set({ usuario: null });
        } finally {
          set({ cargando: false });
        }
      },

      limpiar: () => set({ usuario: null }),
    }),
    {
      name: "foodstore-auth",
      partialize: (s) => ({ usuario: s.usuario }),
    },
  ),
);
