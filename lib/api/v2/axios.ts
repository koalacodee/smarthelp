import axios from "axios";
import { env } from "next-runtime-env";
import { getCookie, setCookie } from "../cookies";

// Check if we're running on the server
const isServer = typeof window === "undefined";

const api = axios.create({
  baseURL: env("NEXT_PUBLIC_API_URL"),
  withCredentials: true,
});

// Request interceptor → inject accessToken
api.interceptors.request.use(
  async (config) => {
    // Both client-side and server-side: Get token from cookie
    try {
      const accessToken = await getCookie("accessToken");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      // Ignore cookie errors in SSR context
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → handle refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Skip token refresh on server-side (middleware handles it)
    if (isServer) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url === "/auth/refresh") {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await api.post<{ data: { accessToken: string } }>(
        "/auth/refresh"
      );
      const accessToken = response.data.data.accessToken;
      await setCookie("accessToken", accessToken);

      // retry original request
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default api;
