import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const baseClass =
  "inline-flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-2 text-royal-gray hover:text-royal-blue hover:bg-royal-light-gray rounded-md transition-all duration-200 group text-xs sm:text-sm flex-shrink-0 font-medium";

interface BackButtonProps {
  to?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  title?: string;
  /** Icon only (no text); title used for tooltip */
  iconOnly?: boolean;
}

const iconOnlyClass =
  "p-1.5 sm:p-2 rounded-lg hover:bg-royal-blue/5 transition-all duration-75 hover:scale-105 group inline-flex items-center justify-center";

export function BackButton({ to, onClick, children, className, title, iconOnly }: BackButtonProps) {
  const content = iconOnly ? (
    <ArrowLeftIcon className="h-4 w-4 sm:h-6 sm:w-6 text-royal-gray group-hover:text-royal-blue transition-colors duration-75" />
  ) : (
    <>
      <ArrowLeftIcon className="h-3 w-3 sm:h-4 sm:w-4 group-hover:-translate-x-0.5 transition-transform" />
      {children != null && <span>{children}</span>}
    </>
  );

  const combinedClass = cn(
    iconOnly ? iconOnlyClass : baseClass,
    className
  );

  if (to) {
    return (
      <Link to={to} className={cn("cursor-pointer flex-shrink-0", combinedClass)} title={title}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn("flex-shrink-0", combinedClass)} title={title}>
      {content}
    </button>
  );
}
