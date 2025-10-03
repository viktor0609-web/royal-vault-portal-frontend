import { ChevronRightIcon, HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center space-x-0.5 sm:space-x-1 text-xs sm:text-sm min-w-0", className)}>
      <Link
        to="/admin"
        className="flex items-center gap-1 px-1 sm:px-2 py-1 text-royal-gray hover:text-royal-blue hover:bg-royal-light-gray rounded-md transition-all duration-200"
      >
        <HomeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="font-medium text-xs sm:text-sm">Admin</span>
      </Link>

      {items.slice(1).map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 mx-1 sm:mx-2 text-royal-light-gray" />
          {item.path && !item.isActive ? (
            <Link
              to={item.path}
              className="px-1 sm:px-2 py-1 text-royal-gray hover:text-royal-blue hover:bg-royal-light-gray rounded-md transition-all duration-200 font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px] md:max-w-none"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              "px-1 sm:px-2 py-1 rounded-md font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px] md:max-w-none",
              item.isActive
                ? "text-royal-dark-gray bg-royal-light-gray"
                : "text-royal-gray"
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}