import axios from "axios";
import { baseURL } from "./constants";

// ─────────────────────────────────────────────
//  Instância axios única e partilhada por toda a app
//  — injecta o token em cada request
//  — intercepta 401 para tentar refresh automático
// ─────────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: baseURL.API_URL,
  withCredentials: true, // envia o cookie refreshToken automaticamente
});

// Injector do access token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("__amsCheck");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (err: unknown, token: string | null) => {
  pendingQueue.forEach((p) => (err ? p.reject(err) : p.resolve(token!)));
  pendingQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (import.meta.env.VITE_NODE_ENV !== "production") {
      console.error("[Axios Error]", error.response?.data || error.message);
    }

    const original = error.config;

    // Modo de manutenção — o backend só devolve 503 a quem não é
    // ADMIN/SUPERADMIN (ver plugin/maintenance.ts); redirecciona para a
    // página dedicada com a mensagem configurada.
    if (error.response?.status === 503) {
      const message = error.response?.data?.message;
      if (message) sessionStorage.setItem("maintenanceMessage", message);
      if (window.location.pathname !== "/manutencao") {
        window.location.href = "/manutencao";
      }
      return Promise.reject(error);
    }

    // Só tenta refresh em 401 e apenas uma vez por request
    if (error.response?.status === 401 && original && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(original);
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
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh falhou → limpa sessão e volta ao login.
        // Import dinâmico evita dependência circular com authStore
        // (que também usa esta instância axios).
        localStorage.removeItem("__amsCheck");
        const { useAuthStore } = await import("../store/authStore");
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

export default axiosInstance;
