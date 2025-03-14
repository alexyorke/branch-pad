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

  return (
    <>
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
    </>
  );
}
