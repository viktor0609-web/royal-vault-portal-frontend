// Authentication API service
import api from "./client";
import { API_ENDPOINTS } from "@/constants";
import type { User } from "@/types";

export const authService = {
  login: (email: string, password: string) =>
    api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password }),

  logout: () => api.post(API_ENDPOINTS.AUTH.LOGOUT),

  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role?: "user" | "admin";
  }) => api.post(API_ENDPOINTS.AUTH.REGISTER, userData),

  getUser: () => api.get<User>(API_ENDPOINTS.AUTH.USER),

  forgotPassword: (email: string) =>
    api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  resetPassword: (token: string, password: string) =>
    api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),

  verifyEmail: (token: string) =>
    api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token }),
};

