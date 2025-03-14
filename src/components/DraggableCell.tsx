"use client";

import { useState, useRef, useEffect } from "react";
import { BranchCell } from "../app/components/BranchCell";
import { Cell } from "../app/types";
import { useBranchPad } from "../context/BranchPadContext";

interface DraggableCellProps {
  cell: Cell;
  isRoot: boolean;
  hasChildren: boolean;
  childrenCount: number;
  isCollapsed: boolean;
  isSelected: boolean;
  position: { x: number; y: number };
  onPositionChange: (
    cellId: string,
    position: { x: number; y: number }
  ) => void;
}

export function DraggableCell({
  cell,
  isRoot,
  hasChildren,
  childrenCount,
  isCollapsed,
  isSelected,
  position,
  onPositionChange,
}: DraggableCellProps) {
  const {
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

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cellRef = useRef<HTMLDivElement>(null);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging when holding the header area
    if ((e.target as HTMLElement).closest(".cell-drag-handle")) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    onPositionChange(cell.id, {
      x: position.x + dx,
      y: position.y + dy,
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        onPositionChange(cell.id, {
          x: position.x + dx,
          y: position.y + dy,
        });

        setDragStart({ x: e.clientX, y: e.clientY });
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove);
        window.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStart, position, cell.id, onPositionChange]);

  return (
    <div
      ref={cellRef}
      className={`absolute ${isDragging ? "z-50" : "z-10"}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? "none" : "transform 0.2s ease-out",
        cursor: isDragging ? "grabbing" : "default",
        transform: isDragging ? "scale(1.02)" : "scale(1)",
        opacity: isDragging ? "0.95" : "1",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="relative">
        {/* Drag handle - subtle design */}
        <div
          className="cell-drag-handle absolute -top-2 left-0 right-0 flex flex-col items-center group z-20"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {/* Subtle pill shape that expands on hover */}
          <div className="h-1 w-20 bg-secondary-foreground/20 rounded-full group-hover:w-32 group-hover:bg-secondary-foreground/30 transition-all duration-200 ease-out" />

          {/* Additional visual feedback on hover */}
          <div className="h-8 w-full bg-gradient-to-b from-secondary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

          {/* Drag indicator line when dragging */}
          {isDragging && (
            <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-primary/50 animate-pulse" />
          )}
        </div>

        <BranchCell
          cell={cell}
          isRoot={isRoot}
          hasChildren={hasChildren}
          childrenCount={childrenCount}
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
    </div>
  );
}
