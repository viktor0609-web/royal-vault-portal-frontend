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
    <nav className={cn("flex items-center space-x-1 text-sm", className)}>
      <Link
        to="/admin"
        className="flex items-center gap-1 px-2 py-1 text-royal-gray hover:text-royal-blue hover:bg-royal-light-gray rounded-md transition-all duration-200"
      >
        <HomeIcon className="h-4 w-4" />
        <span className="font-medium">Admin</span>
      </Link>

      {items.slice(1).map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRightIcon className="h-4 w-4 mx-2 text-royal-light-gray" />
          {item.path && !item.isActive ? (
            <Link
              to={item.path}
              className="px-2 py-1 text-royal-gray hover:text-royal-blue hover:bg-royal-light-gray rounded-md transition-all duration-200 font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              "px-2 py-1 rounded-md font-medium",
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