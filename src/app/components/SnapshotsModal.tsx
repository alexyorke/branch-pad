"use client";

import { Cell } from "../types";

interface SnapshotsModalProps {
  selectedCellId: string;
  cells: Cell[];
  onClose: () => void;
  onCreateSnapshot: (cellId: string, label: string) => void;
  onRestoreSnapshot: (cellId: string, snapshotId: string) => void;
}

export function SnapshotsModal({
  selectedCellId,
  cells,
  onClose,
  onCreateSnapshot,
  onRestoreSnapshot,
}: SnapshotsModalProps) {
  const selectedCell = cells.find((c) => c.id === selectedCellId);
  if (!selectedCell) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Branch Snapshots</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Create new snapshot */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="font-medium mb-2">Create New Snapshot</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Snapshot label"
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="snapshotLabel"
            />
            <button
              onClick={() => {
                const label = (
                  document.getElementById("snapshotLabel") as HTMLInputElement
                ).value;
                if (label) {
                  onCreateSnapshot(selectedCellId, label);
                  (
                    document.getElementById("snapshotLabel") as HTMLInputElement
                  ).value = "";
                }
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Create Snapshot
            </button>
          </div>
        </div>

        {/* Snapshot timeline */}
        <div className="space-y-4">
          <h3 className="font-medium">Snapshot Timeline</h3>
          {selectedCell.snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-medium">{snapshot.label}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(snapshot.timestamp).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onRestoreSnapshot(selectedCellId, snapshot.id);
                    onClose();
                  }}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                >
                  Restore
                </button>
              </div>
              <pre className="text-sm bg-white dark:bg-gray-800 p-2 rounded mt-2 max-h-32 overflow-y-auto">
                {snapshot.code}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
