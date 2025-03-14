"use client";

import { TreeNode } from "../app/types";
import { BranchCell } from "../app/components/BranchCell";
import { useBranchPad } from "../context/BranchPadContext";

interface BranchTreeProps {
  node: TreeNode;
}

export function BranchTree({ node }: BranchTreeProps) {
  const {
    collapsedBranches,
    comparison,
    toggleBranch,
    toggleCellSelection,
    cells,
    setCells,
    loading,
    pyodide,
    forkCell,
    runCode,
    setSelectedCellForSnapshot,
    setShowSnapshots,
    setSelectedCellForParameterSweep,
    setShowParameterSweep,
  } = useBranchPad();

  const { cell, children } = node;
  const isRoot = !cell.parentId;
  const isCollapsed = collapsedBranches.has(cell.id);
  const hasChildren = children.length > 0;
  const isSelected = comparison.selectedCells.includes(cell.id);

  return (
    <div className="flex flex-col items-center gap-24">
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
          {children.map((child) => (
            <BranchTree key={child.cell.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}
