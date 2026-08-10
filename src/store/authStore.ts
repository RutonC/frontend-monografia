import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../utils/axiosInstance";

// ─────────────────────────────────────────────
//  Tipos
// ─────────────────────────────────────────────
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type UserType =
  | "STUDENT"
  | "TEACHER"
  | "EMPLOYEE"
  | "GUARDIAN"
  | "ADMIN"
  | "SUPERADMIN"
  | "SECRETARY"
  | "FINANCE";

export interface AuthUser {
  id: string;
  identifier: string;
  slug?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  gender?: string;
  phoneNumber?: string;
  address?: string;
  type: UserType;
  status: UserStatus;
  mustChangePassword?: boolean;
  permissions: string[]; // achatado pelo /auth/me
}

interface LoginPayload {
  identifier: string;
  password: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: AuthUser) => void;
}

// Mantido para compatibilidade — todo o código existente que faz
// `import { api } from "../store/authStore"` continua a funcionar,
// mas agora aponta para a mesma instância axios única de utils/axiosInstance.ts
// (injecção de token + refresh automático deixaram de estar duplicados).
export { default as api } from "../utils/axiosInstance";

// ─────────────────────────────────────────────
//  Store
// ─────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async ({ identifier, password }) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axiosInstance.post("auth/login", {
            identifier,
            password,
          });
          const { accessToken } = res.data;

          localStorage.setItem("__amsCheck", accessToken);

          // Busca o perfil completo (com permissions achatadas)
          const meRes = await axiosInstance.get("auth/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          set({
            user: meRes.data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const message =
            error.response?.data?.message ?? "Erro ao fazer login.";
          set({ isLoading: false, error: message, isAuthenticated: false });
          throw error; // propaga para o componente poder reagir
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post("auth/logout");
        } catch {
          // ignora erro de rede no logout
        } finally {
          localStorage.removeItem("__amsCheck");
          set({ user: null, isAuthenticated: false, error: null });
          window.location.href = "/login";
        }
      },

      getCurrentUser: async () => {
        const token = localStorage.getItem("__amsCheck");
        if (!token) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const res = await axiosInstance.get("auth/me");
          set({
            user: res.data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch {
          // Token expirado — o interceptor já tentou refresh
          // Se chegou aqui, a sessão está mesmo inválida
          localStorage.removeItem("__amsCheck");
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },
    }),
    {
      name: "ams-auth",
      // Persiste apenas o essencial — o token fica no localStorage separado
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
