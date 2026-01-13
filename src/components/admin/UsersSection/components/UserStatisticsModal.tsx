import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import type { UserStatistics } from "@/types";

interface UserStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statistics: UserStatistics | null;
}

export function UserStatisticsModal({
  isOpen,
  onClose,
  statistics,
}: UserStatisticsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-royal-dark-gray">
            User Analytics
          </DialogTitle>
        </DialogHeader>
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700 mb-2 font-medium">Total Users</div>
              <div className="text-3xl font-bold text-blue-900">{statistics.total}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-700 mb-2 font-medium">Verified</div>
              <div className="text-3xl font-bold text-green-900">{statistics.verified}</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-red-700 mb-2 font-medium">Unverified</div>
              <div className="text-3xl font-bold text-red-900">{statistics.unverified}</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
              <div className="text-sm text-indigo-700 mb-2 font-medium">Admins</div>
              <div className="text-3xl font-bold text-indigo-900">{statistics.admins}</div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-700 mb-2 font-medium">Regular Users</div>
              <div className="text-3xl font-bold text-gray-900">{statistics.users}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-700 mb-2 font-medium">Recent (30d)</div>
              <div className="text-3xl font-bold text-purple-900">{statistics.recentUsers}</div>
              <div className="text-xs text-purple-600 mt-1">New users in last month</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200 md:col-span-3">
              <div className="text-sm text-orange-700 mb-2 font-medium">Active Users (30d)</div>
              <div className="text-3xl font-bold text-orange-900">{statistics.recentActiveUsers}</div>
              <div className="text-xs text-orange-600 mt-1">Users who logged in during the last 30 days</div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
