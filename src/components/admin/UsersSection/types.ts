export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  supaadmin?: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
}

export interface UsersFilters {
  search: string;
  roleFilter: string;
  verificationFilter: string;
  orderBy: string;
  order: "asc" | "desc";
}
