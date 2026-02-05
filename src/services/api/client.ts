// Base API client configuration
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { STORAGE_KEYS } from "@/constants";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    indexes: null, // Send arrays as param=value1&param=value2 instead of param[]=value1&param[]=value2
  },
});

// Callback to notify when tokens are cleared (for AuthContext)
let onTokensCleared: (() => void) | null = null;

export const setOnTokensCleared = (callback: () => void) => {
  onTokensCleared = callback;
};

// View-as tab uses sessionStorage (per-tab); normal login uses localStorage.
// This way the admin tab is never affected when opening "View as User" in a new tab.
const getAccessToken = (): string | null =>
  sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ??
  localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

const setAccessToken = (token: string) =>
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);

// Clear only the storage this tab is using (so we don't clear admin token from another tab)
const clearTokens = () => {
  if (sessionStorage.getItem(STORAGE_KEYS.VIEW_AS_SESSION)) {
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.VIEW_AS_SESSION);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
  if (onTokensCleared) {
    onTokensCleared();
  }
};

// Attach Authorization header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 - clear tokens on unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    // If unauthorized, clear tokens
    if (error.response?.status === 401) {
      clearTokens();
    }
    return Promise.reject(error);
  }
);

export default api;

