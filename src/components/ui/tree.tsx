import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, Plus, Pencil, Trash } from "lucide-react";

export type TreeNode = {
  id: string;
  label: string;
  type?: "branch" | "leaf";  // Adjusted to not have a "root" type
  children?: TreeNode[];
};

interface TreeContextValue {
  onCreate?: (node: TreeNode) => void;
  onEdit?: (node: TreeNode) => void;
  onDelete?: (node: TreeNode) => void;
}

const TreeContext = React.createContext<TreeContextValue>({});

const useTree = () => React.useContext(TreeContext);

const Tree = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    data: TreeNode[]; // Multiple root nodes
    onCreate?: (node: TreeNode) => void;
    onEdit?: (node: TreeNode) => void;
    onDelete?: (node: TreeNode) => void;
  }
>(({ className, data, onCreate, onEdit, onDelete, ...props }, ref) => {
  return (
    <TreeContext.Provider value={{ onCreate, onEdit, onDelete }}>
      <div
        ref={ref}
        className={cn("w-full rounded-lg border border-gray-200 bg-white shadow-sm p-2", className)}
        {...props}
      >
        {data.map((node) => (
          <TreeNodeComponent key={node.id} node={node} />
        ))}
      </div>
    </TreeContext.Provider>
  );
});
Tree.displayName = "Tree";

const TreeNodeComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { node: TreeNode }
>(({ className, node, ...props }, ref) => {
  const { onCreate, onEdit, onDelete } = useTree();
  const [expanded, setExpanded] = React.useState(true);

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div ref={ref} className={cn("ml-2 my-1", className)} {...props}>
      {/* Node row */}
      <div className="flex items-center justify-between bg-gray-50 rounded-md px-2 py-1 hover:bg-gray-100">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => hasChildren && setExpanded(!expanded)}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )
          ) : (
            <div className="w-4" />
          )}
          <span className="text-sm font-medium text-gray-800">{node.label}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-1">
          {hasChildren && (
            <button
              onClick={() => onCreate?.(node)}
              className="flex items-center gap-1 rounded-md bg-blue-500 px-2 py-0.5 text-xs text-white hover:bg-blue-600"
            >
              <Plus className="w-3 h-3" /> Create
            </button>
          )}
          <button
            onClick={() => onEdit?.(node)}
            className="flex items-center gap-1 rounded-md bg-blue-500 px-2 py-0.5 text-xs text-white hover:bg-blue-600"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => onDelete?.(node)}
            className="flex items-center gap-1 rounded-md bg-blue-500 px-2 py-0.5 text-xs text-white hover:bg-blue-600"
          >
            <Trash className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="ml-5 border-l border-gray-200 pl-3">
          {node.children!.map((child) => (
            <TreeNodeComponent key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
});
TreeNodeComponent.displayName = "TreeNodeComponent";


export { Tree };