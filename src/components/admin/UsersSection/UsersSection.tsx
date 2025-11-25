import { useState, useEffect } from "react";
import { useAdminState } from "@/hooks/useAdminState";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/Loading";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UsersIcon, PlusIcon, Search, MoreVertical, Edit, Trash2, KeyRound, Shield, ShieldOff, ArrowUp, ArrowDown } from "lucide-react";
import { CreateUserModal } from "./CreateUserModal";
import { userApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatDateTime } from "@/utils/dateUtils";

interface User {
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

interface UserStatistics {
  total: number;
  verified: number;
  unverified: number;
  admins: number;
  users: number;
  recentUsers: number;
  recentActiveUsers: number;
}

export function UsersSection() {
  const { toast } = useToast();

  const {
    state: users,
    setState: setUsers,
    isLoading: loading,
    error,
    setError,
  } = useAdminState<User[]>([], 'users');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);

  // Pagination and filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [orderBy, setOrderBy] = useState<string>("firstName");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
  });

  const fetchUsers = async () => {
    try {
      setError(null);
      const params: any = {
        page,
        limit,
        sortBy: orderBy,
        order,
      };
      if (search) params.search = search;
      if (roleFilter && roleFilter !== "all") params.role = roleFilter;
      if (verificationFilter && verificationFilter !== "all") params.isVerified = verificationFilter;

      const response = await userApi.getAllUsers(params);
      setUsers(response.data.users || []);
      setPagination(response.data.pagination || pagination);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.response?.data?.message || "Failed to fetch users");
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await userApi.getUserStatistics();
      setStatistics(response.data.statistics);
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, search, roleFilter, verificationFilter, orderBy, order]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    fetchUsers();
    fetchStatistics();
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await userApi.deleteUser(userToDelete._id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      fetchUsers();
      fetchStatistics();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const response = await userApi.resetUserPassword(userId, { sendEmail: true });
      toast({
        title: "Success",
        description: "Password reset email sent successfully",
      });
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  const handleToggleVerification = async (user: User) => {
    try {
      await userApi.toggleUserVerification(user._id, !user.isVerified);
      toast({
        title: "Success",
        description: `User ${!user.isVerified ? "activated" : "deactivated"} successfully`,
      });
      fetchUsers();
      fetchStatistics();
    } catch (error: any) {
      console.error("Error toggling verification:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleChangeRole = async (user: User, newRole: "user" | "admin") => {
    try {
      await userApi.changeUserRole(user._id, newRole);
      toast({
        title: "Success",
        description: `User role changed to ${newRole} successfully`,
      });
      fetchUsers();
      fetchStatistics();
    } catch (error: any) {
      console.error("Error changing role:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to change role",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on new search
  };

  const handleSort = (field: string) => {
    if (orderBy === field) {
      // Toggle order if clicking the same field
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setOrderBy(field);
      setOrder("asc");
    }
    setPage(1); // Reset to first page on sort change
  };

  const getSortIcon = (field: string) => {
    if (orderBy !== field) {
      return null;
    }
    return order === "asc" ? (
      <ArrowUp className="h-3 w-3 inline-block ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 inline-block ml-1" />
    );
  };

  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6 flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 lg:p-6 rounded-lg border border-royal-light-gray shadow-sm">
        <div className="flex gap-3 items-center">
          <div className="flex-shrink-0 p-2 bg-royal-gray/10 rounded-lg">
            <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-royal-gray" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-royal-dark-gray">Users</h1>
        </div>
        <Button
          onClick={handleCreateUser}
          className="flex items-center justify-center gap-2 w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
        >
          <PlusIcon className="h-5 w-5 sm:h-4 sm:w-4" />
          Create New User
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-royal-light-gray shadow-sm">
            <div className="text-xs sm:text-sm text-royal-gray mb-1">Total Users</div>
            <div className="text-lg sm:text-xl font-bold text-royal-dark-gray">{statistics.total}</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-royal-light-gray shadow-sm">
            <div className="text-xs sm:text-sm text-royal-gray mb-1">Verified</div>
            <div className="text-lg sm:text-xl font-bold text-green-600">{statistics.verified}</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-royal-light-gray shadow-sm">
            <div className="text-xs sm:text-sm text-royal-gray mb-1">Unverified</div>
            <div className="text-lg sm:text-xl font-bold text-red-600">{statistics.unverified}</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-royal-light-gray shadow-sm">
            <div className="text-xs sm:text-sm text-royal-gray mb-1">Admins</div>
            <div className="text-lg sm:text-xl font-bold text-blue-600">{statistics.admins}</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-royal-light-gray shadow-sm">
            <div className="text-xs sm:text-sm text-royal-gray mb-1">Regular Users</div>
            <div className="text-lg sm:text-xl font-bold text-royal-dark-gray">{statistics.users}</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-royal-light-gray shadow-sm">
            <div className="text-xs sm:text-sm text-royal-gray mb-1">Recent (30d)</div>
            <div className="text-lg sm:text-xl font-bold text-purple-600">{statistics.recentUsers}</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-royal-light-gray shadow-sm">
            <div className="text-xs sm:text-sm text-royal-gray mb-1">Active (30d)</div>
            <div className="text-lg sm:text-xl font-bold text-orange-600">{statistics.recentActiveUsers}</div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-royal-light-gray shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-royal-gray" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select value={verificationFilter} onValueChange={(value) => { setVerificationFilter(value); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Verified</SelectItem>
              <SelectItem value="false">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg border border-royal-light-gray overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead
                  className="font-semibold text-royal-dark-gray cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('firstName')}
                >
                  <div className="flex items-center">
                    Name
                    {getSortIcon('firstName')}
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold text-royal-dark-gray cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    {getSortIcon('email')}
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold text-royal-dark-gray cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('phone')}
                >
                  <div className="flex items-center">
                    Phone
                    {getSortIcon('phone')}
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold text-royal-dark-gray cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center">
                    Role
                    {getSortIcon('role')}
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold text-royal-dark-gray cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('isVerified')}
                >
                  <div className="flex items-center">
                    Status
                    {getSortIcon('isVerified')}
                  </div>
                </TableHead>
                <TableHead
                  className="font-semibold text-royal-dark-gray cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Created
                    {getSortIcon('createdAt')}
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-royal-dark-gray text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loading message="Loading users..." size="sm" />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-royal-gray">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isVerified ? "default" : "destructive"}>
                        {user.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-royal-gray">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(user._id)}>
                            <KeyRound className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleVerification(user)}>
                            {user.isVerified ? (
                              <>
                                <ShieldOff className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Shield className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(user, user.role === "admin" ? "user" : "admin")}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Change to {user.role === "admin" ? "User" : "Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <Loading message="Loading users..." />
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-royal-gray">No users found</div>
        ) : (
          users.map((user) => (
            <div key={user._id} className="bg-white p-4 rounded-lg border border-royal-light-gray shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-royal-dark-gray">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-royal-gray">{user.email}</p>
                  <p className="text-sm text-royal-gray">{user.phone}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleResetPassword(user._id)}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Reset Password
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleVerification(user)}>
                      {user.isVerified ? (
                        <>
                          <ShieldOff className="mr-2 h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleChangeRole(user, user.role === "admin" ? "user" : "admin")}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Change to {user.role === "admin" ? "User" : "Admin"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(user)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
                <Badge variant={user.isVerified ? "default" : "destructive"}>
                  {user.isVerified ? "Verified" : "Unverified"}
                </Badge>
                <span className="text-xs text-royal-gray">
                  Created: {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-royal-light-gray">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs sm:text-sm text-royal-gray text-center sm:text-left">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.totalUsers)} of {pagination.totalUsers} users
            </div>
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              {/* Mobile: Show 3 pages, Desktop: Show 5 pages */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="min-w-[36px] text-sm px-2"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              {/* Mobile: Show current page and total */}
              <div className="flex sm:hidden items-center gap-1">
                <Button
                  variant="default"
                  size="sm"
                  className="min-w-[32px] text-xs px-2"
                  disabled
                >
                  {page}
                </Button>
                <span className="text-xs text-royal-gray">/</span>
                <span className="text-xs text-royal-gray">{pagination.totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit User Modal */}
      <CreateUserModal
        isOpen={isModalOpen}
        closeDialog={handleCloseModal}
        editingUser={editingUser}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user{" "}
              <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong> ({userToDelete?.email}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

