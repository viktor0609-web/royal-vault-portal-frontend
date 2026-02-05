import * as React from "react";

import { cn } from "@/lib/utils";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />,
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  ),
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
  ),
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors data-[state=selected]:bg-muted",
        // base row colors
        "odd:bg-white even:bg-black/10",
        // hover styles
        "odd:hover:bg-gray-100 even:hover:bg-gray-200",
        className
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("p-2 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
  ),
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
  ),
);
TableCaption.displayName = "TableCaption";

/** Scrollable table body with fixed/sticky header. Use with TableHeader + TableBody. */
interface ScrollableTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Max height of the scroll area (e.g. "70vh", "400px", "100%"). Default: min(70vh, 600px) */
  maxHeight?: string | number;
  /** Optional class for the inner table (e.g. "table-fixed") */
  tableClassName?: string;
}

const ScrollableTable = React.forwardRef<HTMLDivElement, ScrollableTableProps>(
  ({ children, className, maxHeight = "min(70vh, 600px)", tableClassName, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col rounded-lg border border-royal-light-gray bg-white shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      <div
        className="overflow-auto overflow-x-auto flex-1 min-h-0 [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-20 [&_thead]:bg-white [&_thead]:shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
        style={{ maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight }}
      >
        <table className={cn("w-full caption-bottom text-sm border-collapse", tableClassName)}>{children}</table>
      </div>
    </div>
  )
);
ScrollableTable.displayName = "ScrollableTable";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption, ScrollableTable };
