"use client";

import { useBranchPad } from "../context/BranchPadContext";
import { exportAndDownload } from "../utils/export";

export function BranchPadHeader() {
  const {
    toggleComparisonMode,
    comparison,
    setShowExport,
    loading,
    pyodide,
    cells,
    getInstalledPackages,
  } = useBranchPad();

  return (
    <div className="flex items-center gap-4">
      <h1 className="text-2xl font-bold text-center">BranchPad</h1>
      <button
        onClick={toggleComparisonMode}
        className={`px-4 py-2 rounded-lg font-medium text-white ${
          comparison.isActive
            ? "bg-green-500 hover:bg-green-600"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {comparison.isActive ? "Exit Comparison" : "Compare Branches"}
      </button>
      <button
        onClick={() => setShowExport(true)}
        disabled={loading || !pyodide}
        className={`px-4 py-2 rounded-lg font-medium text-white ${
          loading || !pyodide
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-purple-500 hover:bg-purple-600"
        }`}
      >
        Export for Deployment
      </button>
      <button
        onClick={() => exportAndDownload(pyodide, cells)}
        disabled={loading || !pyodide}
        className={`px-4 py-2 rounded-lg font-medium text-white ${
          loading || !pyodide
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-500 hover:bg-indigo-600"
        }`}
      >
        Export Notebook
      </button>
      <button
        onClick={getInstalledPackages}
        disabled={loading || !pyodide}
        className={`px-4 py-2 rounded-lg font-medium text-white ${
          loading || !pyodide
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-orange-500 hover:bg-orange-600"
        }`}
      >
        Show Packages
      </button>
    </div>
  );
}
