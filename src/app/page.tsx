"use client";

import { BranchPadProvider } from "../context/BranchPadContext";
import { BranchPadHeader } from "../components/BranchPadHeader";
import { BranchPadModals } from "../components/BranchPadModals";
import { BranchTree } from "../components/BranchTree";
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
    <div className="min-h-screen p-8 flex flex-col items-center gap-8 font-[family-name:var(--font-geist-sans)]">
      <BranchPadHeader />
      <BranchPadModals />

      <div className="w-full overflow-x-auto">
        <div className="min-w-[90rem] px-8 mx-auto">
          {treeRoot && <BranchTree node={treeRoot} />}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <BranchPadProvider>
      <BranchPadContent />
    </BranchPadProvider>
  );
}
