// User Management API service
import api from "./client";
import { API_ENDPOINTS } from "@/constants";
import type { User, UserStatistics, CreateUserData, UpdateUserData, PaginationResponse } from "@/types";

export const userService = {
  // Get all users with pagination, filtering, and sorting
  getAllUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isVerified?: string;
    sortBy?: string;
    order?: "asc" | "desc";
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);
    if (params?.isVerified !== undefined)
      queryParams.append("isVerified", params.isVerified);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.order) queryParams.append("order", params.order);
    return api.get<{ message: string; users: User[]; pagination: { currentPage: number; totalPages: number; totalUsers: number; limit: number } }>(`${API_ENDPOINTS.USERS.BASE}?${queryParams.toString()}`);
  },

  // Get user by ID
  getUserById: (userId: string) =>
    api.get<{ data: User }>(`${API_ENDPOINTS.USERS.BASE}/${userId}`),

  // Create new user
  createUser: (userData: CreateUserData) =>
    api.post<{ data: User }>(API_ENDPOINTS.USERS.BASE, userData),

  // Update user
  updateUser: (userId: string, userData: UpdateUserData) =>
    api.put<{ data: User }>(`${API_ENDPOINTS.USERS.BASE}/${userId}`, userData),

  // Delete user
  deleteUser: (userId: string) =>
    api.delete(`${API_ENDPOINTS.USERS.BASE}/${userId}`),

  // Reset user password
  resetUserPassword: (userId: string, data?: { newPassword?: string; sendEmail?: boolean }) =>
    api.post<{ message: string; resetUrl?: string }>(`${API_ENDPOINTS.USERS.BASE}/${userId}/reset-password`, data || {}),

  // Toggle user verification
  toggleUserVerification: (userId: string, isVerified: boolean) =>
    api.patch(`${API_ENDPOINTS.USERS.BASE}/${userId}/verification`, { isVerified }),

  // Change user role
  changeUserRole: (userId: string, role: "user" | "admin") =>
    api.patch(`${API_ENDPOINTS.USERS.BASE}/${userId}/role`, { role }),

  // Get user statistics
  getUserStatistics: () =>
    api.get<{ message: string; statistics: UserStatistics }>(API_ENDPOINTS.USERS.STATISTICS),

  // Bulk update users
  bulkUpdateUsers: (
    userIds: string[],
    updates: { role?: "user" | "admin"; isVerified?: boolean }
  ) => api.post(API_ENDPOINTS.USERS.BULK_UPDATE, { userIds, updates }),

  // Bulk delete users
  bulkDeleteUsers: (userIds: string[]) =>
    api.post(API_ENDPOINTS.USERS.BULK_DELETE, { userIds }),
};

