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
    <header className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
              BranchPad
            </h1>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleComparisonMode}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary ${
                comparison.isActive
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {comparison.isActive ? "Exit Comparison" : "Compare Branches"}
            </button>

            <div className="hidden sm:flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowExport(true)}
                disabled={loading || !pyodide}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary ${
                  loading || !pyodide
                    ? "bg-secondary text-secondary-foreground/50 cursor-not-allowed"
                    : "bg-indigo-500 text-white hover:bg-indigo-600"
                }`}
              >
                Export for Deployment
              </button>

              <button
                onClick={() => exportAndDownload(pyodide, cells)}
                disabled={loading || !pyodide}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary ${
                  loading || !pyodide
                    ? "bg-secondary text-secondary-foreground/50 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Export Notebook
              </button>
            </div>

            <div className="relative group">
              <button
                className="p-2 rounded-md hover:bg-secondary transition-colors"
                aria-label="More options"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg border border-border overflow-hidden scale-95 opacity-0 invisible group-hover:scale-100 group-hover:opacity-100 group-hover:visible transition-all origin-top-right z-50">
                <div className="py-1">
                  <button
                    onClick={getInstalledPackages}
                    disabled={loading || !pyodide}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Show Packages
                  </button>

                  <div className="sm:hidden">
                    <button
                      onClick={() => setShowExport(true)}
                      disabled={loading || !pyodide}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Export for Deployment
                    </button>

                    <button
                      onClick={() => exportAndDownload(pyodide, cells)}
                      disabled={loading || !pyodide}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Export Notebook
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
