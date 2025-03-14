"use client";

import { Cell, colorMappings } from "../types";

interface ExportModalProps {
  cells: Cell[];
  onClose: () => void;
  onExport: (cellId: string) => void;
}

export function ExportModal({ cells, onClose, onExport }: ExportModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Export for Deployment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Select a branch to export. This will generate a ZIP file containing:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 ml-4">
            <li>Python script with all code from root to selected branch</li>
            <li>requirements.txt with all necessary dependencies</li>
            <li>Dockerfile for containerized deployment</li>
            <li>README with setup and running instructions</li>
          </ul>

          <div className="mt-6 space-y-4">
            <h3 className="font-medium">Select Branch to Export</h3>
            <div className="grid gap-2">
              {cells.map((cell) => (
                <button
                  key={cell.id}
                  onClick={() => {
                    onExport(cell.id);
                  }}
                  className={`p-4 text-left rounded-lg border ${
                    colorMappings[cell.color as keyof typeof colorMappings]
                      .border
                  } ${
                    colorMappings[cell.color as keyof typeof colorMappings].bg
                  } hover:opacity-80 transition-opacity`}
                >
                  <div className="font-medium">{cell.label}</div>
                  {cell.description && (
                    <div className="text-sm text-gray-500 mt-1">
                      {cell.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
