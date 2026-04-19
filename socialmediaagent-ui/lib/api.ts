import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };
let refreshRequest: Promise<unknown> | null = null;

function redirectToLoginOnce() {
  if (typeof window === "undefined") return;
  const currentPath = window.location.pathname;
  if (currentPath === "/login") return;
  window.location.replace("/login");
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  config.withCredentials = true;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    const requestUrl = config?.url ?? "";
    const isAuthEndpoint =
      requestUrl.includes("/api/auth/refresh") ||
      requestUrl.includes("/api/auth/login") ||
      requestUrl.includes("/api/auth/logout");

    if (!config || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (isAuthEndpoint) {
      redirectToLoginOnce();
      return Promise.reject(error);
    }

    if (config._retry) {
      redirectToLoginOnce();
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      if (!refreshRequest) {
        refreshRequest = api.post("/api/auth/refresh");
      }
      await refreshRequest;
      return api(config);
    } catch (refreshError) {
      redirectToLoginOnce();
      return Promise.reject(refreshError);
    } finally {
      refreshRequest = null;
    }
  },
);
