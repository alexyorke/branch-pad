"use client";

import { TreeNode } from "../app/types";
import { BranchCell } from "../app/components/BranchCell";
import { useBranchPad } from "../context/BranchPadContext";
import { colorMappings } from "../app/types";
import { useState } from "react";

interface BranchTreeProps {
  node: TreeNode;
  index?: number;
  totalSiblings?: number;
}

export function BranchTree({
  node,
  index = 0,
  totalSiblings = 1,
}: BranchTreeProps) {
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

  const [isHovered, setIsHovered] = useState(false);

  const { cell, children } = node;
  const isRoot = !cell.parentId;
  const isCollapsed = collapsedBranches.has(cell.id);
  const hasChildren = children.length > 0;
  const isSelected = comparison.selectedCells.includes(cell.id);

  // Determine if this is the first, middle, or last sibling
  const isFirstSibling = index === 0;
  const isLastSibling = index === totalSiblings - 1;
  const isMiddleSibling = !isFirstSibling && !isLastSibling;

  // Get the color for the connection lines based on the cell's color
  const getColorFromKey = (colorKey: string) => {
    // Map of color keys to actual CSS color values
    const colorMap: Record<string, string> = {
      "text-blue-600": "#2563eb",
      "text-purple-600": "#9333ea",
      "text-green-600": "#16a34a",
      "text-orange-600": "#ea580c",
      "text-pink-600": "#db2777",
      "text-teal-600": "#0d9488",
      "text-cyan-600": "#0891b2",
      "text-amber-600": "#d97706",
      "text-indigo-600": "#4f46e5",
      "text-rose-600": "#e11d48",
      "text-emerald-600": "#059669",
    };

    // Default color if not found
    return colorMap[colorKey] || "#94a3b8";
  };

  const connectionColorKey =
    colorMappings[cell.color as keyof typeof colorMappings].text.split(" ")[0];
  const connectionColor = getColorFromKey(connectionColorKey);

  return (
    <div
      className="flex flex-col items-center gap-28"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Parent connector - vertical line going up */}
        {!isRoot && (
          <>
            <div
              className={`absolute left-1/2 -translate-x-1/2 -top-14 w-1 h-14 transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-70"
              }`}
              style={{
                background: `linear-gradient(to top, ${connectionColor}90, rgba(226, 232, 240, 0.4))`,
                zIndex: 1,
              }}
            />

            {/* Sibling connector dots */}
            {totalSiblings > 1 && (
              <div
                className={`absolute -top-14 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ring-1 ring-background shadow-sm transition-all duration-300 ${
                  isHovered ? "animate-pulse" : ""
                }`}
                style={{
                  backgroundColor: connectionColor,
                  boxShadow: isHovered
                    ? `0 0 8px ${connectionColor}80`
                    : "none",
                  zIndex: 2,
                  marginTop: "-2px",
                }}
              />
            )}
          </>
        )}

        {/* Child connectors */}
        {hasChildren && !isCollapsed && (
          <>
            {/* Vertical line going down with dot */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 -bottom-14 w-1 h-14 transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-70"
              }`}
              style={{
                background: `linear-gradient(to bottom, ${connectionColor}90, rgba(226, 232, 240, 0.4))`,
                zIndex: 1,
              }}
            />

            <div
              className={`absolute -bottom-14 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ring-1 ring-background shadow-sm transition-all duration-300 ${
                isHovered ? "animate-pulse" : ""
              }`}
              style={{
                backgroundColor: connectionColor,
                boxShadow: isHovered ? `0 0 8px ${connectionColor}80` : "none",
                zIndex: 2,
                marginBottom: "-2px",
              }}
            />

            {/* Horizontal line for children */}
            {children.length > 1 && (
              <>
                {/* Horizontal connector line */}
                <div
                  className={`absolute -bottom-14 h-1 transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "opacity-50"
                  }`}
                  style={{
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: `${(children.length - 1) * 544 + 2}px`,
                    zIndex: 1,
                    background: `linear-gradient(to right, ${connectionColor}40, ${connectionColor}60, ${connectionColor}40)`,
                  }}
                />

                {/* Add dots at each child connection point */}
                {children.map((child, childIndex) => {
                  const isFirstChild = childIndex === 0;
                  const isLastChild = childIndex === children.length - 1;

                  // Skip the middle dot as it's already added above
                  if (childIndex === 0 && children.length === 2) return null;
                  if (!isFirstChild && !isLastChild) return null;

                  const leftPosition = isFirstChild
                    ? `calc(50% - ${(children.length - 1) * 272}px)`
                    : `calc(50% + ${(children.length - 1) * 272}px)`;

                  // Get the color for the child's connection
                  const childColorKey =
                    colorMappings[
                      child.cell.color as keyof typeof colorMappings
                    ].text.split(" ")[0];
                  const childColor = getColorFromKey(childColorKey);

                  return (
                    <div
                      key={childIndex}
                      className={`absolute -bottom-14 w-4 h-4 rounded-full ring-1 ring-background shadow-sm transition-all duration-300 ${
                        isHovered ? "animate-pulse" : ""
                      }`}
                      style={{
                        left: leftPosition,
                        transform: "translateX(-50%)",
                        backgroundColor: childColor,
                        boxShadow: isHovered
                          ? `0 0 8px ${childColor}80`
                          : "none",
                        zIndex: 2,
                        marginBottom: "-2px",
                      }}
                    />
                  );
                })}
              </>
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
          {children.map((child, childIndex) => (
            <BranchTree
              key={child.cell.id}
              node={child}
              index={childIndex}
              totalSiblings={children.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
