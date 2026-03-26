import axios from "axios";
import { create } from "zustand";
import { baseURL } from "../utils/constants";
// import type { IUser } from "../utils/types";
interface User {
  identifier: string;
  password: string;
}

interface AuthState {
  user: any | null;
  setUser: (user: any) => void;
  isAuthenticated: boolean;
  error: any | null;
  isLoading: boolean;
  login: (user: User) => void;
  // logout:() => void;
  getCurrentUser: () => void;
}

axios.defaults.withCredentials = true;

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAuthenticated: false,
  error: null,
  isLoading: false,
  login: async (user) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${baseURL.API_URL}auth/login`, {
        identifier: user.identifier,
        password: user.password,
      });

      const data = res.data;
      if (data.success) {
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }

      localStorage.setItem("__amsCheck", data.accessToken);
      return data || res;
    } catch (error: any) {
      const message = error.response || "Erro desconhecido";
      set({ isLoading: false, error: message });
      return Promise.reject(error);
    }
  },
  getCurrentUser: async () => {
    set({ isLoading: true, error: null });

    const access = localStorage.getItem("__amsCheck");
    if (!access) return;

    try {
      const res = await axios.get(`${baseURL.API_URL}auth/me`, {
        withCredentials: true,
      });
      const data = res.data;
      set({ user: data, isLoading: false, error: null, isAuthenticated: true });
    } catch (error: any) {
      const message = error.response || "Erro desconhecido";
      set({ isLoading: false, error: message });
      console.log("error: ", error);
      return Promise.reject(error);
    }
  },
}));
