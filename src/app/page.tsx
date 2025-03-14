"use client";

import { useState, useEffect } from "react";
import { exportAndDownload } from "../utils/export";

declare global {
  interface Window {
    loadPyodide: any;
  }
}

interface Snapshot {
  id: string;
  timestamp: number;
  code: string;
  output: string;
  error: string | null;
  executionContext: any;
  label: string;
  description: string;
  color: string;
}

interface Cell {
  id: string;
  code: string;
  output: string;
  error: string | null;
  parentId: string | null;
  executionContext: any;
  label: string;
  description: string;
  color: string;
  snapshots: Snapshot[];
  currentSnapshotId: string | null;
}

interface TreeNode {
  cell: Cell;
  children: TreeNode[];
}

interface ComparisonState {
  isActive: boolean;
  selectedCells: string[];
}

// Color mappings for Tailwind classes
const colorMappings = {
  blue: {
    border: "border-blue-200 dark:border-blue-800",
    bg: "bg-blue-50 dark:bg-blue-900/10",
    text: "text-blue-600 dark:text-blue-400",
    button: "bg-blue-500 hover:bg-blue-600",
    ring: "focus:ring-blue-500",
    buttonBg: "bg-blue-500",
    buttonRing: "ring-blue-400",
  },
  purple: {
    border: "border-purple-200 dark:border-purple-800",
    bg: "bg-purple-50 dark:bg-purple-900/10",
    text: "text-purple-600 dark:text-purple-400",
    button: "bg-purple-500 hover:bg-purple-600",
    ring: "focus:ring-purple-500",
    buttonBg: "bg-purple-500",
    buttonRing: "ring-purple-400",
  },
  green: {
    border: "border-green-200 dark:border-green-800",
    bg: "bg-green-50 dark:bg-green-900/10",
    text: "text-green-600 dark:text-green-400",
    button: "bg-green-500 hover:bg-green-600",
    ring: "focus:ring-green-500",
    buttonBg: "bg-green-500",
    buttonRing: "ring-green-400",
  },
  orange: {
    border: "border-orange-200 dark:border-orange-800",
    bg: "bg-orange-50 dark:bg-orange-900/10",
    text: "text-orange-600 dark:text-orange-400",
    button: "bg-orange-500 hover:bg-orange-600",
    ring: "focus:ring-orange-500",
    buttonBg: "bg-orange-500",
    buttonRing: "ring-orange-400",
  },
  pink: {
    border: "border-pink-200 dark:border-pink-800",
    bg: "bg-pink-50 dark:bg-pink-900/10",
    text: "text-pink-600 dark:text-pink-400",
    button: "bg-pink-500 hover:bg-pink-600",
    ring: "focus:ring-pink-500",
    buttonBg: "bg-pink-500",
    buttonRing: "ring-pink-400",
  },
  teal: {
    border: "border-teal-200 dark:border-teal-800",
    bg: "bg-teal-50 dark:bg-teal-900/10",
    text: "text-teal-600 dark:text-teal-400",
    button: "bg-teal-500 hover:bg-teal-600",
    ring: "focus:ring-teal-500",
    buttonBg: "bg-teal-500",
    buttonRing: "ring-teal-400",
  },
  cyan: {
    border: "border-cyan-200 dark:border-cyan-800",
    bg: "bg-cyan-50 dark:bg-cyan-900/10",
    text: "text-cyan-600 dark:text-cyan-400",
    button: "bg-cyan-500 hover:bg-cyan-600",
    ring: "focus:ring-cyan-500",
    buttonBg: "bg-cyan-500",
    buttonRing: "ring-cyan-400",
  },
  amber: {
    border: "border-amber-200 dark:border-amber-800",
    bg: "bg-amber-50 dark:bg-amber-900/10",
    text: "text-amber-600 dark:text-amber-400",
    button: "bg-amber-500 hover:bg-amber-600",
    ring: "focus:ring-amber-500",
    buttonBg: "bg-amber-500",
    buttonRing: "ring-amber-400",
  },
  indigo: {
    border: "border-indigo-200 dark:border-indigo-800",
    bg: "bg-indigo-50 dark:bg-indigo-900/10",
    text: "text-indigo-600 dark:text-indigo-400",
    button: "bg-indigo-500 hover:bg-indigo-600",
    ring: "focus:ring-indigo-500",
    buttonBg: "bg-indigo-500",
    buttonRing: "ring-indigo-400",
  },
  rose: {
    border: "border-rose-200 dark:border-rose-800",
    bg: "bg-rose-50 dark:bg-rose-900/10",
    text: "text-rose-600 dark:text-rose-400",
    button: "bg-rose-500 hover:bg-rose-600",
    ring: "focus:ring-rose-500",
    buttonBg: "bg-rose-500",
    buttonRing: "ring-rose-400",
  },
  emerald: {
    border: "border-emerald-200 dark:border-emerald-800",
    bg: "bg-emerald-50 dark:bg-emerald-900/10",
    text: "text-emerald-600 dark:text-emerald-400",
    button: "bg-emerald-500 hover:bg-emerald-600",
    ring: "focus:ring-emerald-500",
    buttonBg: "bg-emerald-500",
    buttonRing: "ring-emerald-400",
  },
} as const;

