import axios from "axios";
import { useAuthStore } from "../../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;
      const url = error.config?.url ?? "";
      const detail: unknown =
        typeof data === "object" && data !== null && "detail" in data ? data.detail : undefined;

      const esLoginOMe = url.includes("/auth/token") || url.includes("/auth/me");
      if (status === 401 && !esLoginOMe) {
        useAuthStore.getState().limpiar();
      }
      if (status === 400 && detail === "Cuenta de usuario desactivada") {
        useAuthStore.getState().limpiar();
      }
    }
    return Promise.reject(error);
  },
);
