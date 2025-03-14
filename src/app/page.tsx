"use client";

import { useState, useEffect } from "react";
import { exportAndDownload } from "../utils/export";

declare global {
  interface Window {
    loadPyodide: any;
  }
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
}

interface TreeNode {
  cell: Cell;
  children: TreeNode[];
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
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [showPackages, setShowPackages] = useState(false);
  const [packageList, setPackageList] = useState<string[]>([]);

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

    return (
      <div key={cell.id} className="flex flex-col items-center gap-24">
        <div className="relative">
          {/* Parent connector - vertical line going up */}
          {!isRoot && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-12 w-0.5 h-12 bg-gray-200 dark:bg-gray-700" />
          )}

          {/* Child connectors */}
          {children.length > 0 && (
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
            w-[32rem] space-y-4 border-2 rounded-lg p-4
            ${colorMappings[cell.color as keyof typeof colorMappings].border}
          `}
          >
            {/* Cell header with branch info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={cell.label}
                    onChange={(e) => {
                      const updatedCells = cells.map((c) =>
                        c.id === cell.id ? { ...c, label: e.target.value } : c
                      );
                      setCells(updatedCells);
                    }}
                    className={`text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-${
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
                {children.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {children.length} branch{children.length > 1 ? "es" : ""}
                  </span>
                )}
              </div>

              {/* Branch description */}
              <textarea
                value={cell.description}
                onChange={(e) => {
                  const updatedCells = cells.map((c) =>
                    c.id === cell.id ? { ...c, description: e.target.value } : c
                  );
                  setCells(updatedCells);
                }}
                placeholder="Add branch description..."
                className={`w-full px-3 py-2 text-sm bg-white/50 dark:bg-gray-900/50 border border-${
                  colorMappings[cell.color as keyof typeof colorMappings].border
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-${
                  colorMappings[cell.color as keyof typeof colorMappings].ring
                }`}
                rows={2}
              />

              {/* Color selector */}
              <div className="flex items-center gap-2">
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
                const updatedCells = cells.map((c) =>
                  c.id === cell.id ? { ...c, code: e.target.value } : c
                );
                setCells(updatedCells);
              }}
              className="w-full h-48 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="# Enter your Python code here"
            />

            <div className="flex justify-end gap-2">
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
          </div>
        </div>

        {/* Render children */}
        {children.length > 0 && (
          <div className="flex justify-center gap-8">
            {children.map((child) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center gap-8 font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-center">BranchPad</h1>
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

      <div className="w-full overflow-x-auto">
        <div className="min-w-[90rem] px-8 mx-auto">
          {buildTree(cells) && renderTreeNode(buildTree(cells)!)}
        </div>
      </div>
    </div>
  );
}
