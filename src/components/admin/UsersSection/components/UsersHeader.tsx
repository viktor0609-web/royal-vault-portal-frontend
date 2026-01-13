import { Button } from "@/components/ui/button";
import { UsersIcon, PlusIcon, BarChart3, Download } from "lucide-react";

interface UsersHeaderProps {
  isMobile: boolean;
  onCreateUser: () => void;
  onViewAnalytics: () => void;
  onMigrateHubSpot: () => void;
}

export function UsersHeader({
  isMobile,
  onCreateUser,
  onViewAnalytics,
  onMigrateHubSpot,
}: UsersHeaderProps) {
  return (
    <div className={`flex flex-col ${isMobile ? 'gap-2 p-3' : 'gap-3 p-4 sm:p-5 lg:p-6'} bg-white rounded-xl border border-royal-light-gray shadow-sm flex-shrink-0`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div className="flex gap-2 sm:gap-3 items-center">
          <div className={`flex-shrink-0 ${isMobile ? 'p-1.5' : 'p-2.5'} bg-royal-gray/10 rounded-lg`}>
            <UsersIcon className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5 sm:h-6 sm:w-6'} text-royal-gray`} />
          </div>
          <h1 className={`${isMobile ? 'text-lg' : 'text-xl sm:text-2xl lg:text-3xl'} font-bold text-royal-dark-gray`}>
            Users
          </h1>
        </div>
        {/* Desktop Actions */}
        <div className="hidden sm:flex gap-2">
          <Button
            onClick={onViewAnalytics}
            variant="outline"
            className="flex items-center justify-center gap-2 h-10 text-sm font-medium"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button
            onClick={onMigrateHubSpot}
            variant="outline"
            className="flex items-center justify-center gap-2 h-10 text-sm font-medium"
          >
            <Download className="h-4 w-4" />
            Migrate HubSpot
          </Button>
          <Button
            onClick={onCreateUser}
            className="flex items-center justify-center gap-2 h-10 text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
          >
            <PlusIcon className="h-4 w-4" />
            Create New User
          </Button>
        </div>
      </div>
    </div>
  );
}
