"use client";

import { BranchPadProvider } from "../context/BranchPadContext";
import { BranchPadHeader } from "../components/BranchPadHeader";
import { BranchPadModals } from "../components/BranchPadModals";
import { BranchTree } from "../components/BranchTree";
import { DraggableBranchCanvas } from "../components/DraggableBranchCanvas";
import { useBranchPad } from "../context/BranchPadContext";

// Define the global type for Pyodide
declare global {
  interface Window {
    loadPyodide: any;
  }
}

function BranchPadContent() {
  const { buildTree, cells } = useBranchPad();
  const treeRoot = buildTree(cells);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <BranchPadHeader />
      <BranchPadModals />

      <main className="flex-1 w-full">
        <div className="w-full pb-12">
          {cells.length > 0 ? (
            <DraggableBranchCanvas />
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <div className="bg-secondary/50 backdrop-blur-sm rounded-lg p-8 shadow-sm border border-border">
                <h2 className="text-2xl font-semibold mb-2">No branches yet</h2>
                <p className="text-secondary-foreground/80 max-w-md">
                  Create your first branch to get started with BranchPad.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-secondary-foreground/60 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4">
          BranchPad - A computational notebook with branching capabilities
        </div>
      </footer>
    </div>
  );
}

export default function BranchPad() {
  return (
    <BranchPadProvider>
      <BranchPadContent />
    </BranchPadProvider>
  );
}
