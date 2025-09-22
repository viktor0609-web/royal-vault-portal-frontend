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
    <nav className={cn("flex items-center space-x-1 text-sm text-royal-gray", className)}>
      <Link
        to="/admin"
        className="flex items-center hover:text-royal-blue transition-colors"
      >
        <HomeIcon className="h-4 w-4" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRightIcon className="h-4 w-4 mx-1 text-royal-light-gray" />
          {item.path && !item.isActive ? (
            <Link
              to={item.path}
              className="hover:text-royal-blue transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              "font-medium",
              item.isActive ? "text-royal-dark-gray" : "text-royal-gray"
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}