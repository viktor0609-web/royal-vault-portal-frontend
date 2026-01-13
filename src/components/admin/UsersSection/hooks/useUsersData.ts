import { useState, useEffect, useCallback } from "react";
import { userApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { User, PaginationState, UsersFilters } from "../types";

interface UseUsersDataProps {
  page: number;
  limit: number;
  filters: UsersFilters;
  isMobile: boolean;
}

export function useUsersData({ page, limit, filters, isMobile }: UseUsersDataProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
  });
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page,
        limit,
        sortBy: filters.orderBy,
        order: filters.order,
      };
      if (filters.search) params.search = filters.search;
      if (filters.roleFilter && filters.roleFilter !== "all") params.role = filters.roleFilter;
      if (filters.verificationFilter && filters.verificationFilter !== "all") {
        params.isVerified = filters.verificationFilter;
      }

      const response = await userApi.getAllUsers(params);
      setUsers(response.data.users || []);
      setPagination(response.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        limit: 10,
      });
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.response?.data?.message || "Failed to fetch users");
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters, toast]);

  const fetchAllUsers = useCallback(async () => {
    try {
      setLoadingAllUsers(true);
      setError(null);
      const params: any = {
        page: 1,
        limit: 10000,
        sortBy: filters.orderBy,
        order: filters.order,
      };
      if (filters.search) params.search = filters.search;
      if (filters.roleFilter && filters.roleFilter !== "all") params.role = filters.roleFilter;
      if (filters.verificationFilter && filters.verificationFilter !== "all") {
        params.isVerified = filters.verificationFilter;
      }

      const response = await userApi.getAllUsers(params);
      setAllUsers(response.data.users || []);
    } catch (error: any) {
      console.error("Error fetching all users:", error);
      setError(error.response?.data?.message || "Failed to fetch users");
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoadingAllUsers(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    if (isMobile) {
      fetchAllUsers();
    } else {
      fetchUsers();
    }
  }, [isMobile, fetchUsers, fetchAllUsers]);

  return {
    users,
    allUsers,
    loading,
    loadingAllUsers,
    error,
    pagination,
    refetch: isMobile ? fetchAllUsers : fetchUsers,
  };
}
