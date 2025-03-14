"use client";

import { useState, useEffect } from "react";
import { useBranchPad } from "../context/BranchPadContext";
import { DraggableCell } from "./DraggableCell";
import { ZoomableCanvas } from "./ZoomableCanvas";
import { Cell, TreeNode } from "../app/types";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface CellPosition {
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
  color: string;
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
}

export function DraggableBranchCanvas() {
  const {
    cells,
    collapsedBranches,
    comparison,
    buildTree,
    cellPositions,
    setCellPositions,
    deleteCell,
  } = useBranchPad();

  const [connections, setConnections] = useState<Connection[]>([]);
  const [cellToDelete, setCellToDelete] = useState<Cell | null>(null);

  // Initialize positions for new cells
  useEffect(() => {
    const newPositions = { ...cellPositions };
    let hasNewCells = false;

    cells.forEach((cell) => {
      if (!cellPositions[cell.id]) {
        if (!cell.parentId) {
          newPositions[cell.id] = { x: 0, y: 0 };
          hasNewCells = true;
        } else if (cellPositions[cell.parentId]) {
          const siblings = cells.filter((c) => c.parentId === cell.parentId);
          const siblingIndex = siblings.findIndex((c) => c.id === cell.id);
          const parentPos = cellPositions[cell.parentId];
          const xOffset =
            siblingIndex * 550 - ((siblings.length - 1) * 550) / 2;

          newPositions[cell.id] = {
            x: parentPos.x + xOffset,
            y: parentPos.y + 500, // Increase vertical spacing between cells
          };
          hasNewCells = true;
        }
      }
    });

    if (hasNewCells) {
      setCellPositions(newPositions);
    }
  }, [cells, cellPositions, setCellPositions]);

  // Update connections between cells
  useEffect(() => {
    const newConnections: Connection[] = [];
    const CELL_WIDTH = 512; // Width of a cell
    const CELL_HEIGHT = 420; // Total height including all content, buttons, and padding
    const TOP_OFFSET = 4; // Offset for the top dot
    const BOTTOM_OFFSET = 16; // Offset for the bottom dot

    cells.forEach((cell) => {
      if (
        cell.parentId &&
        cellPositions[cell.id] &&
        cellPositions[cell.parentId]
      ) {
        const fromPos = cellPositions[cell.parentId];
        const toPos = cellPositions[cell.id];

        // Calculate connection points
        const connection: Connection = {
          from: cell.parentId,
          to: cell.id,
          color: (cell.color ?? "blue") as string,
          fromPos: {
            x: fromPos.x + CELL_WIDTH / 2,
            y: fromPos.y + CELL_HEIGHT + BOTTOM_OFFSET, // Add offset for bottom dot
          },
          toPos: {
            x: toPos.x + CELL_WIDTH / 2,
            y: toPos.y + TOP_OFFSET, // Add offset for top dot
          },
        };

        newConnections.push(connection);
      }
    });

    setConnections(newConnections);
  }, [cells, cellPositions]);

  // Handle position changes for cells
  const handlePositionChange = (
    cellId: string,
    position: { x: number; y: number }
  ) => {
    setCellPositions((prev) => ({
      ...prev,
      [cellId]: position,
    }));
  };

  // Function to get descendant count
  const getDescendantCount = (cellId: string): number => {
    return cells.filter((c) => {
      let currentParentId = c.parentId;
      while (currentParentId) {
        if (currentParentId === cellId) return true;
        const parent = cells.find((p) => p.id === currentParentId);
        if (!parent) break;
        currentParentId = parent.parentId;
      }
      return false;
    }).length;
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (cellToDelete) {
      deleteCell(cellToDelete.id);
      setCellToDelete(null);
    }
  };

  // Render connections between cells
  const renderConnections = () => {
    return connections.map(({ from, to, color, fromPos, toPos }) => {
      if (collapsedBranches.has(from)) return null;

      // Calculate control points for the curve
      const deltaY = toPos.y - fromPos.y;
      const midY1 = fromPos.y + deltaY * 0.2; // Adjusted for smoother curve
      const midY2 = toPos.y - deltaY * 0.2; // Adjusted for smoother curve

      // Use cubic bezier with adjusted control points for a more vertical curve
      const path = `M${fromPos.x},${fromPos.y} C${fromPos.x},${midY1} ${toPos.x},${midY2} ${toPos.x},${toPos.y}`;

      // Get color based on the cell's color
      const colorMap: Record<string, string> = {
        blue: "#2563eb",
        purple: "#9333ea",
        green: "#16a34a",
        orange: "#ea580c",
        pink: "#db2777",
        teal: "#0d9488",
        cyan: "#0891b2",
        amber: "#d97706",
        indigo: "#4f46e5",
        rose: "#e11d48",
        emerald: "#059669",
      };

      const connectionColor = colorMap[color] || "#94a3b8";

      return (
        <svg
          key={`${from}-${to}`}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 5 }}
        >
          {/* Draw path first so it appears under the dots */}
          <path
            d={path}
            fill="none"
            stroke={connectionColor}
            strokeWidth="2"
            strokeOpacity="0.7"
            strokeDasharray={collapsedBranches.has(from) ? "5,5" : "none"}
          />
          {/* Connection dots with subtle shadow for depth */}
          <circle
            cx={fromPos.x}
            cy={fromPos.y}
            r="4"
            fill={connectionColor}
            fillOpacity="0.8"
            filter="drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
          />
          <circle
            cx={toPos.x}
            cy={toPos.y}
            r="4"
            fill={connectionColor}
            fillOpacity="0.8"
            filter="drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
          />
        </svg>
      );
    });
  };

  return (
    <div className="w-full h-[calc(100vh-8rem)] relative">
      <ZoomableCanvas>
        <div
          className="relative"
          style={{
            width: "100%",
            height: "100%",
            minWidth: "5000px",
            minHeight: "3000px",
          }}
        >
          {/* Render connections */}
          {renderConnections()}

          {/* Render cells */}
          {cells.map((cell) => {
            const position = cellPositions[cell.id] || { x: 0, y: 0 };
            const isRoot = !cell.parentId;
            const hasChildren = cells.some((c) => c.parentId === cell.id);
            const childrenCount = cells.filter(
              (c) => c.parentId === cell.id
            ).length;
            const isCollapsed = collapsedBranches.has(cell.id);
            const isSelected = comparison.selectedCells.includes(cell.id);

            // Skip rendering children of collapsed branches
            if (cell.parentId) {
              let currentParentId = cell.parentId;
              let shouldRender = true;

              while (currentParentId) {
                if (collapsedBranches.has(currentParentId)) {
                  shouldRender = false;
                  break;
                }
                const parent = cells.find((c) => c.id === currentParentId);
                if (!parent) break;
                currentParentId = parent.parentId;
              }

              if (!shouldRender) return null;
            }

            return (
              <DraggableCell
                key={cell.id}
                cell={cell}
                isRoot={isRoot}
                hasChildren={hasChildren}
                childrenCount={childrenCount}
                isCollapsed={isCollapsed}
                isSelected={isSelected}
                position={position}
                onPositionChange={handlePositionChange}
                onDelete={() => setCellToDelete(cell)}
              />
            );
          })}
        </div>
      </ZoomableCanvas>

      {/* Delete confirmation dialog */}
      {cellToDelete && (
        <DeleteConfirmDialog
          cell={cellToDelete}
          descendantCount={getDescendantCount(cellToDelete.id)}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setCellToDelete(null)}
        />
      )}
    </div>
  );
}
