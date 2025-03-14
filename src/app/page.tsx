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
}

interface TreeNode {
  cell: Cell;
  children: TreeNode[];
}

export default function Home() {
  const [cells, setCells] = useState<Cell[]>([
    {
      id: "root",
      code: "",
      output: "",
      error: null,
      parentId: null,
      executionContext: null,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);

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
            ${
              isRoot
                ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10"
                : "border-gray-200 dark:border-gray-700"
            }
          `}
          >
            {/* Cell header with branch count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    isRoot
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {isRoot ? "Root" : "Branch"}
                </span>
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
                    : "bg-green-500 hover:bg-green-600"
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
                    : "bg-blue-500 hover:bg-blue-600"
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
      </div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[90rem] px-8 mx-auto">
          {buildTree(cells) && renderTreeNode(buildTree(cells)!)}
        </div>
      </div>
    </div>
  );
}
