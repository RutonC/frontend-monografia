import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { baseURL } from "../utils/constants";

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
  | "SUPERADMIN";

export interface AuthUser {
  id: string;
  identifier: string;
  slug?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  type: UserType;
  status: UserStatus;
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

// ─────────────────────────────────────────────
//  Instância axios partilhada
//  — injecto o token em cada request
//  — intercepto 401 para tentar refresh
// ─────────────────────────────────────────────
const api = axios.create({
  baseURL: baseURL.API_URL,
  withCredentials: true, // envia o cookie refreshToken automaticamente
});

// Injector do access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("__amsCheck");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de refresh automático ao receber 401
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (err: unknown, token: string | null) => {
  pendingQueue.forEach((p) => (err ? p.reject(err) : p.resolve(token!)));
  pendingQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Só tenta refresh em 401 e apenas uma vez por request
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${baseURL.API_URL}auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = res.data.accessToken;
        localStorage.setItem("__amsCheck", newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh falhou → limpa sessão
        localStorage.removeItem("__amsCheck");
        useAuthStore.getState().setUser(null as any);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export { api };

// ─────────────────────────────────────────────
//  Store
// ─────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async ({ identifier, password }) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post("auth/login", { identifier, password });
          const { accessToken, user } = res.data;

          localStorage.setItem("__amsCheck", accessToken);

          // Busca o perfil completo (com permissions achatadas)
          const meRes = await api.get("auth/me", {
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
          await api.post("auth/logout");
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
          const res = await api.get("auth/me");
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
