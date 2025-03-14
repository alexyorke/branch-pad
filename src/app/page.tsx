"use client";

import { useState, useEffect } from "react";
import { exportAndDownload } from "../utils/export";
import JSZip from "jszip";
import { Cell, TreeNode, Parameter, ParameterSweep } from "./types";
import { ComparisonModal } from "./components/ComparisonModal";
import { PackagesModal } from "./components/PackagesModal";
import { SnapshotsModal } from "./components/SnapshotsModal";
import { ExportModal } from "./components/ExportModal";
import { BranchCell } from "./components/BranchCell";
import { ParameterSweepModal } from "./components/ParameterSweepModal";

declare global {
  interface Window {
    loadPyodide: any;
  }
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
      label: "Root",
      description: "",
      color: "blue",
      snapshots: [],
      currentSnapshotId: null,
      parameters: [],
      parameterSweeps: [],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [showPackages, setShowPackages] = useState(false);
  const [packageList, setPackageList] = useState<string[]>([]);
  const [collapsedBranches, setCollapsedBranches] = useState<Set<string>>(
    new Set()
  );
  const [comparison, setComparison] = useState<{
    isActive: boolean;
    selectedCells: string[];
  }>({
    isActive: false,
    selectedCells: [],
  });
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [selectedCellForSnapshot, setSelectedCellForSnapshot] = useState<
    string | null
  >(null);
  const [showExport, setShowExport] = useState(false);
  const [selectedCellForExport, setSelectedCellForExport] = useState<
    string | null
  >(null);
  const [showParameterSweep, setShowParameterSweep] = useState(false);
  const [selectedCellForParameterSweep, setSelectedCellForParameterSweep] =
    useState<string | null>(null);

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
          parameters: [...parentCell.parameters],
          parameterSweeps: [],
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
          parameters: [...parentCell.parameters],
          parameterSweeps: [],
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

          <BranchCell
            cell={cell}
            isRoot={isRoot}
            hasChildren={hasChildren}
            childrenCount={children.length}
            isCollapsed={isCollapsed}
            isSelected={isSelected}
            isComparisonMode={comparison.isActive}
            loading={loading}
            pyodide={pyodide}
            onToggleBranch={toggleBranch}
            onLabelChange={(cellId, label) => {
              const updatedCells = cells.map((c) =>
                c.id === cellId ? { ...c, label } : c
              );
              setCells(updatedCells);
            }}
            onDescriptionChange={(cellId, description) => {
              const updatedCells = cells.map((c) =>
                c.id === cellId ? { ...c, description } : c
              );
              setCells(updatedCells);
            }}
            onColorChange={(cellId, color) => {
              const updatedCells = cells.map((c) =>
                c.id === cellId ? { ...c, color } : c
              );
              setCells(updatedCells);
            }}
            onCodeChange={(cellId, code) => {
              const updatedCells = cells.map((c) =>
                c.id === cellId ? { ...c, code } : c
              );
              setCells(updatedCells);
            }}
            onShowSnapshots={(cellId) => {
              setSelectedCellForSnapshot(cellId);
              setShowSnapshots(true);
            }}
            onForkCell={forkCell}
            onRunCode={runCode}
            onCellSelect={toggleCellSelection}
            onShowParameterSweep={(cellId) => {
              setSelectedCellForParameterSweep(cellId);
              setShowParameterSweep(true);
            }}
          />
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

  // Function to create a snapshot of a cell
  const createSnapshot = (cellId: string, snapshotLabel: string) => {
    const cell = cells.find((c) => c.id === cellId);
    if (!cell) return;

    const snapshot = {
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

  // Function to get all required packages for a cell and its parents
  const getRequiredPackages = async (cellId: string): Promise<string[]> => {
    if (!pyodide) return [];

    const cellsToCheck = getParentCells(cellId);
    const packages = new Set<string>();

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

    // Get all imports from all cells in the chain
    for (const cell of cellsToCheck) {
      const imports = extractImports(cell.code);
      imports.forEach((pkg) => packages.add(pkg));
    }

    return Array.from(packages);
  };

  // Function to generate deployment files
  const generateDeploymentFiles = async (cellId: string) => {
    const cell = cells.find((c) => c.id === cellId);
    if (!cell) return;

    // Get all cells in the chain from root to this cell
    const cellChain = getParentCells(cellId);

    // Combine all code
    const combinedCode = cellChain.map((c) => c.code).join("\n\n");

    // Get required packages
    const packages = await getRequiredPackages(cellId);

    // Generate requirements.txt
    const requirementsContent = packages
      .map((pkg) => `${pkg}==latest`)
      .join("\n");

    // Generate Python script
    const scriptContent = `#!/usr/bin/env python3
"""
Generated from BranchPad
Branch: ${cell.label}
Description: ${cell.description}
"""

import sys
from io import StringIO

${combinedCode}
`;

    // Generate Dockerfile
    const dockerfileContent = `FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the script
COPY script.py .

# Run the script
CMD ["python", "script.py"]
`;

    // Create a zip file containing all the files
    const zip = new JSZip();
    zip.file("script.py", scriptContent);
    zip.file("requirements.txt", requirementsContent);
    zip.file("Dockerfile", dockerfileContent);

    // Generate README
    const readmeContent = `# ${cell.label} - BranchPad Export

${cell.description}

## Files
- \`script.py\`: The main Python script
- \`requirements.txt\`: Python package dependencies
- \`Dockerfile\`: Container configuration

## Running Locally
1. Install dependencies:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`

2. Run the script:
   \`\`\`
   python script.py
   \`\`\`

## Running with Docker
1. Build the container:
   \`\`\`
   docker build -t branchpad-${cell.id} .
   \`\`\`

2. Run the container:
   \`\`\`
   docker run branchpad-${cell.id}
   \`\`\`
`;
    zip.file("README.md", readmeContent);

    // Download the zip file
    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cell.label.toLowerCase().replace(/\s+/g, "-")}-export.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    setShowExport(false);
    setSelectedCellForExport(null);
  };

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

  const runParameterSweep = async (cellId: string, parameters: Parameter[]) => {
    if (!pyodide) return;

    const cell = cells.find((c) => c.id === cellId);
    if (!cell) return;

    // Generate all parameter combinations
    const generateCombinations = (
      parameters: Parameter[]
    ): Record<string, any>[] => {
      const combinations: Record<string, any>[] = [];

      const generateCombination = (
        current: Record<string, any>,
        remainingParams: Parameter[]
      ) => {
        if (remainingParams.length === 0) {
          combinations.push(current);
          return;
        }

        const param = remainingParams[0];
        const rest = remainingParams.slice(1);

        if (param.type === "number" && param.range) {
          const { min = 0, max = 0, step = 1 } = param.range;
          for (let value = min; value <= max; value += step) {
            generateCombination({ ...current, [param.name]: value }, rest);
          }
        } else if (param.options) {
          for (const value of param.options) {
            generateCombination({ ...current, [param.name]: value }, rest);
          }
        } else {
          generateCombination({ ...current, [param.name]: param.value }, rest);
        }
      };

      generateCombination({}, parameters);
      return combinations;
    };

    const parameterCombinations = generateCombinations(parameters);
    const results = [];

    // Run code for each parameter combination
    for (const params of parameterCombinations) {
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

        // Set up parameter variables
        for (const [name, value] of Object.entries(params)) {
          await pyodide.runPythonAsync(`${name} = ${JSON.stringify(value)}`, {
            globals: namespace,
          });
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

        results.push({
          parameters: params,
          output: stdout,
          error: null,
        });

        // Reset stdout
        await pyodide.runPythonAsync("sys.stdout = sys.__stdout__", {
          globals: namespace,
        });
      } catch (err: any) {
        results.push({
          parameters: params,
          output: "",
          error: err.message,
        });
      }
    }

    // Create a new parameter sweep
    const sweep: ParameterSweep = {
      id: `sweep-${Date.now()}`,
      parameters,
      results,
    };

    // Update the cell with the new sweep
    const updatedCells = cells.map((c) =>
      c.id === cellId
        ? {
            ...c,
            parameters,
            parameterSweeps: [...c.parameterSweeps, sweep],
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

      {/* Comparison Modal */}
      {comparison.isActive && comparison.selectedCells.length === 2 && (
        <ComparisonModal
          selectedCells={comparison.selectedCells}
          cells={cells}
          onClose={toggleComparisonMode}
        />
      )}

      {/* Package Modal */}
      {showPackages && (
        <PackagesModal
          packageList={packageList}
          onClose={() => setShowPackages(false)}
        />
      )}

      {/* Snapshots Modal */}
      {showSnapshots && selectedCellForSnapshot && (
        <SnapshotsModal
          selectedCellId={selectedCellForSnapshot}
          cells={cells}
          onClose={() => {
            setShowSnapshots(false);
            setSelectedCellForSnapshot(null);
          }}
          onCreateSnapshot={createSnapshot}
          onRestoreSnapshot={restoreSnapshot}
        />
      )}

      {/* Export Modal */}
      {showExport && (
        <ExportModal
          cells={cells}
          onClose={() => {
            setShowExport(false);
            setSelectedCellForExport(null);
          }}
          onExport={generateDeploymentFiles}
        />
      )}

      {/* Parameter Sweep Modal */}
      {showParameterSweep && selectedCellForParameterSweep && (
        <ParameterSweepModal
          cell={cells.find((c) => c.id === selectedCellForParameterSweep)!}
          onClose={() => {
            setShowParameterSweep(false);
            setSelectedCellForParameterSweep(null);
          }}
          onRunParameterSweep={runParameterSweep}
        />
      )}

      <div className="w-full overflow-x-auto">
        <div className="min-w-[90rem] px-8 mx-auto">
          {buildTree(cells) && (
            <BranchCell
              cell={buildTree(cells)!.cell}
              isRoot={!buildTree(cells)!.cell.parentId}
              hasChildren={buildTree(cells)!.children.length > 0}
              childrenCount={buildTree(cells)!.children.length}
              isCollapsed={collapsedBranches.has(buildTree(cells)!.cell.id)}
              isSelected={comparison.selectedCells.includes(
                buildTree(cells)!.cell.id
              )}
              isComparisonMode={comparison.isActive}
              loading={loading}
              pyodide={pyodide}
              onToggleBranch={toggleBranch}
              onLabelChange={(cellId, label) => {
                const updatedCells = cells.map((c) =>
                  c.id === cellId ? { ...c, label } : c
                );
                setCells(updatedCells);
              }}
              onDescriptionChange={(cellId, description) => {
                const updatedCells = cells.map((c) =>
                  c.id === cellId ? { ...c, description } : c
                );
                setCells(updatedCells);
              }}
              onColorChange={(cellId, color) => {
                const updatedCells = cells.map((c) =>
                  c.id === cellId ? { ...c, color } : c
                );
                setCells(updatedCells);
              }}
              onCodeChange={(cellId, code) => {
                const updatedCells = cells.map((c) =>
                  c.id === cellId ? { ...c, code } : c
                );
                setCells(updatedCells);
              }}
              onShowSnapshots={(cellId) => {
                setSelectedCellForSnapshot(cellId);
                setShowSnapshots(true);
              }}
              onForkCell={forkCell}
              onRunCode={runCode}
              onCellSelect={toggleCellSelection}
              onShowParameterSweep={(cellId) => {
                setSelectedCellForParameterSweep(cellId);
                setShowParameterSweep(true);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
