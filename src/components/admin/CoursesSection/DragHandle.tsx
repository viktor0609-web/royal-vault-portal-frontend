import { GripVertical } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";

interface DragHandleProps {
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  className?: string;
}

/**
 * Professional drag handle for reorderable table rows.
 * Use inside the first cell of a row; pair with row onDragOver/onDrop.
 */
export function DragHandle({ onDragStart, onDragEnd, className = "" }: DragHandleProps) {
  return (
    <span
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={
        "inline-flex items-center justify-center rounded border border-royal-light-gray bg-gray-50/80 p-1.5 cursor-grab active:cursor-grabbing hover:bg-gray-100 hover:border-royal-gray transition-colors touch-none select-none " +
        className
      }
      title="Drag to reorder display order"
    >
      <GripVertical className="h-4 w-4 text-royal-gray" aria-hidden />
    </span>
  );
}

/** Header label for the display-order column */
export const DISPLAY_ORDER_HEADER = "Display order";

/**
 * Modern drop indicator: a horizontal line showing where the item will be inserted.
 * Renders as a single full-width table row. Use when dragOver to show exact drop position.
 */
export function DropIndicatorRow({ colSpan }: { colSpan: number }) {
  return (
    <TableRow className="h-0 border-0 p-0 bg-transparent hover:bg-transparent odd:bg-transparent even:bg-transparent [&>td]:border-0 [&>td]:p-0 [&>td]:align-middle [&>td]:vertical-align-middle">
      <TableCell colSpan={colSpan} className="h-0 p-0 border-0 align-middle">
        <div
          className="h-0.5 min-h-[2px] w-full rounded-full bg-primary shadow-[0_0_0_1px_hsl(var(--primary))]"
          aria-hidden
        />
      </TableCell>
    </TableRow>
  );
}
