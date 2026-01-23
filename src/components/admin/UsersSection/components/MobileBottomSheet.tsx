import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BottomSheet } from "@/components/VideoMeeting/BottomSheet";
import { BarChart3, PlusIcon } from "lucide-react";
import type { UsersFilters } from "../types";

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: UsersFilters;
  onRoleFilterChange: (value: string) => void;
  onVerificationFilterChange: (value: string) => void;
  onViewAnalytics: () => void;
  onCreateUser: () => void;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  filters,
  onRoleFilterChange,
  onVerificationFilterChange,
  onViewAnalytics,
  onCreateUser,
}: MobileBottomSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Users"
      maxHeight="85vh"
    >
      <div className="p-4 space-y-4">
        {/* Filters */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Filters</label>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Role</label>
              <Select value={filters.roleFilter} onValueChange={onRoleFilterChange}>
                <SelectTrigger className="w-full h-11 bg-gray-800 border-gray-700 text-white hover:bg-gray-750">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="!z-[70] bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all" className="text-white focus:bg-gray-700">All Roles</SelectItem>
                  <SelectItem value="admin" className="text-white focus:bg-gray-700">Admin</SelectItem>
                  <SelectItem value="user" className="text-white focus:bg-gray-700">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Status</label>
              <Select value={filters.verificationFilter} onValueChange={onVerificationFilterChange}>
                <SelectTrigger className="w-full h-11 bg-gray-800 border-gray-700 text-white hover:bg-gray-750">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="!z-[70] bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all" className="text-white focus:bg-gray-700">All Status</SelectItem>
                  <SelectItem value="true" className="text-white focus:bg-gray-700">Verified</SelectItem>
                  <SelectItem value="false" className="text-white focus:bg-gray-700">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-2" />

        {/* Actions */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Actions</label>
          <div className="space-y-2">
            <Button
              onClick={() => {
                onViewAnalytics();
                onClose();
              }}
              variant="outline"
              className="w-full h-11 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 justify-start"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            <Button
              onClick={() => {
                onCreateUser();
                onClose();
              }}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white justify-start"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New User
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
