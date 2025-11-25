import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export function Loading({ 
  message = "Loading...", 
  className,
  size = "md",
  fullScreen = false 
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3",
      fullScreen ? "min-h-[400px]" : "py-8",
      className
    )}>
      <Loader2 className={cn(
        "animate-spin text-royal-blue",
        sizeClasses[size]
      )} />
      <p className="text-sm sm:text-base text-royal-gray font-medium">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex-1 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

