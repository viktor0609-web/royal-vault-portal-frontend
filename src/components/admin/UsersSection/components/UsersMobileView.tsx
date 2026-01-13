import { List } from "react-window";
import { Loading } from "@/components/ui/Loading";
import { UsersIcon } from "lucide-react";
import { UserCard } from "./UserCard";
import type { User } from "../types";

interface UsersMobileViewProps {
  users: User[];
  loading: boolean;
  listHeight: number;
  onViewOrders: (user: User) => void;
  onEdit: (user: User) => void;
  onResetPassword: (userId: string) => void;
  onToggleVerification: (user: User) => void;
  onChangeRole: (user: User, newRole: "user" | "admin") => void;
  onDelete: (user: User) => void;
}

export function UsersMobileView({
  users,
  loading,
  listHeight,
  onViewOrders,
  onEdit,
  onResetPassword,
  onToggleVerification,
  onChangeRole,
  onDelete,
}: UsersMobileViewProps) {
  const UserCardWrapper = ({ index, style, ...ariaAttributes }: any) => {
    const user = users[index];
    if (!user) return null;

    return (
      <UserCard
        style={style}
        ariaAttributes={ariaAttributes}
        user={user}
        onViewOrders={onViewOrders}
        onEdit={onEdit}
        onResetPassword={onResetPassword}
        onToggleVerification={onToggleVerification}
        onChangeRole={onChangeRole}
        onDelete={onDelete}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading message="Loading users..." />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <UsersIcon className="h-12 w-12 text-royal-gray/40 mb-4" />
        <p className="text-base font-medium text-royal-gray">No users found</p>
        <p className="text-sm text-royal-gray/70 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="lg:hidden flex-1 min-h-0 py-1">
      <List
        rowCount={users.length}
        rowHeight={140}
        style={{ height: listHeight, width: '100%' }}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        rowComponent={UserCardWrapper}
        rowProps={{}}
      />
    </div>
  );
}
