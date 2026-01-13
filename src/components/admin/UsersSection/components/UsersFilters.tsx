import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { UsersFilters as FiltersType } from "../types";

interface UsersFiltersProps {
  isMobile: boolean;
  filters: FiltersType;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onVerificationFilterChange: (value: string) => void;
}

export function UsersFilters({
  isMobile,
  filters,
  onSearchChange,
  onRoleFilterChange,
  onVerificationFilterChange,
}: UsersFiltersProps) {
  if (isMobile) {
    return (
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-royal-gray z-10" />
        <Input
          placeholder="Search by name, email, or phone..."
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-8 text-xs"
        />
      </div>
    );
  }

  return (
    <div className="hidden sm:block bg-white p-4 sm:p-5 rounded-xl border border-royal-light-gray shadow-sm flex-shrink-0">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-royal-gray z-10" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 text-sm"
          />
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Select value={filters.roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-full sm:w-[140px] h-10 text-sm">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.verificationFilter} onValueChange={onVerificationFilterChange}>
            <SelectTrigger className="w-full sm:w-[140px] h-10 text-sm">
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
    </div>
  );
}
