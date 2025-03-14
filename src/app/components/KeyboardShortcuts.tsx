"use client";

import { useEffect } from "react";
import { Cell } from "../types";

interface KeyboardShortcutsProps {
  cells: Cell[];
  activeCellId: string | null;
  onRunCell: (cellId: string) => void;
  onForkCell: (cellId: string) => void;
  onNavigateCell: (direction: "up" | "down" | "left" | "right") => void;
  onToggleBranch: (cellId: string) => void;
  onToggleParameterSweep: (cellId: string) => void;
  onToggleSnapshots: (cellId: string) => void;
}

export function KeyboardShortcuts({
  cells,
  activeCellId,
  onRunCell,
  onForkCell,
  onNavigateCell,
  onToggleBranch,
  onToggleParameterSweep,
  onToggleSnapshots,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Only handle shortcuts if we have an active cell
      if (!activeCellId) return;

      // Don't trigger shortcuts if user is typing in an input or textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Run cell: Shift + Enter
      if (event.shiftKey && event.key === "Enter") {
        event.preventDefault();
        onRunCell(activeCellId);
      }

      // Fork cell: Ctrl + D
      if (event.ctrlKey && event.key === "d") {
        event.preventDefault();
        onForkCell(activeCellId);
      }

      // Navigation: Alt + Arrow keys
      if (event.altKey) {
        switch (event.key) {
          case "ArrowUp":
            event.preventDefault();
            onNavigateCell("up");
            break;
          case "ArrowDown":
            event.preventDefault();
            onNavigateCell("down");
            break;
          case "ArrowLeft":
            event.preventDefault();
            onNavigateCell("left");
            break;
          case "ArrowRight":
            event.preventDefault();
            onNavigateCell("right");
            break;
        }
      }

      // Toggle branch collapse: Alt + C
      if (event.altKey && event.key === "c") {
        event.preventDefault();
        onToggleBranch(activeCellId);
      }

      // Toggle parameter sweep: Alt + P
      if (event.altKey && event.key === "p") {
        event.preventDefault();
        onToggleParameterSweep(activeCellId);
      }

      // Toggle snapshots: Alt + S
      if (event.altKey && event.key === "s") {
        event.preventDefault();
        onToggleSnapshots(activeCellId);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeCellId,
    onRunCell,
    onForkCell,
    onNavigateCell,
    onToggleBranch,
    onToggleParameterSweep,
    onToggleSnapshots,
  ]);

  return null;
}
