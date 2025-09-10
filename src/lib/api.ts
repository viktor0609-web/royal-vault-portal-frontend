import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = "http://localhost:5000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to avoid multiple simultaneous refresh calls
let isRefreshing = false;
let pendingRequestsQueue: Array<(token: string | null) => void> = [];

const getAccessToken = (): string | null => localStorage.getItem("accessToken");
const getRefreshToken = (): string | null => localStorage.getItem("refreshToken");
const setAccessToken = (token: string) => localStorage.setItem("accessToken", token);

// Attach Authorization header
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 and refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If unauthorized and we haven't retried yet, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // No refresh token available -> propagate error
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve) => {
          pendingRequestsQueue.push((newToken) => {
            if (newToken) {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${newToken}`,
              } as any;
            }
            resolve(api(originalRequest));
          });
        });
      }

      try {
        isRefreshing = true;
        const { data } = await api.post("/api/auth/refresh", { refreshToken });
        const newAccessToken = data?.accessToken as string | undefined;
        if (!newAccessToken) {
          throw new Error("No access token in refresh response");
        }
        setAccessToken(newAccessToken);

        // Process queued requests
        pendingRequestsQueue.forEach((cb) => cb(newAccessToken));
        pendingRequestsQueue = [];

        // Retry the original request with new token
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        } as any;
        return api(originalRequest);
      } catch (refreshError) {
        // On refresh failure, clear tokens and fail queued requests
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        pendingRequestsQueue.forEach((cb) => cb(null));
        pendingRequestsQueue = [];
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
