import { GripVertical } from "lucide-react";

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
