import { Cell } from "../app/types";

interface DeleteConfirmDialogProps {
  cell: Cell;
  descendantCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  cell,
  descendantCount,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full mx-4 p-6 border border-border">
        <h2 className="text-xl font-semibold mb-4">Delete Branch</h2>
        <p className="text-secondary-foreground/80 mb-2">
          Are you sure you want to delete{" "}
          <span className="font-medium">{cell.label}</span>?
        </p>
        {descendantCount > 0 && (
          <p className="text-destructive mb-4">
            This will also delete {descendantCount} descendant{" "}
            {descendantCount === 1 ? "branch" : "branches"}.
          </p>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
