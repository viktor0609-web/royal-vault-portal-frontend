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

const getAccessToken = (): string | null => 
  localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

const setAccessToken = (token: string) => 
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);

// Helper to clear tokens and notify
const clearTokens = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
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

