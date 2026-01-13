import { useState, useEffect, useRef } from "react";
import { useAdminState } from "@/hooks/useAdminState";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { userApi } from "@/lib/api";
import { Menu } from "lucide-react";
import { CreateUserModal } from "./CreateUserModal";
import { HubSpotMigrationModal } from "./HubSpotMigrationModal";
import { useUsersData } from "./hooks/useUsersData";
import { useUserActions } from "./hooks/useUserActions";
import { UsersHeader } from "./components/UsersHeader";
import { UsersFilters } from "./components/UsersFilters";
import { UsersTable } from "./components/UsersTable";
import { UsersMobileView } from "./components/UsersMobileView";
import { UsersPagination } from "./components/UsersPagination";
import { UserStatisticsModal } from "./components/UserStatisticsModal";
import { OrdersModal } from "./components/OrdersModal";
import { UserDeleteDialog } from "./components/UserDeleteDialog";
import { MobileBottomSheet } from "./components/MobileBottomSheet";
import type { User, UsersFilters as FiltersType } from "./types";
import type { UserStatistics } from "@/types";

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  const [viewingOrdersForUserId, setViewingOrdersForUserId] = useState<string | null>(null);
  const [viewingOrdersForUserName, setViewingOrdersForUserName] = useState<string | null>(null);

  // Pagination and filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FiltersType>({
    search: "",
    roleFilter: "all",
    verificationFilter: "all",
    orderBy: "firstName",
    order: "asc",
  });

  const [listHeight, setListHeight] = useState(600);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Use custom hooks for data fetching
  const {
    users: fetchedUsers,
    allUsers,
    loading: dataLoading,
    loadingAllUsers,
    error: dataError,
    pagination,
    refetch,
  } = useUsersData({
    page,
    limit,
    filters,
    isMobile,
  });

  // Update users state when fetched
  useEffect(() => {
    if (isMobile) {
      setUsers(allUsers);
    } else {
      setUsers(fetchedUsers);
    }
  }, [fetchedUsers, allUsers, isMobile, setUsers]);

  // Update error state
  useEffect(() => {
    if (dataError) {
      setError(dataError);
    }
  }, [dataError, setError]);

  // Update loading state
  useEffect(() => {
    setIsLoading(isMobile ? loadingAllUsers : dataLoading);
  }, [dataLoading, loadingAllUsers, isMobile, setIsLoading]);

  // Calculate list height for mobile virtualization
  useEffect(() => {
    if (isMobile && listContainerRef.current) {
      const updateHeight = () => {
        if (listContainerRef.current) {
          const rect = listContainerRef.current.getBoundingClientRect();
          const availableHeight = window.innerHeight - rect.top - 16;
          setListHeight(Math.max(400, availableHeight));
        }
      };
      updateHeight();
      window.addEventListener('resize', updateHeight);
      const timeoutId = setTimeout(updateHeight, 100);
      return () => {
        window.removeEventListener('resize', updateHeight);
        clearTimeout(timeoutId);
      };
    }
  }, [isMobile, filters.search, filters.roleFilter, filters.verificationFilter]);

  // Fetch statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await userApi.getUserStatistics();
        setStatistics(response.data.statistics);
      } catch (error: any) {
        console.error("Error fetching statistics:", error);
      }
    };
    fetchStatistics();
  }, []);

  // User actions hook
  const {
    handleResetPassword,
    handleToggleVerification,
    handleChangeRole,
    handleDelete,
  } = useUserActions({
    onSuccess: () => {
      refetch();
    },
  });

  // Handlers
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
    refetch();
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await handleDelete(userToDelete);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewOrders = (user: User) => {
    setViewingOrdersForUserId(user._id);
    setViewingOrdersForUserName(`${user.firstName} ${user.lastName}`);
  };

  const handleBackToUsers = () => {
    setViewingOrdersForUserId(null);
    setViewingOrdersForUserName(null);
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPage(1);
  };

  const handleSort = (field: string) => {
    setFilters(prev => {
      if (prev.orderBy === field) {
        return {
          ...prev,
          order: prev.order === "asc" ? "desc" : "asc",
        };
      }
      return {
        ...prev,
        orderBy: field,
        order: "asc",
      };
    });
    setPage(1);
  };

  const handleLimitChange = (value: string) => {
    setLimit(parseInt(value));
    setPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, roleFilter: value }));
    setPage(1);
  };

  const handleVerificationFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, verificationFilter: value }));
    setPage(1);
  };

  return (
    <div className="flex-1 p-2 sm:p-4 lg:p-6 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <UsersHeader
        isMobile={isMobile}
        onCreateUser={handleCreateUser}
        onViewAnalytics={() => setIsStatisticsModalOpen(true)}
        onMigrateHubSpot={() => setIsMigrationModalOpen(true)}
      />

      {/* Mobile Search in Header */}
      {isMobile && (
        <div className="mt-2">
          <UsersFilters
            isMobile={true}
            filters={filters}
            onSearchChange={handleSearch}
            onRoleFilterChange={handleRoleFilterChange}
            onVerificationFilterChange={handleVerificationFilterChange}
          />
        </div>
      )}

      {/* Desktop Filters */}
      <UsersFilters
        isMobile={false}
        filters={filters}
        onSearchChange={handleSearch}
        onRoleFilterChange={handleRoleFilterChange}
        onVerificationFilterChange={handleVerificationFilterChange}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
          <p className="font-medium text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Desktop Table View */}
        <UsersTable
          users={users}
          loading={loading}
          orderBy={filters.orderBy}
          order={filters.order}
          onSort={handleSort}
          onViewOrders={handleViewOrders}
          onEdit={handleEditUser}
          onResetPassword={handleResetPassword}
          onToggleVerification={handleToggleVerification}
          onChangeRole={handleChangeRole}
          onDelete={handleDeleteClick}
        />

        {/* Mobile Card View */}
        <div ref={listContainerRef} className="lg:hidden">
          <UsersMobileView
            users={allUsers}
            loading={loadingAllUsers}
            listHeight={listHeight}
            onViewOrders={handleViewOrders}
            onEdit={handleEditUser}
            onResetPassword={handleResetPassword}
            onToggleVerification={handleToggleVerification}
            onChangeRole={handleChangeRole}
            onDelete={handleDeleteClick}
          />
        </div>
      </div>

      {/* Pagination */}
      {!isMobile && (
        <UsersPagination
          page={page}
          limit={limit}
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
        />
      )}

      {/* Modals and Dialogs */}
      <CreateUserModal
        isOpen={isModalOpen}
        closeDialog={handleCloseModal}
        editingUser={editingUser}
      />

      <HubSpotMigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
        onComplete={refetch}
      />

      <UserStatisticsModal
        isOpen={isStatisticsModalOpen}
        onClose={() => setIsStatisticsModalOpen(false)}
        statistics={statistics}
      />

      <UserDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        user={userToDelete}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
      />

      <OrdersModal
        isOpen={!!viewingOrdersForUserId}
        onClose={handleBackToUsers}
        userId={viewingOrdersForUserId}
        userName={viewingOrdersForUserName}
      />

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <button
          onClick={() => setIsBottomSheetOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
          aria-label="Open filters and actions"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <MobileBottomSheet
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
          filters={filters}
          onRoleFilterChange={handleRoleFilterChange}
          onVerificationFilterChange={handleVerificationFilterChange}
          onViewAnalytics={() => {
            setIsStatisticsModalOpen(true);
            setIsBottomSheetOpen(false);
          }}
          onCreateUser={() => {
            handleCreateUser();
            setIsBottomSheetOpen(false);
          }}
          onMigrateHubSpot={() => {
            setIsMigrationModalOpen(true);
            setIsBottomSheetOpen(false);
          }}
        />
      )}
    </div>
  );
}
