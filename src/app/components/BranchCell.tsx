"use client";

import { Cell, colorMappings } from "../types";
import Editor from "@monaco-editor/react";
import { useState, useRef, useEffect } from "react";

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
  onShowParameterSweep: (cellId: string) => void;
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
  onShowParameterSweep,
}: BranchCellProps) {
  const [editorHeight, setEditorHeight] = useState(192); // 48rem = 192px
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartY = useRef(0);
  const startHeight = useRef(0);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Handle mouse events for resizing
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartY.current = e.clientY;
    startHeight.current = editorHeight;

    // Add event listeners for mouse move and mouse up
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const deltaY = e.clientY - resizeStartY.current;
    const newHeight = Math.max(96, startHeight.current + deltaY); // Minimum height of 96px
    setEditorHeight(newHeight);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
  };

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, []);

  // Preset height options
  const setPresetHeight = (height: number) => {
    setEditorHeight(height);
  };

  return (
    <div
      className={`
        w-[32rem] space-y-4 rounded-xl shadow-sm p-5 relative
        ${
          isComparisonMode
            ? "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
            : ""
        }
        ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}
        ${colorMappings[cell.color as keyof typeof colorMappings].border}
        ${colorMappings[cell.color as keyof typeof colorMappings].bg}
      `}
      onClick={() => isComparisonMode && onCellSelect(cell.id)}
    >
      {/* Selection indicator */}
      {isComparisonMode && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background shadow-sm border border-border flex items-center justify-center">
          {isSelected ? (
            <div className="w-4 h-4 rounded-full bg-green-500" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
          )}
        </div>
      )}

      {/* Cell header with branch info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBranch(cell.id);
                }}
                className={`w-6 h-6 flex items-center justify-center rounded-md hover:bg-secondary transition-colors cursor-pointer ${
                  colorMappings[cell.color as keyof typeof colorMappings].text
                }`}
                aria-label={isCollapsed ? "Expand branch" : "Collapse branch"}
                title={isCollapsed ? "Expand branch" : "Collapse branch"}
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

            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={cell.label}
                onChange={(e) => onLabelChange(cell.id, e.target.value)}
                placeholder="Branch name"
                className={`w-full font-medium text-lg bg-transparent border-0 border-b border-transparent focus:border-b focus:outline-none focus:ring-0 truncate cursor-text ${
                  colorMappings[cell.color as keyof typeof colorMappings].text
                }`}
                onClick={(e) => e.stopPropagation()}
              />
              {isRoot && (
                <div className="text-xs text-secondary-foreground/60 mt-0.5">
                  Root branch
                </div>
              )}
              {!isRoot && cell.parentId && (
                <div className="text-xs text-secondary-foreground/60 mt-0.5">
                  Forked from {cell.parentId.substring(0, 8)}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="text-xs text-secondary-foreground/60 hidden sm:block">
                Color:
              </div>
              <select
                value={cell.color}
                onChange={(e) => onColorChange(cell.id, e.target.value)}
                className="h-7 text-xs rounded border-0 bg-secondary/50 focus:ring-1 focus:ring-primary cursor-pointer"
                onClick={(e) => e.stopPropagation()}
                aria-label="Branch color"
                title="Branch color"
              >
                <option value="blue">Blue</option>
                <option value="purple">Purple</option>
                <option value="green">Green</option>
                <option value="orange">Orange</option>
                <option value="pink">Pink</option>
                <option value="teal">Teal</option>
                <option value="cyan">Cyan</option>
                <option value="amber">Amber</option>
                <option value="indigo">Indigo</option>
                <option value="rose">Rose</option>
                <option value="emerald">Emerald</option>
              </select>
            </div>
            {hasChildren && (
              <div className="text-xs px-2 py-0.5 bg-secondary/50 rounded-full text-secondary-foreground/70">
                {childrenCount} {childrenCount === 1 ? "branch" : "branches"}
              </div>
            )}
          </div>
        </div>

        <textarea
          value={cell.description}
          onChange={(e) => onDescriptionChange(cell.id, e.target.value)}
          placeholder="Add a description..."
          className="w-full h-16 text-sm bg-transparent border border-border/50 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-primary resize-none cursor-text"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div
        ref={editorContainerRef}
        className="bg-secondary/30 dark:bg-secondary/10 border border-border/50 rounded-md overflow-hidden shadow-sm mt-4 flex flex-col"
        style={{ height: `${editorHeight}px` }}
      >
        <div className="flex items-center justify-between px-3 py-1.5 bg-secondary/50 dark:bg-secondary/30 border-b border-border/50">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span className="text-xs font-medium text-secondary-foreground/70">
              Python
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-secondary-foreground/50">
              {cell.code.split("\n").length} lines
            </div>
            <div className="flex items-center gap-1">
              <button
                className="text-xs text-secondary-foreground/70 hover:text-secondary-foreground transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-secondary/80"
                onClick={(e) => {
                  e.stopPropagation();
                  setPresetHeight(192); // Small - 48rem
                }}
                title="Small editor"
              >
                S
              </button>
              <button
                className="text-xs text-secondary-foreground/70 hover:text-secondary-foreground transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-secondary/80"
                onClick={(e) => {
                  e.stopPropagation();
                  setPresetHeight(384); // Medium - 96rem
                }}
                title="Medium editor"
              >
                M
              </button>
              <button
                className="text-xs text-secondary-foreground/70 hover:text-secondary-foreground transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-secondary/80"
                onClick={(e) => {
                  e.stopPropagation();
                  setPresetHeight(576); // Large - 144rem
                }}
                title="Large editor"
              >
                L
              </button>
            </div>
          </div>
        </div>
        <Editor
          height={`${editorHeight - 30}px`} // Subtract header height
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
        {/* Resize handle */}
        <div
          className={`h-2 w-full cursor-ns-resize flex items-center justify-center hover:bg-secondary/50 ${
            isResizing ? "bg-primary/20" : ""
          }`}
          onMouseDown={handleResizeStart}
        >
          <div className="w-16 h-1 rounded-full bg-secondary-foreground/20"></div>
        </div>
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-2 mt-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => onShowParameterSweep(cell.id)}
            disabled={loading || !pyodide}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              loading || !pyodide
                ? "bg-secondary text-secondary-foreground/50 cursor-not-allowed"
                : "bg-secondary hover:bg-secondary/80 text-secondary-foreground cursor-pointer"
            }`}
          >
            Parameter Sweep
          </button>
          <button
            onClick={() => onShowSnapshots(cell.id)}
            disabled={loading || !pyodide}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              loading || !pyodide
                ? "bg-secondary text-secondary-foreground/50 cursor-not-allowed"
                : "bg-secondary hover:bg-secondary/80 text-secondary-foreground cursor-pointer"
            }`}
          >
            {cell.snapshots.length > 0
              ? `Snapshots (${cell.snapshots.length})`
              : "Create Snapshot"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onForkCell(cell.id)}
            disabled={loading || !pyodide}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              loading || !pyodide
                ? "bg-secondary text-secondary-foreground/50 cursor-not-allowed"
                : "border border-primary/30 bg-transparent hover:bg-primary/5 text-primary cursor-pointer"
            }`}
          >
            Branch
          </button>
          <button
            onClick={() => onRunCode(cell.id)}
            disabled={loading || !pyodide}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
              loading || !pyodide
                ? "bg-secondary text-secondary-foreground/50 cursor-not-allowed"
                : `${
                    colorMappings[cell.color as keyof typeof colorMappings]
                      .button
                  } text-white shadow-sm cursor-pointer`
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-1">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Run
              </span>
            )}
          </button>
        </div>
      </div>

      {cell.error && (
        <div className="mt-4 p-4 bg-red-50/80 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-md shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3 className="font-medium">Error</h3>
          </div>
          <pre className="text-red-600 dark:text-red-400 text-sm whitespace-pre-wrap font-mono overflow-auto max-h-40">
            {cell.error}
          </pre>
        </div>
      )}

      {cell.output && !cell.error && (
        <div className="mt-4 p-4 bg-secondary/30 dark:bg-secondary/10 border border-border/50 rounded-md shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-secondary-foreground/80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            <h3 className="font-medium text-sm">Output</h3>
          </div>
          <pre className="text-sm whitespace-pre-wrap font-mono overflow-auto max-h-60 text-foreground/90">
            {cell.output}
          </pre>
        </div>
      )}

      {/* Snapshot indicator */}
      {cell.currentSnapshotId && (
        <div className="mt-4 flex items-center gap-2 text-sm text-secondary-foreground/70 bg-secondary/20 p-2 rounded-md border border-border/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>
            Viewing snapshot:{" "}
            <span className="font-medium">
              {
                cell.snapshots.find((s) => s.id === cell.currentSnapshotId)
                  ?.label
              }
            </span>
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Add handler for returning to current version
            }}
            className="ml-auto text-primary hover:text-primary/80 font-medium text-xs"
          >
            Return to Current
          </button>
        </div>
      )}
    </div>
  );
}
