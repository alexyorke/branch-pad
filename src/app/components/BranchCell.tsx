"use client";

import { Cell, colorMappings } from "../types";
import Editor from "@monaco-editor/react";

interface BranchCellProps {
  cell: Cell;
  isRoot: boolean;
  hasChildren: boolean;
  childrenCount: number;
  isCollapsed: boolean;
  isSelected: boolean;
  isComparisonMode: boolean;
  loading: boolean;
  pyodide: any;
  onToggleBranch: (cellId: string) => void;
  onLabelChange: (cellId: string, label: string) => void;
  onDescriptionChange: (cellId: string, description: string) => void;
  onColorChange: (cellId: string, color: string) => void;
  onCodeChange: (cellId: string, code: string) => void;
  onShowSnapshots: (cellId: string) => void;
  onForkCell: (cellId: string) => void;
  onRunCode: (cellId: string) => void;
  onCellSelect: (cellId: string) => void;
}

export function BranchCell({
  cell,
  isRoot,
  hasChildren,
  childrenCount,
  isCollapsed,
  isSelected,
  isComparisonMode,
  loading,
  pyodide,
  onToggleBranch,
  onLabelChange,
  onDescriptionChange,
  onColorChange,
  onCodeChange,
  onShowSnapshots,
  onForkCell,
  onRunCode,
  onCellSelect,
}: BranchCellProps) {
  return (
    <div
      className={`
        w-[32rem] space-y-4 border-2 rounded-lg p-4 relative
        ${
          isComparisonMode
            ? "cursor-pointer transition-transform hover:scale-[1.02]"
            : ""
        }
        ${isSelected ? "ring-2 ring-offset-2" : ""}
        ${colorMappings[cell.color as keyof typeof colorMappings].border}
        ${colorMappings[cell.color as keyof typeof colorMappings].bg}
      `}
      onClick={() => isComparisonMode && onCellSelect(cell.id)}
    >
      {/* Selection indicator */}
      {isComparisonMode && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
          {isSelected ? (
            <div className="w-4 h-4 rounded-full bg-green-500" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
          )}
        </div>
      )}

      {/* Cell header with branch info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBranch(cell.id);
                }}
                className={`w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  colorMappings[cell.color as keyof typeof colorMappings].text
                }`}
              >
                {isCollapsed ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </button>
            )}
            <input
              type="text"
              value={cell.label}
              onChange={(e) => {
                e.stopPropagation();
                onLabelChange(cell.id, e.target.value);
              }}
              className={`text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-2 ${
                colorMappings[cell.color as keyof typeof colorMappings].ring
              } rounded px-1 ${
                colorMappings[cell.color as keyof typeof colorMappings].text
              }`}
              placeholder="Enter branch name..."
            />
            {cell.parentId && (
              <span className="text-xs text-gray-500">
                (from {cell.parentId})
              </span>
            )}
          </div>
          {hasChildren && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {hasChildren &&
                  `${childrenCount} branch${childrenCount > 1 ? "es" : ""}`}
                {isCollapsed ? " (collapsed)" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Branch description */}
        <textarea
          value={cell.description}
          onChange={(e) => {
            e.stopPropagation();
            onDescriptionChange(cell.id, e.target.value);
          }}
          placeholder="Add branch description..."
          className={`w-full px-3 py-2 text-sm bg-white/50 dark:bg-gray-900/50 border ${
            colorMappings[cell.color as keyof typeof colorMappings].border
          } rounded-lg focus:outline-none focus:ring-2 ${
            colorMappings[cell.color as keyof typeof colorMappings].ring
          }`}
          rows={2}
        />

        {/* Color selector */}
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs text-gray-500">Branch color:</span>
          <div className="flex gap-1">
            {Object.keys(colorMappings).map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(cell.id, color)}
                className={`w-4 h-4 rounded-full ${
                  colorMappings[color as keyof typeof colorMappings].buttonBg
                } hover:ring-2 ${cell.color === color ? "ring-2" : ""} ${
                  colorMappings[color as keyof typeof colorMappings].buttonRing
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="h-48 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme={
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "vs-dark"
              : "light"
          }
          value={cell.code}
          onChange={(value) => {
            if (value !== undefined) {
              onCodeChange(cell.id, value);
            }
          }}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: "on",
            renderLineHighlight: "all",
            automaticLayout: true,
            tabSize: 4,
            wordWrap: "on",
            suggest: {
              showKeywords: true,
              showSnippets: true,
              preview: true,
              snippetsPreventQuickSuggestions: false,
            },
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true,
            },
            acceptSuggestionOnEnter: "on",
            tabCompletion: "on",
            formatOnType: true,
            formatOnPaste: true,
            bracketPairColorization: {
              enabled: true,
            },
            autoIndent: "full",
            detectIndentation: true,
          }}
          onMount={(editor, monaco) => {
            // Add custom keybinding for code formatting
            editor?.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF,
              () => {
                editor?.getAction("editor.action.formatDocument")?.run();
              }
            );
          }}
        />
      </div>

      <div
        className="flex justify-end gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onShowSnapshots(cell.id)}
          disabled={loading || !pyodide}
          className={`px-4 py-2 rounded-lg font-medium text-white ${
            loading || !pyodide
              ? "bg-gray-400 cursor-not-allowed"
              : colorMappings[cell.color as keyof typeof colorMappings].button
          }`}
        >
          {cell.snapshots.length > 0
            ? `Snapshots (${cell.snapshots.length})`
            : "Create Snapshot"}
        </button>
        <button
          onClick={() => onForkCell(cell.id)}
          disabled={loading || !pyodide}
          className={`px-4 py-2 rounded-lg font-medium text-white ${
            loading || !pyodide
              ? "bg-gray-400 cursor-not-allowed"
              : colorMappings[cell.color as keyof typeof colorMappings].button
          }`}
        >
          Branch
        </button>
        <button
          onClick={() => onRunCode(cell.id)}
          disabled={loading || !pyodide}
          className={`px-4 py-2 rounded-lg font-medium text-white ${
            loading || !pyodide
              ? "bg-gray-400 cursor-not-allowed"
              : colorMappings[cell.color as keyof typeof colorMappings].button
          }`}
        >
          {loading ? "Loading Python..." : "Run"}
        </button>
      </div>

      {cell.error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <pre className="text-red-600 dark:text-red-400 text-sm whitespace-pre-wrap font-mono">
            {cell.error}
          </pre>
        </div>
      )}

      {cell.output && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h2 className="text-sm font-semibold mb-2">Output:</h2>
          <pre className="text-sm whitespace-pre-wrap font-mono">
            {cell.output}
          </pre>
        </div>
      )}

      {/* Snapshot indicator */}
      {cell.currentSnapshotId && (
        <div className="mt-2 text-sm text-gray-500">
          Currently viewing snapshot:{" "}
          {cell.snapshots.find((s) => s.id === cell.currentSnapshotId)?.label}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Add handler for returning to current version
            }}
            className="ml-2 text-blue-500 hover:text-blue-600"
          >
            Return to Current
          </button>
        </div>
      )}
    </div>
  );
}
