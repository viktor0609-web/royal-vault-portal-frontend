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
    <nav className={cn("flex items-center space-x-0.5 text-[10px] sm:text-xs min-w-0", className)}>
      <Link
        to="/admin"
        className="flex items-center gap-0.5 px-1 py-0.5 text-royal-gray hover:text-royal-blue hover:bg-royal-light-gray rounded transition-all duration-200"
      >
        <HomeIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        <span className="font-medium text-[10px] sm:text-xs">Admin</span>
      </Link>

      {items.slice(1).map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRightIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mx-0.5 sm:mx-1 text-royal-light-gray" />
          {item.path && !item.isActive ? (
            <Link
              to={item.path}
              className="px-1 py-0.5 text-royal-gray hover:text-royal-blue hover:bg-royal-light-gray rounded transition-all duration-200 font-medium text-[10px] sm:text-xs truncate max-w-[80px] sm:max-w-[120px] md:max-w-none"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              "px-1 py-0.5 rounded font-medium text-[10px] sm:text-xs truncate max-w-[80px] sm:max-w-[120px] md:max-w-none",
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