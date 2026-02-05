import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/dateUtils";
import { UserActionsDropdown } from "./UserActionsDropdown";
import type { User } from "../types";
import type { RowComponentProps } from "react-window";

interface UserCardProps {
  style?: React.CSSProperties;
  ariaAttributes?: any;
  user: User;
  onViewOrders: (user: User) => void;
  onViewAsUser: (user: User) => void;
  onEdit: (user: User) => void;
  onResetPassword: (userId: string) => void;
  onToggleVerification: (user: User) => void;
  onChangeRole: (user: User, newRole: "user" | "admin") => void;
  onDelete: (user: User) => void;
}

export function UserCard({
  style,
  ariaAttributes,
  user,
  onViewOrders,
  onViewAsUser,
  onEdit,
  onResetPassword,
  onToggleVerification,
  onChangeRole,
  onDelete,
}: UserCardProps) {
  return (
    <div style={style} className="px-1.5 sm:px-3 pb-1.5" {...ariaAttributes}>
      <div className="bg-white p-2.5 sm:p-5 rounded-lg border border-royal-light-gray shadow-sm hover:shadow-md transition-shadow h-full">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-sm sm:text-lg font-semibold text-royal-dark-gray mb-1 leading-tight">
              {user.firstName} {user.lastName}
            </h3>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm text-royal-gray truncate" title={user.email}>
                {user.email}
              </p>
              {user.phone && (
                <p className="text-xs sm:text-sm text-royal-gray">
                  {user.phone}
                </p>
              )}
            </div>
          </div>
          <UserActionsDropdown
            user={user}
            onViewOrders={onViewOrders}
            onViewAsUser={onViewAsUser}
            onEdit={onEdit}
            onResetPassword={onResetPassword}
            onToggleVerification={onToggleVerification}
            onChangeRole={onChangeRole}
            onDelete={onDelete}
            size="sm"
          />
        </div>

        {/* Badges and Metadata Section */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge
              variant={user.role === "admin" ? "default" : "secondary"}
              className="text-[10px] sm:text-xs font-medium px-1.5 py-0.5"
            >
              {user.role === "admin" ? "Admin" : "User"}
            </Badge>
            <Badge
              variant={user.isVerified ? "default" : "destructive"}
              className="text-[10px] sm:text-xs font-medium px-1.5 py-0.5"
            >
              {user.isVerified ? "Verified" : "Unverified"}
            </Badge>
          </div>
          <div className="text-[10px] sm:text-xs text-royal-gray font-medium">
            Created: {formatDate(user.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
