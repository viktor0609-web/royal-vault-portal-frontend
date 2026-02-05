import { Button } from "@/components/ui/button";
import { UsersIcon, PlusIcon, BarChart3 } from "lucide-react";

interface UsersHeaderProps {
  isMobile: boolean;
  onCreateUser: () => void;
  onViewAnalytics: () => void;
}

export function UsersHeader({
  isMobile,
  onCreateUser,
  onViewAnalytics,
}: UsersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-2 bg-white p-3 sm:p-4 lg:p-6 rounded-lg border border-royal-light-gray shadow-sm min-w-0 flex-shrink-0">
      <div className="flex gap-2 items-center min-w-0 flex-1">
        <div className="flex-shrink-0 p-2 bg-royal-gray/10 rounded-lg">
          <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-royal-gray" />
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-royal-dark-gray truncate">
          Users
        </h1>
      </div>
      {/* Desktop Actions */}
      <div className="hidden sm:flex gap-2 flex-shrink-0">
        <Button
          onClick={onViewAnalytics}
          variant="outline"
          className="flex items-center justify-center gap-2 h-10 text-sm font-medium"
        >
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Button>
        <Button
          onClick={onCreateUser}
          className="flex items-center justify-center gap-2 w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
        >
          <PlusIcon className="h-5 w-5 sm:h-4 sm:w-4" />
          Create New User
        </Button>
      </div>
    </div>
  );
}
