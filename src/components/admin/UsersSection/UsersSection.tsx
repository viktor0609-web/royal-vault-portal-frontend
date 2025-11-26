import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import { UsersIcon, PlusIcon, Search, MoreVertical, Edit, Trash2, KeyRound, Shield, ShieldOff, ArrowUp, ArrowDown, BarChart3, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { CreateUserModal } from "./CreateUserModal";
import { userApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatDateTime } from "@/utils/dateUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { List } from "react-window";
import type { RowComponentProps } from "react-window";

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
  const isMobile = useIsMobile();

  const {
    state: users,
    setState: setUsers,
    isLoading: loading,
    setIsLoading,
    error,
    setError,
  } = useAdminState<User[]>([], 'users');

  // For mobile virtualization - store all users
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(false);
  const [listHeight, setListHeight] = useState(600);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);

  // Pagination and filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all users for mobile virtualization
  const fetchAllUsers = async () => {
    try {
      setIsLoadingAllUsers(true);
      setError(null);
      const params: any = {
        page: 1,
        limit: 10000, // Large limit to get all users
        sortBy: orderBy,
        order,
      };
      if (search) params.search = search;
      if (roleFilter && roleFilter !== "all") params.role = roleFilter;
      if (verificationFilter && verificationFilter !== "all") params.isVerified = verificationFilter;

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
      setIsLoadingAllUsers(false);
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
    if (isMobile) {
      fetchAllUsers();
    } else {
      fetchUsers();
    }
  }, [page, limit, search, roleFilter, verificationFilter, orderBy, order, isMobile]);

  // Calculate list height for mobile virtualization
  useEffect(() => {
    if (isMobile && listContainerRef.current) {
      const updateHeight = () => {
        if (listContainerRef.current) {
          const rect = listContainerRef.current.getBoundingClientRect();
          setListHeight(window.innerHeight - rect.top - 20);
        }
      };
      updateHeight();
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, [isMobile]);

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
    if (isMobile) {
      fetchAllUsers();
    } else {
      fetchUsers();
    }
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
      if (isMobile) {
        fetchAllUsers();
      } else {
        fetchUsers();
      }
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
      if (isMobile) {
        fetchAllUsers();
      } else {
        fetchUsers();
      }
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
      if (isMobile) {
        fetchAllUsers();
      } else {
        fetchUsers();
      }
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

  const handleLimitChange = (value: string) => {
    setLimit(parseInt(value));
    setPage(1); // Reset to first page when changing items per page
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

  // User card component for virtualization
  const UserCard = useCallback(({ index, style, ariaAttributes }: RowComponentProps) => {
    const user = allUsers[index];
    if (!user) return null;

    return (
      <div style={style} className="px-1" {...ariaAttributes}>
        <div className="bg-white p-4 rounded-lg border border-royal-light-gray shadow-sm">
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
      </div>
    );
  }, [allUsers, handleEditUser, handleResetPassword, handleToggleVerification, handleChangeRole, handleDeleteClick]);

  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6 flex flex-col h-full overflow-hidden">
      {/* Header Section - Fixed */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 lg:p-6 rounded-lg border border-royal-light-gray shadow-sm flex-shrink-0">
        <div className="flex gap-3 items-center">
          <div className="flex-shrink-0 p-2 bg-royal-gray/10 rounded-lg">
            <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-royal-gray" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-royal-dark-gray">Users</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsStatisticsModalOpen(true)}
            variant="outline"
            className="flex items-center justify-center gap-2 h-11 sm:h-10 text-base sm:text-sm font-medium"
          >
            <BarChart3 className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </Button>
          <Button
            onClick={handleCreateUser}
            className="flex items-center justify-center gap-2 w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
          >
            <PlusIcon className="h-5 w-5 sm:h-4 sm:w-4" />
            Create New User
          </Button>
        </div>
      </div>

      {/* Filters and Search - Fixed */}
      <div className="bg-white p-4 rounded-lg border border-royal-light-gray shadow-sm flex-shrink-0">
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm flex-shrink-0">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Scrollable Content Area - Lists */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-lg border border-royal-light-gray overflow-hidden shadow-sm">
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
                    <Loading message="Loading users..." size="md" />
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

        {/* Mobile Card View with Virtualization */}
        <div ref={listContainerRef} className="lg:hidden flex-1 min-h-0">
          {isLoadingAllUsers ? (
            <Loading message="Loading users..." />
          ) : allUsers.length === 0 ? (
            <div className="text-center py-8 text-royal-gray">No users found</div>
          ) : (
            <List
              rowCount={allUsers.length}
              rowHeight={180} // Approximate height of each card
              style={{ height: listHeight, width: '100%' }}
              className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              rowComponent={UserCard}
              rowProps={{}}
            />
          )}
        </div>
      </div>

      {/* Pagination - Fixed (Hidden on Mobile) */}
      {!isMobile && (
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-royal-light-gray flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="text-xs sm:text-sm text-royal-gray text-center sm:text-left">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.totalUsers)} of {pagination.totalUsers} users
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-royal-gray">Items per page:</span>
                <Select value={limit.toString()} onValueChange={handleLimitChange}>
                  <SelectTrigger className="w-[80px] h-8 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                {/* First Page Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                  title="First page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="hidden lg:inline ml-1">First</span>
                </Button>
                {/* Previous Page Button */}
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
                {/* Page Number Selector */}
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-royal-gray">Page</span>
                  <Select
                    value={page.toString()}
                    onValueChange={(value) => setPage(parseInt(value))}
                  >
                    <SelectTrigger className="w-[70px] h-8 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <SelectItem key={pageNum} value={pageNum.toString()}>
                          {pageNum}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs sm:text-sm text-royal-gray">of {pagination.totalPages}</span>
                </div>
                {/* Mobile: Show current page and total */}
                <div className="flex md:hidden items-center gap-1">
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
                {/* Desktop: Show page number buttons */}
                <div className="hidden sm:flex md:hidden items-center gap-1">
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
                {/* Next Page Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  Next
                </Button>
                {/* Last Page Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.totalPages)}
                  disabled={page === pagination.totalPages}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                  title="Last page"
                >
                  <span className="hidden lg:inline mr-1">Last</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit User Modal */}
      <CreateUserModal
        isOpen={isModalOpen}
        closeDialog={handleCloseModal}
        editingUser={editingUser}
      />

      {/* User Statistics Modal */}
      <Dialog open={isStatisticsModalOpen} onOpenChange={setIsStatisticsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-royal-dark-gray">User Analytics</DialogTitle>
          </DialogHeader>
          {statistics && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-700 mb-2 font-medium">Total Users</div>
                <div className="text-3xl font-bold text-blue-900">{statistics.total}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="text-sm text-green-700 mb-2 font-medium">Verified</div>
                <div className="text-3xl font-bold text-green-900">{statistics.verified}</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <div className="text-sm text-red-700 mb-2 font-medium">Unverified</div>
                <div className="text-3xl font-bold text-red-900">{statistics.unverified}</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                <div className="text-sm text-indigo-700 mb-2 font-medium">Admins</div>
                <div className="text-3xl font-bold text-indigo-900">{statistics.admins}</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-700 mb-2 font-medium">Regular Users</div>
                <div className="text-3xl font-bold text-gray-900">{statistics.users}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-700 mb-2 font-medium">Recent (30d)</div>
                <div className="text-3xl font-bold text-purple-900">{statistics.recentUsers}</div>
                <div className="text-xs text-purple-600 mt-1">New users in last month</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200 md:col-span-3">
                <div className="text-sm text-orange-700 mb-2 font-medium">Active Users (30d)</div>
                <div className="text-3xl font-bold text-orange-900">{statistics.recentActiveUsers}</div>
                <div className="text-xs text-orange-600 mt-1">Users who logged in during the last 30 days</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

