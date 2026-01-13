import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Loading } from "@/components/ui/Loading";
import { ArrowUp, ArrowDown } from "lucide-react";
import { UserTableRow } from "./UserTableRow";
import type { User } from "../types";

interface UsersTableProps {
  users: User[];
  loading: boolean;
  orderBy: string;
  order: "asc" | "desc";
  onSort: (field: string) => void;
  onViewOrders: (user: User) => void;
  onEdit: (user: User) => void;
  onResetPassword: (userId: string) => void;
  onToggleVerification: (user: User) => void;
  onChangeRole: (user: User, newRole: "user" | "admin") => void;
  onDelete: (user: User) => void;
}

const getSortIcon = (field: string, orderBy: string, order: "asc" | "desc") => {
  if (orderBy !== field) return null;
  return order === "asc" ? (
    <ArrowUp className="h-3 w-3 inline-block ml-1" />
  ) : (
    <ArrowDown className="h-3 w-3 inline-block ml-1" />
  );
};

export function UsersTable({
  users,
  loading,
  orderBy,
  order,
  onSort,
  onViewOrders,
  onEdit,
  onResetPassword,
  onToggleVerification,
  onChangeRole,
  onDelete,
}: UsersTableProps) {
  return (
    <div className="hidden lg:block bg-white rounded-lg border border-royal-light-gray overflow-hidden shadow-sm">
      <Table className="w-full">
        <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
          <TableRow className="bg-gray-50 hover:bg-gray-50 border-b">
            <TableHead
              className="font-semibold text-royal-dark-gray cursor-pointer hover:bg-gray-100 select-none"
              onClick={() => onSort('firstName')}
            >
              <div className="flex items-center">
                Name
                {getSortIcon('firstName', orderBy, order)}
              </div>
            </TableHead>
            <TableHead
              className="font-semibold text-royal-dark-gray cursor-pointer hover:bg-gray-100 select-none"
              onClick={() => onSort('email')}
            >
              <div className="flex items-center">
                Email
                {getSortIcon('email', orderBy, order)}
              </div>
            </TableHead>
            <TableHead
              className="font-semibold text-royal-dark-gray cursor-pointer hover:bg-gray-100 select-none"
              onClick={() => onSort('phone')}
            >
              <div className="flex items-center">
                Phone
                {getSortIcon('phone', orderBy, order)}
              </div>
            </TableHead>
            <TableHead
              className="font-semibold text-royal-dark-gray cursor-pointer hover:bg-gray-100 select-none"
              onClick={() => onSort('role')}
            >
              <div className="flex items-center">
                Role
                {getSortIcon('role', orderBy, order)}
              </div>
            </TableHead>
            <TableHead
              className="font-semibold text-royal-dark-gray cursor-pointer hover:bg-gray-100 select-none"
              onClick={() => onSort('isVerified')}
            >
              <div className="flex items-center">
                Status
                {getSortIcon('isVerified', orderBy, order)}
              </div>
            </TableHead>
            <TableHead
              className="font-semibold text-royal-dark-gray cursor-pointer hover:bg-gray-100 select-none"
              onClick={() => onSort('createdAt')}
            >
              <div className="flex items-center">
                Created
                {getSortIcon('createdAt', orderBy, order)}
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
              <UserTableRow
                key={user._id}
                user={user}
                onViewOrders={onViewOrders}
                onEdit={onEdit}
                onResetPassword={onResetPassword}
                onToggleVerification={onToggleVerification}
                onChangeRole={onChangeRole}
                onDelete={onDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
