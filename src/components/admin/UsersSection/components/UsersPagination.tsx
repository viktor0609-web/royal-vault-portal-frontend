import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import type { PaginationState } from "../types";

interface UsersPaginationProps {
  page: number;
  limit: number;
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: string) => void;
}

export function UsersPagination({
  page,
  limit,
  pagination,
  onPageChange,
  onLimitChange,
}: UsersPaginationProps) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg border border-royal-light-gray flex-shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="text-xs sm:text-sm text-royal-gray text-center sm:text-left">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.totalUsers)} of {pagination.totalUsers} users
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-royal-gray">Items per page:</span>
            <Select value={limit.toString()} onValueChange={onLimitChange}>
              <SelectTrigger className="w-[80px] h-8 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 sm:gap-2">
          {/* First Page Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            className="text-xs sm:text-sm px-2 sm:px-3"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="hidden lg:inline ml-1">First</span>
          </Button>
          {/* Previous Page Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="text-xs sm:text-sm px-2 sm:px-3"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>
          {/* Page Number Selector */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs sm:text-sm text-royal-gray">Page</span>
            <Select
              value={page.toString()}
              onValueChange={(value) => onPageChange(parseInt(value))}
            >
              <SelectTrigger className="w-[70px] h-8 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <SelectItem key={pageNum} value={pageNum.toString()}>
                    {pageNum}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs sm:text-sm text-royal-gray">of {pagination.totalPages}</span>
          </div>
          {/* Mobile: Show current page and total */}
          <div className="flex md:hidden items-center gap-1">
            <Button
              variant="default"
              size="sm"
              className="min-w-[32px] text-xs px-2"
              disabled
            >
              {page}
            </Button>
            <span className="text-xs text-royal-gray">/</span>
            <span className="text-xs text-royal-gray">{pagination.totalPages}</span>
          </div>
          {/* Desktop: Show page number buttons */}
          <div className="hidden sm:flex md:hidden items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="min-w-[36px] text-sm px-2"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          {/* Next Page Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === pagination.totalPages}
            className="text-xs sm:text-sm px-2 sm:px-3"
          >
            Next
          </Button>
          {/* Last Page Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.totalPages)}
            disabled={page === pagination.totalPages}
            className="text-xs sm:text-sm px-2 sm:px-3"
            title="Last page"
          >
            <span className="hidden lg:inline mr-1">Last</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