export default function Home() {
  const [cells, setCells] = useState<Cell[]>([
    {
      id: "root",
      code: "",
      output: "",
      error: null,
      parentId: null,
      executionContext: null,
      label: "Root",
      description: "",
      color: "blue",
      snapshots: [],
      currentSnapshotId: null,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [showPackages, setShowPackages] = useState(false);
  const [packageList, setPackageList] = useState<string[]>([]);
  const [collapsedBranches, setCollapsedBranches] = useState<Set<string>>(
    new Set()
  );
  const [comparison, setComparison] = useState<ComparisonState>({
    isActive: false,
    selectedCells: [],
  });
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [selectedCellForSnapshot, setSelectedCellForSnapshot] = useState<
    string | null
  >(null);

  const toggleBranch = (cellId: string) => {
    setCollapsedBranches((prev) => {
      const next = new Set(prev);
      if (next.has(cellId)) {
        next.delete(cellId);
      } else {
        next.add(cellId);
      }
      return next;
    });
  };

  const toggleComparisonMode = () => {
    setComparison((prev) => ({
      isActive: !prev.isActive,
      selectedCells: [],
    }));
  };

  const toggleCellSelection = (cellId: string) => {
    if (!comparison.isActive) return;

    setComparison((prev) => {
      const selected = new Set(prev.selectedCells);
      if (selected.has(cellId)) {
        selected.delete(cellId);
      } else if (selected.size < 2) {
        selected.add(cellId);
      }
      return {
        ...prev,
        selectedCells: Array.from(selected),
      };
    });
  };

  // Helper function to get all parent cells in order from root to the target cell
  const getParentCells = (cellId: string): Cell[] => {
    const result: Cell[] = [];
    const initialCell = cells.find((cell) => cell.id === cellId);
    if (!initialCell) return result;

    let currentCell = initialCell;
    while (true) {
      result.unshift(currentCell);
      if (!currentCell.parentId) break;
      const parentCell = cells.find((cell) => cell.id === currentCell.parentId);
      if (!parentCell) break;
      currentCell = parentCell;
    }

    return result;
  };

  const getInstalledPackages = async () => {
    if (!pyodide) return;

    try {
      const packages = await pyodide.runPythonAsync(`
import sys

# Get a list of all imported modules
modules = list(sys.modules.keys())

# Filter out built-in modules and create requirements list
requirements = []
for module in sorted(modules):
    # Skip private modules and built-ins
    if not module.startswith('_') and module not in sys.builtin_module_names:
        try:
            mod = sys.modules[module]
            version = getattr(mod, '__version__', 'latest')
            requirements.append(f"{module}=={version}")
        except:
            pass

requirements
      `);
      setPackageList(packages);
      setShowPackages(true);
    } catch (error) {
      console.error("Error getting package list:", error);
    }
  };

  useEffect(() => {
    async function initPyodide() {
      try {
        setLoading(true);
        // Load Pyodide script
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
        document.head.appendChild(script);

        script.onload = async () => {
          try {
            const pyodideInstance = await window.loadPyodide({
              indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
            });
            setPyodide(pyodideInstance);
          } catch (err) {
            console.error("Error loading Pyodide:", err);
            setCells((cells) =>
              cells.map((cell) =>
                cell.id === "root"
                  ? {
                      ...cell,
                      error: "Failed to initialize Python environment",
                    }
                  : cell
              )
            );
          } finally {
            setLoading(false);
          }
        };

        script.onerror = () => {
          setCells((cells) =>
            cells.map((cell) =>
              cell.id === "root"
                ? { ...cell, error: "Failed to load Pyodide script" }
                : cell
            )
          );
          setLoading(false);
        };
      } catch (err) {
        setCells((cells) =>
          cells.map((cell) =>
            cell.id === "root"
              ? { ...cell, error: "Failed to load Python environment" }
              : cell
          )
        );
        console.error(err);
        setLoading(false);
      }
    }
    initPyodide();

    // Cleanup
    return () => {
      const script = document.querySelector('script[src*="pyodide.js"]');
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const getRandomColor = () => {
    const colors = [
      "purple",
      "green",
      "orange",
      "pink",
      "teal",
      "cyan",
      "amber",
      "indigo",
      "rose",
      "emerald",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const forkCell = async (cellId: string) => {
    const parentCell = cells.find((cell) => cell.id === cellId);
    if (!parentCell || !pyodide) return;

    // Create two new cells with independent execution contexts
    const newCells = await Promise.all([
      // Create first branch
      (async () => {
        // Create a fresh namespace
        const namespace = pyodide.globals.get("dict")();

        // Set up basic environment
        await pyodide.runPythonAsync(
          `
import sys
from io import StringIO
        `,
          { globals: namespace }
        );

        // Load parent context if it exists
        if (parentCell.executionContext) {
          // Create a temporary namespace to hold the context
          const tempNamespace = pyodide.globals.get("dict")();
          tempNamespace.update(parentCell.executionContext);
          namespace.update(tempNamespace);
        }

        // Execute parent code in this new context
        await pyodide.runPythonAsync(parentCell.code, { globals: namespace });

        return {
          id: `${cellId}-fork1-${Date.now()}`,
          code: parentCell.code,
          output: "",
          error: null,
          parentId: cellId,
          executionContext: namespace,
          label: `Branch A from ${parentCell.label}`,
          description: "",
          color: getRandomColor(),
          snapshots: [],
          currentSnapshotId: null,
        };
      })(),
      // Create second branch with its own independent context
      (async () => {
        // Create a fresh namespace
        const namespace = pyodide.globals.get("dict")();

        // Set up basic environment
        await pyodide.runPythonAsync(
          `
import sys
from io import StringIO
        `,
          { globals: namespace }
        );

        // Load parent context if it exists
        if (parentCell.executionContext) {
          // Create a temporary namespace to hold the context
          const tempNamespace = pyodide.globals.get("dict")();
          tempNamespace.update(parentCell.executionContext);
          namespace.update(tempNamespace);
        }

        // Execute parent code in this new context
        await pyodide.runPythonAsync(parentCell.code, { globals: namespace });

        return {
          id: `${cellId}-fork2-${Date.now()}`,
          code: parentCell.code,
          output: "",
          error: null,
          parentId: cellId,
          executionContext: namespace,
          label: `Branch B from ${parentCell.label}`,
          description: "",
          color: getRandomColor(),
          snapshots: [],
          currentSnapshotId: null,
        };
      })(),
    ]);

    setCells([...cells, ...newCells]);
  };

  const runCode = async (cellId: string) => {
    if (!pyodide) return;

    const cellIndex = cells.findIndex((cell) => cell.id === cellId);
    if (cellIndex === -1) return;

    const updatedCells = [...cells];
    const cellsToRun = getParentCells(cellId);

    try {
      // Create a fresh namespace
      const namespace = pyodide.globals.get("dict")();

      // Set up basic environment
      await pyodide.runPythonAsync(
        `
import sys
from io import StringIO
        `,
        { globals: namespace }
      );

      // Helper function to extract package imports
      const extractImports = (code: string): string[] => {
        const importRegex = /^(?:from\s+(\w+)|import\s+(\w+))/gm;
        const imports: string[] = [];
        let match;
        while ((match = importRegex.exec(code)) !== null) {
          const pkg = match[1] || match[2];
          if (pkg && !["sys", "io"].includes(pkg)) {
            imports.push(pkg);
          }
        }
        return imports;
      };

      // Run all cells in order from root to target
      for (const cell of cellsToRun) {
        cell.error = null;
        cell.output = "";

        try {
          // Check for package imports and install if needed
          const imports = extractImports(cell.code);
          if (imports.length > 0) {
            try {
              // Load micropip if not already loaded
              await pyodide.loadPackage("micropip");

              // Install each package
              for (const pkg of imports) {
                try {
                  // Try importing first
                  await pyodide.runPythonAsync(`import ${pkg}`, {
                    globals: namespace,
                  });
                } catch (err) {
                  // If import fails, try installing
                  console.log(`Installing package: ${pkg}`);
                  await pyodide.runPythonAsync(
                    `
                    import micropip
                    await micropip.install('${pkg}')
                  `,
                    { globals: namespace }
                  );
                }
              }
            } catch (err: any) {
              console.error("Error installing packages:", err);
              cell.error = `Error installing packages: ${err.message}`;
              throw err;
            }
          }

          // Set up stdout capture
          await pyodide.runPythonAsync("sys.stdout = StringIO()", {
            globals: namespace,
          });

          // Run the cell's code
          await pyodide.runPythonAsync(cell.code, { globals: namespace });

          // Get the output
          const stdout = await pyodide.runPythonAsync("sys.stdout.getvalue()", {
            globals: namespace,
          });
          cell.output = stdout;

          // Save the execution context
          cell.executionContext = namespace;

          // Reset stdout
          await pyodide.runPythonAsync("sys.stdout = sys.__stdout__", {
            globals: namespace,
          });
        } catch (err: any) {
          cell.error = err.message;
          throw err; // Propagate error to stop execution of subsequent cells
        }
      }

      // Update all descendant cells recursively
      const updateDescendants = async (parentId: string) => {
        const children = updatedCells.filter((c) => c.parentId === parentId);

        for (const child of children) {
          // Create a fresh namespace for the child
          const childNamespace = pyodide.globals.get("dict")();

          // Set up basic environment
          await pyodide.runPythonAsync(
            `
import sys
from io import StringIO
            `,
            { globals: childNamespace }
          );

          // Copy parent's context
          const tempNamespace = pyodide.globals.get("dict")();
          tempNamespace.update(namespace);
          childNamespace.update(tempNamespace);

          // Run the child's code in the new context
          await pyodide.runPythonAsync("sys.stdout = StringIO()", {
            globals: childNamespace,
          });
          await pyodide.runPythonAsync(child.code, { globals: childNamespace });

          // Update child's output
          const childStdout = await pyodide.runPythonAsync(
            "sys.stdout.getvalue()",
            { globals: childNamespace }
          );
          child.output = childStdout;

          // Save child's new context
          child.executionContext = childNamespace;

          // Reset stdout
          await pyodide.runPythonAsync("sys.stdout = sys.__stdout__", {
            globals: childNamespace,
          });

          // Recursively update this child's descendants
          await updateDescendants(child.id);
        }
      };

      // Start the recursive update from this cell
      await updateDescendants(cellId);

      setCells(updatedCells);
    } catch (err: any) {
      // Error handling is now done per-cell in the loop above
      setCells(updatedCells);
    }
  };

  // Helper function to build the tree structure
  const buildTree = (cells: Cell[]): TreeNode | null => {
    const root = cells.find((cell) => !cell.parentId);
    if (!root) return null;

    const buildNode = (cell: Cell): TreeNode => {
      return {
        cell,
        children: cells
          .filter((c) => c.parentId === cell.id)
          .map((childCell) => buildNode(childCell)),
      };
    };

    return buildNode(root);
  };

  // Helper function to render a tree node and its children
  const renderTreeNode = (node: TreeNode) => {
    const { cell, children } = node;
    const isRoot = !cell.parentId;
    const isCollapsed = collapsedBranches.has(cell.id);
    const hasChildren = children.length > 0;
    const isSelected = comparison.selectedCells.includes(cell.id);

    return (
      <div key={cell.id} className="flex flex-col items-center gap-24">
        <div className="relative">
          {/* Parent connector - vertical line going up */}
          {!isRoot && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-12 w-0.5 h-12 bg-gray-200 dark:bg-gray-700" />
          )}

          {/* Child connectors */}
          {hasChildren && !isCollapsed && (
            <>
              {/* Vertical line going down */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-12 w-0.5 h-12 bg-gray-200 dark:bg-gray-700" />

              {/* Horizontal line for children */}
              {children.length > 1 && (
                <div
                  className="absolute -bottom-12 h-0.5 bg-gray-200 dark:bg-gray-700"
                  style={{
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: `${(children.length - 1) * 544 + 2}px`,
                  }}
                />
              )}
            </>
          )}

          <div
            className={`
            w-[32rem] space-y-4 border-2 rounded-lg p-4 relative
            ${
              comparison.isActive
                ? "cursor-pointer transition-transform hover:scale-[1.02]"
                : ""
            }
            ${isSelected ? "ring-2 ring-offset-2" : ""}
            ${colorMappings[cell.color as keyof typeof colorMappings].border}
            ${colorMappings[cell.color as keyof typeof colorMappings].bg}
          `}
            onClick={() => comparison.isActive && toggleCellSelection(cell.id)}
          >
            {/* Selection indicator */}
            {comparison.isActive && (
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                {isSelected ? (
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                )}
              </div>
            )}

            {/* Cell header with branch info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {hasChildren && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBranch(cell.id);
                      }}
                      className={`w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        colorMappings[cell.color as keyof typeof colorMappings]
                          .text
                      }`}
                    >
                      {isCollapsed ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </button>
                  )}
                  <input
                    type="text"
                    value={cell.label}
                    onChange={(e) => {
                      e.stopPropagation();
                      const updatedCells = cells.map((c) =>
                        c.id === cell.id ? { ...c, label: e.target.value } : c
                      );
                      setCells(updatedCells);
                    }}
                    className={`text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-2 ${
                      colorMappings[cell.color as keyof typeof colorMappings]
                        .ring
                    } rounded px-1 ${
                      colorMappings[cell.color as keyof typeof colorMappings]
                        .text
                    }`}
                    placeholder="Enter branch name..."
                  />
                  {cell.parentId && (
                    <span className="text-xs text-gray-500">
                      (from {cell.parentId})
                    </span>
                  )}
                </div>
                {hasChildren && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {children.length} branch{children.length > 1 ? "es" : ""}
                      {isCollapsed ? " (collapsed)" : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Branch description */}
              <textarea
                value={cell.description}
                onChange={(e) => {
                  e.stopPropagation();
                  const updatedCells = cells.map((c) =>
                    c.id === cell.id ? { ...c, description: e.target.value } : c
                  );
                  setCells(updatedCells);
                }}
                placeholder="Add branch description..."
                className={`w-full px-3 py-2 text-sm bg-white/50 dark:bg-gray-900/50 border ${
                  colorMappings[cell.color as keyof typeof colorMappings].border
                } rounded-lg focus:outline-none focus:ring-2 ${
                  colorMappings[cell.color as keyof typeof colorMappings].ring
                }`}
                rows={2}
              />

              {/* Color selector */}
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-xs text-gray-500">Branch color:</span>
                <div className="flex gap-1">
                  {Object.keys(colorMappings).map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        const updatedCells = cells.map((c) =>
                          c.id === cell.id ? { ...c, color } : c
                        );
                        setCells(updatedCells);
                      }}
                      className={`w-4 h-4 rounded-full ${
                        colorMappings[color as keyof typeof colorMappings]
                          .buttonBg
                      } hover:ring-2 ${cell.color === color ? "ring-2" : ""} ${
                        colorMappings[color as keyof typeof colorMappings]
                          .buttonRing
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <textarea
              value={cell.code}
              onChange={(e) => {
                e.stopPropagation();
                const updatedCells = cells.map((c) =>
                  c.id === cell.id ? { ...c, code: e.target.value } : c
                );
                setCells(updatedCells);
              }}
              className="w-full h-48 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="# Enter your Python code here"
            />

            <div
              className="flex justify-end gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setSelectedCellForSnapshot(cell.id);
                  setShowSnapshots(true);
                }}
                disabled={loading || !pyodide}
                className={`px-4 py-2 rounded-lg font-medium text-white ${
                  loading || !pyodide
                    ? "bg-gray-400 cursor-not-allowed"
                    : colorMappings[cell.color as keyof typeof colorMappings]
                        .button
                }`}
              >
                {cell.snapshots.length > 0
                  ? `Snapshots (${cell.snapshots.length})`
                  : "Create Snapshot"}
              </button>
              <button
                onClick={() => forkCell(cell.id)}
                disabled={loading || !pyodide}
                className={`px-4 py-2 rounded-lg font-medium text-white ${
                  loading || !pyodide
                    ? "bg-gray-400 cursor-not-allowed"
                    : colorMappings[cell.color as keyof typeof colorMappings]
                        .button
                }`}
              >
                Branch
              </button>

              <button
                onClick={() => runCode(cell.id)}
                disabled={loading || !pyodide}
                className={`px-4 py-2 rounded-lg font-medium text-white ${
                  loading || !pyodide
                    ? "bg-gray-400 cursor-not-allowed"
                    : colorMappings[cell.color as keyof typeof colorMappings]
                        .button
                }`}
              >
                {loading ? "Loading Python..." : "Run"}
              </button>
            </div>

            {cell.error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <pre className="text-red-600 dark:text-red-400 text-sm whitespace-pre-wrap font-mono">
                  {cell.error}
                </pre>
              </div>
            )}

            {cell.output && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h2 className="text-sm font-semibold mb-2">Output:</h2>
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {cell.output}
                </pre>
              </div>
            )}

            {/* Snapshot indicator */}
            {cell.currentSnapshotId && (
              <div className="mt-2 text-sm text-gray-500">
                Currently viewing snapshot:{" "}
                {
                  cell.snapshots.find((s) => s.id === cell.currentSnapshotId)
                    ?.label
                }
                <button
                  onClick={() => {
                    const updatedCells = cells.map((c) =>
                      c.id === cell.id ? { ...c, currentSnapshotId: null } : c
                    );
                    setCells(updatedCells);
                  }}
                  className="ml-2 text-blue-500 hover:text-blue-600"
                >
                  Return to Current
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Render children */}
        {hasChildren && !isCollapsed && (
          <div className="flex justify-center gap-8">
            {children.map((child) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  // Function to compute diff between two strings
  const computeDiff = (
    str1: string,
    str2: string
  ): { added: string[]; removed: string[]; unchanged: string[] } => {
    const lines1 = str1.split("\n");
    const lines2 = str2.split("\n");
    const added: string[] = [];
    const removed: string[] = [];
    const unchanged: string[] = [];

    const lcs = (a: string[], b: string[]): number[][] => {
      const m = a.length;
      const n = b.length;
      const dp: number[][] = Array(m + 1)
        .fill(0)
        .map(() => Array(n + 1).fill(0));

      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (a[i - 1] === b[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }
      }
      return dp;
    };

    const backtrack = (
      dp: number[][],
      a: string[],
      b: string[],
      i: number,
      j: number
    ) => {
      if (i === 0 || j === 0) return;

      if (a[i - 1] === b[j - 1]) {
        unchanged.unshift(a[i - 1]);
        backtrack(dp, a, b, i - 1, j - 1);
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        removed.unshift(a[i - 1]);
        backtrack(dp, a, b, i - 1, j);
      } else {
        added.unshift(b[j - 1]);
        backtrack(dp, a, b, i, j - 1);
      }
    };

    const dp = lcs(lines1, lines2);
    backtrack(dp, lines1, lines2, lines1.length, lines2.length);

    return { added, removed, unchanged };
  };

  // Function to create a snapshot of a cell
  const createSnapshot = (cellId: string, snapshotLabel: string) => {
    const cell = cells.find((c) => c.id === cellId);
    if (!cell) return;

    const snapshot: Snapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp: Date.now(),
      code: cell.code,
      output: cell.output,
      error: cell.error,
      executionContext: cell.executionContext,
      label: snapshotLabel,
      description: cell.description,
      color: cell.color,
    };

    const updatedCells = cells.map((c) =>
      c.id === cellId ? { ...c, snapshots: [...c.snapshots, snapshot] } : c
    );
    setCells(updatedCells);
  };

  // Function to restore a snapshot
  const restoreSnapshot = (cellId: string, snapshotId: string) => {
    const cell = cells.find((c) => c.id === cellId);
    if (!cell) return;

    const snapshot = cell.snapshots.find((s) => s.id === snapshotId);
    if (!snapshot) return;

    const updatedCells = cells.map((c) =>
      c.id === cellId
        ? {
            ...c,
            code: snapshot.code,
            output: snapshot.output,
            error: snapshot.error,
            executionContext: snapshot.executionContext,
            currentSnapshotId: snapshot.id,
          }
        : c
    );
    setCells(updatedCells);
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center gap-8 font-[family-name:var(--font-geist-sans)]">
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
          onClick={() => exportAndDownload(pyodide, cells)}
          disabled={loading || !pyodide}
          className={`px-4 py-2 rounded-lg font-medium text-white ${
            loading || !pyodide
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-500 hover:bg-purple-600"
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

      {/* Comparison View */}
      {comparison.isActive && comparison.selectedCells.length === 2 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[90vw] h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Branch Comparison</h2>
              <button
                onClick={toggleComparisonMode}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 flex gap-4 min-h-0">
              {comparison.selectedCells.map((cellId, index) => {
                const cell = cells.find((c) => c.id === cellId)!;
                const otherCell = cells.find(
                  (c) => c.id === comparison.selectedCells[1 - index]
                )!;
                const diff = computeDiff(cell.code, otherCell.code);

                return (
                  <div key={cellId} className="flex-1 flex flex-col min-h-0">
                    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-t-lg">
                      <h3
                        className={`font-medium ${
                          colorMappings[
                            cell.color as keyof typeof colorMappings
                          ].text
                        }`}
                      >
                        {cell.label}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {cell.description}
                      </p>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto p-4 border-x border-gray-200 dark:border-gray-700">
                      {/* Code Comparison */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Code</h4>
                        <pre className="font-mono text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                          {cell.code.split("\n").map((line, i) => {
                            const isAdded = diff.added.includes(line);
                            const isRemoved = diff.removed.includes(line);
                            return (
                              <div
                                key={i}
                                className={`${
                                  isAdded
                                    ? "bg-green-100 dark:bg-green-900/20"
                                    : isRemoved
                                    ? "bg-red-100 dark:bg-red-900/20"
                                    : ""
                                }`}
                              >
                                {line}
                              </div>
                            );
                          })}
                        </pre>
                      </div>

                      {/* Output Comparison */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Output</h4>
                        <pre className="font-mono text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                          {cell.output || "No output"}
                        </pre>
                      </div>

                      {/* Variables Comparison */}
                      {cell.executionContext && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Variables</h4>
                          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                            <pre className="font-mono text-sm whitespace-pre-wrap">
                              {JSON.stringify(cell.executionContext, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {showPackages && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Installed Packages</h2>
              <button
                onClick={() => setShowPackages(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search packages..."
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900"
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  const filteredPackages = packageList.filter((pkg) =>
                    pkg.toLowerCase().includes(searchTerm)
                  );
                  setPackageList(filteredPackages);
                }}
              />
              <div className="mt-4 space-y-1">
                {packageList.map((pkg, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded"
                  >
                    <code className="font-mono text-sm">{pkg}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Snapshots Modal */}
      {showSnapshots && selectedCellForSnapshot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Branch Snapshots</h2>
              <button
                onClick={() => {
                  setShowSnapshots(false);
                  setSelectedCellForSnapshot(null);
                }}
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
                      document.getElementById(
                        "snapshotLabel"
                      ) as HTMLInputElement
                    ).value;
                    if (label && selectedCellForSnapshot) {
                      createSnapshot(selectedCellForSnapshot, label);
                      (
                        document.getElementById(
                          "snapshotLabel"
                        ) as HTMLInputElement
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
              {cells
                .find((c) => c.id === selectedCellForSnapshot)
                ?.snapshots.map((snapshot) => (
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
                          restoreSnapshot(selectedCellForSnapshot, snapshot.id);
                          setShowSnapshots(false);
                          setSelectedCellForSnapshot(null);
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
      )}

      <div className="w-full overflow-x-auto">
        <div className="min-w-[90rem] px-8 mx-auto">
          {buildTree(cells) && renderTreeNode(buildTree(cells)!)}
        </div>
      </div>
    </div>
  );
}
