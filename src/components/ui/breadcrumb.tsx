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
    <nav className={cn("flex items-center space-x-0.5 text-xs sm:text-sm overflow-x-auto", className)}>
      <Link
        to="/admin"
        className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 text-royal-gray hover:text-royal-blue hover:bg-royal-light-gray rounded transition-all duration-200 whitespace-nowrap"
      >
        <HomeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="font-medium hidden sm:inline">Admin</span>
        <span className="font-medium sm:hidden">A</span>
      </Link>

      {items.slice(1).map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 mx-1 sm:mx-2 text-royal-light-gray flex-shrink-0" />
          {item.path && !item.isActive ? (
            <Link
              to={item.path}
              className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-royal-gray hover:text-royal-blue hover:bg-royal-light-gray rounded transition-all duration-200 font-medium whitespace-nowrap text-xs sm:text-sm"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              "px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-medium whitespace-nowrap text-xs sm:text-sm",
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