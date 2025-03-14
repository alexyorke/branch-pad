"use client";

import { useBranchPad } from "../context/BranchPadContext";
import { ComparisonModal } from "../app/components/ComparisonModal";
import { PackagesModal } from "../app/components/PackagesModal";
import { SnapshotsModal } from "../app/components/SnapshotsModal";
import { ExportModal } from "../app/components/ExportModal";
import { ParameterSweepModal } from "../app/components/ParameterSweepModal";

export function BranchPadModals() {
  const {
    comparison,
    toggleComparisonMode,
    showPackages,
    setShowPackages,
    packageList,
    showSnapshots,
    setShowSnapshots,
    selectedCellForSnapshot,
    setSelectedCellForSnapshot,
    showExport,
    setShowExport,
    setSelectedCellForExport,
    showParameterSweep,
    setShowParameterSweep,
    selectedCellForParameterSweep,
    setSelectedCellForParameterSweep,
    cells,
    createSnapshot,
    restoreSnapshot,
    generateDeploymentFiles,
    runParameterSweep,
  } = useBranchPad();

  // Common modal backdrop style for consistency
  const modalBackdrop =
    "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center";

  return (
    <>
      {/* Comparison Modal */}
      {comparison.isActive && comparison.selectedCells.length === 2 && (
        <div className={modalBackdrop}>
          <ComparisonModal
            selectedCells={comparison.selectedCells}
            cells={cells}
            onClose={toggleComparisonMode}
          />
        </div>
      )}

      {/* Package Modal */}
      {showPackages && (
        <div className={modalBackdrop}>
          <PackagesModal
            packageList={packageList}
            onClose={() => setShowPackages(false)}
          />
        </div>
      )}

      {/* Snapshots Modal */}
      {showSnapshots && selectedCellForSnapshot && (
        <div className={modalBackdrop}>
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
        </div>
      )}

      {/* Export Modal */}
      {showExport && (
        <div className={modalBackdrop}>
          <ExportModal
            cells={cells}
            onClose={() => {
              setShowExport(false);
              setSelectedCellForExport(null);
            }}
            onExport={generateDeploymentFiles}
          />
        </div>
      )}

      {/* Parameter Sweep Modal */}
      {showParameterSweep && selectedCellForParameterSweep && (
        <div className={modalBackdrop}>
          <ParameterSweepModal
            cell={cells.find((c) => c.id === selectedCellForParameterSweep)!}
            onClose={() => {
              setShowParameterSweep(false);
              setSelectedCellForParameterSweep(null);
            }}
            onRunParameterSweep={runParameterSweep}
          />
        </div>
      )}
    </>
  );
}
