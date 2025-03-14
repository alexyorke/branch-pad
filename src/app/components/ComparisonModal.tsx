"use client";

import { Cell, colorMappings } from "../types";

interface ComparisonModalProps {
  selectedCells: string[];
  cells: Cell[];
  onClose: () => void;
}

interface DiffResult {
  added: string[];
  removed: string[];
  unchanged: string[];
}

const computeDiff = (str1: string, str2: string): DiffResult => {
  const lines1 = str1.split("\n");
  const lines2 = str2.split("\n");
  const added: string[] = [];
  const removed: string[] = [];
  const unchanged: string[] = [];

  const lcs = (a: string[], b: string[]): number[][] => {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array(m + 1)
      .fill(0)
      .map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    return dp;
  };

  const backtrack = (
    dp: number[][],
    a: string[],
    b: string[],
    i: number,
    j: number
  ) => {
    if (i === 0 || j === 0) return;

    if (a[i - 1] === b[j - 1]) {
      unchanged.unshift(a[i - 1]);
      backtrack(dp, a, b, i - 1, j - 1);
    } else if ((dp[i - 1] ?? [])[j] > (dp[i] ?? [])[j - 1]) {
      removed.unshift(a[i - 1]);
      backtrack(dp, a, b, i - 1, j);
    } else {
      added.unshift(b[j - 1]);
      backtrack(dp, a, b, i, j - 1);
    }
  };

  const dp = lcs(lines1, lines2);
  backtrack(dp, lines1, lines2, lines1.length, lines2.length);

  return { added, removed, unchanged };
};

export function ComparisonModal({
  selectedCells,
  cells,
  onClose,
}: ComparisonModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[90vw] h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Branch Comparison</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          {selectedCells.map((cellId, index) => {
            const cell = cells.find((c) => c.id === cellId)!;
            const otherCell = cells.find(
              (c) => c.id === selectedCells[1 - index]
            )!;
            const diff = computeDiff(cell.code, otherCell.code);

            return (
              <div key={cellId} className="flex-1 flex flex-col min-h-0">
                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-t-lg">
                  <h3
                    className={`font-medium ${
                      colorMappings[cell.color as keyof typeof colorMappings]
                        .text
                    }`}
                  >
                    {cell.label}
                  </h3>
                  <p className="text-sm text-gray-500">{cell.description}</p>
                </div>

                <div className="flex-1 flex flex-col gap-4 overflow-y-auto p-4 border-x border-gray-200 dark:border-gray-700">
                  {/* Code Comparison */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Code</h4>
                    <pre className="font-mono text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      {cell.code.split("\n").map((line, i) => {
                        const isAdded = diff.added.includes(line);
                        const isRemoved = diff.removed.includes(line);
                        return (
                          <div
                            key={i}
                            className={`${
                              isAdded
                                ? "bg-green-100 dark:bg-green-900/20"
                                : isRemoved
                                ? "bg-red-100 dark:bg-red-900/20"
                                : ""
                            }`}
                          >
                            {line}
                          </div>
                        );
                      })}
                    </pre>
                  </div>

                  {/* Output Comparison */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Output</h4>
                    <pre className="font-mono text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      {cell.output || "No output"}
                    </pre>
                  </div>

                  {/* Variables Comparison */}
                  {cell.executionContext && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Variables</h4>
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <pre className="font-mono text-sm whitespace-pre-wrap">
                          {JSON.stringify(cell.executionContext, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
