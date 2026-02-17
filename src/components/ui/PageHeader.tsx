import { cn } from "@/lib/utils";
import { BackButton } from "./BackButton";

const headerContainerClass =
  "bg-white rounded-lg border border-royal-light-gray shadow-sm min-w-0";

const headerPaddingClass = "px-3 sm:px-4 lg:px-6 py-3 sm:py-4";

interface PageHeaderBackProps {
  to?: string;
  onClick?: () => void;
  label: string;
}

interface PageHeaderProps {
  /** Back link or button. Omit for no back. */
  back?: PageHeaderBackProps;
  /** Main title */
  title: React.ReactNode;
  /** Optional description below title */
  description?: React.ReactNode;
  /** Optional content on the right (e.g. icon button for back) */
  right?: React.ReactNode;
  /** Optional icon/emoji left of title */
  icon?: React.ReactNode;
  className?: string;
  /** If true, back is in a separate row with border-b */
  backInRow?: boolean;
}

export function PageHeader({
  back,
  title,
  description,
  right,
  icon,
  className,
  backInRow = false,
}: PageHeaderProps) {
  const backEl = back ? (
    back.to ? (
      <BackButton to={back.to} title={back.label}>
        {back.label}
      </BackButton>
    ) : (
      <BackButton onClick={back.onClick} title={back.label}>
        {back.label}
      </BackButton>
    )
  ) : null;

  return (
    <div className={cn(headerContainerClass, className)}>
      {backInRow && backEl ? (
        <div className={cn(headerPaddingClass, "border-b border-royal-light-gray")}>
          <div className="flex items-center gap-2 sm:gap-3">{backEl}</div>
        </div>
      ) : null}
      <div className={cn(headerPaddingClass, "flex items-center gap-2 sm:gap-4")}>
        {icon ? <div className="flex-shrink-0">{icon}</div> : null}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-royal-dark-gray truncate">
            {title}
          </h1>
          {description ? (
            <p className="text-xs sm:text-base text-royal-gray mt-1 line-clamp-2">
              {description}
            </p>
          ) : null}
        </div>
        {!backInRow && backEl ? <div className="flex-shrink-0">{backEl}</div> : null}
        {right ? <div className="flex-shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}
