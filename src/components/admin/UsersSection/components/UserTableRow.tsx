import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/dateUtils";
import { UserActionsDropdown } from "./UserActionsDropdown";
import type { User } from "../types";

interface UserTableRowProps {
  user: User;
  onViewOrders: (user: User) => void;
  onEdit: (user: User) => void;
  onResetPassword: (userId: string) => void;
  onToggleVerification: (user: User) => void;
  onChangeRole: (user: User, newRole: "user" | "admin") => void;
  onDelete: (user: User) => void;
}

export function UserTableRow({
  user,
  onViewOrders,
  onEdit,
  onResetPassword,
  onToggleVerification,
  onChangeRole,
  onDelete,
}: UserTableRowProps) {
  return (
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
        <UserActionsDropdown
          user={user}
          onViewOrders={onViewOrders}
          onEdit={onEdit}
          onResetPassword={onResetPassword}
          onToggleVerification={onToggleVerification}
          onChangeRole={onChangeRole}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
}
