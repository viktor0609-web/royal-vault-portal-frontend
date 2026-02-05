import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, KeyRound, Shield, ShieldOff, Receipt, UserCircle } from "lucide-react";
import type { User } from "../types";

interface UserActionsDropdownProps {
  user: User;
  onViewOrders: (user: User) => void;
  onViewAsUser: (user: User) => void;
  onEdit: (user: User) => void;
  onResetPassword: (userId: string) => void;
  onToggleVerification: (user: User) => void;
  onChangeRole: (user: User, newRole: "user" | "admin") => void;
  onDelete: (user: User) => void;
  size?: "sm" | "default";
  className?: string;
}

export function UserActionsDropdown({
  user,
  onViewOrders,
  onViewAsUser,
  onEdit,
  onResetPassword,
  onToggleVerification,
  onChangeRole,
  onDelete,
  size = "default",
  className = "",
}: UserActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          className={size === "sm" ? "h-7 w-7 p-0 flex-shrink-0 hover:bg-gray-100" : className}
        >
          <MoreVertical className="h-4 w-4 text-royal-gray" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onViewAsUser(user)} className="text-sm">
          <UserCircle className="mr-2 h-4 w-4" />
          View as User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewOrders(user)} className="text-sm">
          <Receipt className="mr-2 h-4 w-4" />
          View Orders
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(user)} className="text-sm">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onResetPassword(user._id)} className="text-sm">
          <KeyRound className="mr-2 h-4 w-4" />
          Reset Password
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleVerification(user)} className="text-sm">
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
          onClick={() => onChangeRole(user, user.role === "admin" ? "user" : "admin")}
          className="text-sm"
        >
          <Shield className="mr-2 h-4 w-4" />
          Change to {user.role === "admin" ? "User" : "Admin"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(user)} className="text-red-600 text-sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
