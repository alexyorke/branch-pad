"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Cell, TreeNode, Parameter } from "../app/types";
import JSZip from "jszip";

interface BranchPadContextType {
  cells: Cell[];
  setCells: React.Dispatch<React.SetStateAction<Cell[]>>;
  loading: boolean;
  pyodide: any;
  collapsedBranches: Set<string>;
  setCollapsedBranches: React.Dispatch<React.SetStateAction<Set<string>>>;
  comparison: {
    isActive: boolean;
    selectedCells: string[];
  };
  setComparison: React.Dispatch<
    React.SetStateAction<{
      isActive: boolean;
      selectedCells: string[];
    }>
  >;
  showPackages: boolean;
  setShowPackages: React.Dispatch<React.SetStateAction<boolean>>;
  packageList: string[];
  setPackageList: React.Dispatch<React.SetStateAction<string[]>>;
  showSnapshots: boolean;
  setShowSnapshots: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCellForSnapshot: string | null;
  setSelectedCellForSnapshot: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  showExport: boolean;
  setShowExport: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCellForExport: string | null;
  setSelectedCellForExport: React.Dispatch<React.SetStateAction<string | null>>;
  showParameterSweep: boolean;
  setShowParameterSweep: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCellForParameterSweep: string | null;
  setSelectedCellForParameterSweep: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  cellPositions: Record<string, { x: number; y: number }>;
  setCellPositions: React.Dispatch<
    React.SetStateAction<Record<string, { x: number; y: number }>>
  >;
  toggleBranch: (cellId: string) => void;
  toggleComparisonMode: () => void;
  toggleCellSelection: (cellId: string) => void;
  getParentCells: (cellId: string) => Cell[];
  getInstalledPackages: () => Promise<void>;
  forkCell: (cellId: string) => Promise<void>;
  runCode: (cellId: string) => Promise<void>;
  buildTree: (cells: Cell[]) => TreeNode | null;
  createSnapshot: (cellId: string, snapshotLabel: string) => void;
  restoreSnapshot: (cellId: string, snapshotId: string) => void;
  getRequiredPackages: (cellId: string) => Promise<string[]>;
  generateDeploymentFiles: (cellId: string) => Promise<void>;
  getRandomColor: () => string;
  runParameterSweep: (cellId: string, parameters: Parameter[]) => Promise<void>;
}

const BranchPadContext = createContext<BranchPadContextType | undefined>(
  undefined
);

export function BranchPadProvider({ children }: { children: ReactNode }) {
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
  const [cellPositions, setCellPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});

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
    const sweep = {
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

  const value = {
    cells,
    setCells,
    loading,
    pyodide,
    collapsedBranches,
    setCollapsedBranches,
    comparison,
    setComparison,
    showPackages,
    setShowPackages,
    packageList,
    setPackageList,
    showSnapshots,
    setShowSnapshots,
    selectedCellForSnapshot,
    setSelectedCellForSnapshot,
    showExport,
    setShowExport,
    selectedCellForExport,
    setSelectedCellForExport,
    showParameterSweep,
    setShowParameterSweep,
    selectedCellForParameterSweep,
    setSelectedCellForParameterSweep,
    cellPositions,
    setCellPositions,
    toggleBranch,
    toggleComparisonMode,
    toggleCellSelection,
    getParentCells,
    getInstalledPackages,
    forkCell,
    runCode,
    buildTree,
    createSnapshot,
    restoreSnapshot,
    getRequiredPackages,
    generateDeploymentFiles,
    getRandomColor,
    runParameterSweep,
  };

  return (
    <BranchPadContext.Provider value={value}>
      {children}
    </BranchPadContext.Provider>
  );
}

export function useBranchPad() {
  const context = useContext(BranchPadContext);
  if (context === undefined) {
    throw new Error("useBranchPad must be used within a BranchPadProvider");
  }
  return context;
}
