export interface Snapshot {
  id: string;
  timestamp: number;
  code: string;
  output: string;
  error: string | null;
  executionContext: any;
  label: string;
  description: string;
  color: string;
}

export interface Cell {
  id: string;
  code: string;
  output: string;
  error: string | null;
  parentId: string | null;
  executionContext: any;
  label: string;
  description: string;
  color: string;
  snapshots: Snapshot[];
  currentSnapshotId: string | null;
  parameters: Parameter[];
  parameterSweeps: ParameterSweep[];
}

export interface TreeNode {
  cell: Cell;
  children: TreeNode[];
}

export interface ComparisonState {
  isActive: boolean;
  selectedCells: string[];
}

export interface Parameter {
  name: string;
  type: 'number' | 'string' | 'boolean';
  value: string | number | boolean;
  range?: {
    min?: number;
    max?: number;
    step?: number;
  };
  options?: (string | number | boolean)[];
}

export interface ParameterSweep {
  id: string;
  parameters: Parameter[];
  results: {
    parameters: Record<string, any>;
    output: string;
    error: string | null;
  }[];
}

// Color mappings for Tailwind classes
export const colorMappings = {
  blue: {
    border: "border-blue-200 dark:border-blue-800/40",
    bg: "bg-gradient-to-br from-blue-50/80 to-blue-50/30 dark:from-blue-900/10 dark:to-blue-900/5",
    text: "text-blue-600 dark:text-blue-400",
    button: "bg-blue-500 hover:bg-blue-600",
    ring: "focus:ring-blue-500",
    buttonBg: "bg-blue-500",
    buttonRing: "ring-blue-400",
  },
  purple: {
    border: "border-purple-200 dark:border-purple-800/40",
    bg: "bg-gradient-to-br from-purple-50/80 to-purple-50/30 dark:from-purple-900/10 dark:to-purple-900/5",
    text: "text-purple-600 dark:text-purple-400",
    button: "bg-purple-500 hover:bg-purple-600",
    ring: "focus:ring-purple-500",
    buttonBg: "bg-purple-500",
    buttonRing: "ring-purple-400",
  },
  green: {
    border: "border-green-200 dark:border-green-800/40",
    bg: "bg-gradient-to-br from-green-50/80 to-green-50/30 dark:from-green-900/10 dark:to-green-900/5",
    text: "text-green-600 dark:text-green-400",
    button: "bg-green-500 hover:bg-green-600",
    ring: "focus:ring-green-500",
    buttonBg: "bg-green-500",
    buttonRing: "ring-green-400",
  },
  orange: {
    border: "border-orange-200 dark:border-orange-800/40",
    bg: "bg-gradient-to-br from-orange-50/80 to-orange-50/30 dark:from-orange-900/10 dark:to-orange-900/5",
    text: "text-orange-600 dark:text-orange-400",
    button: "bg-orange-500 hover:bg-orange-600",
    ring: "focus:ring-orange-500",
    buttonBg: "bg-orange-500",
    buttonRing: "ring-orange-400",
  },
  pink: {
    border: "border-pink-200 dark:border-pink-800/40",
    bg: "bg-gradient-to-br from-pink-50/80 to-pink-50/30 dark:from-pink-900/10 dark:to-pink-900/5",
    text: "text-pink-600 dark:text-pink-400",
    button: "bg-pink-500 hover:bg-pink-600",
    ring: "focus:ring-pink-500",
    buttonBg: "bg-pink-500",
    buttonRing: "ring-pink-400",
  },
  teal: {
    border: "border-teal-200 dark:border-teal-800/40",
    bg: "bg-gradient-to-br from-teal-50/80 to-teal-50/30 dark:from-teal-900/10 dark:to-teal-900/5",
    text: "text-teal-600 dark:text-teal-400",
    button: "bg-teal-500 hover:bg-teal-600",
    ring: "focus:ring-teal-500",
    buttonBg: "bg-teal-500",
    buttonRing: "ring-teal-400",
  },
  cyan: {
    border: "border-cyan-200 dark:border-cyan-800/40",
    bg: "bg-gradient-to-br from-cyan-50/80 to-cyan-50/30 dark:from-cyan-900/10 dark:to-cyan-900/5",
    text: "text-cyan-600 dark:text-cyan-400",
    button: "bg-cyan-500 hover:bg-cyan-600",
    ring: "focus:ring-cyan-500",
    buttonBg: "bg-cyan-500",
    buttonRing: "ring-cyan-400",
  },
  amber: {
    border: "border-amber-200 dark:border-amber-800/40",
    bg: "bg-gradient-to-br from-amber-50/80 to-amber-50/30 dark:from-amber-900/10 dark:to-amber-900/5",
    text: "text-amber-600 dark:text-amber-400",
    button: "bg-amber-500 hover:bg-amber-600",
    ring: "focus:ring-amber-500",
    buttonBg: "bg-amber-500",
    buttonRing: "ring-amber-400",
  },
  indigo: {
    border: "border-indigo-200 dark:border-indigo-800/40",
    bg: "bg-gradient-to-br from-indigo-50/80 to-indigo-50/30 dark:from-indigo-900/10 dark:to-indigo-900/5",
    text: "text-indigo-600 dark:text-indigo-400",
    button: "bg-indigo-500 hover:bg-indigo-600",
    ring: "focus:ring-indigo-500",
    buttonBg: "bg-indigo-500",
    buttonRing: "ring-indigo-400",
  },
  rose: {
    border: "border-rose-200 dark:border-rose-800/40",
    bg: "bg-gradient-to-br from-rose-50/80 to-rose-50/30 dark:from-rose-900/10 dark:to-rose-900/5",
    text: "text-rose-600 dark:text-rose-400",
    button: "bg-rose-500 hover:bg-rose-600",
    ring: "focus:ring-rose-500",
    buttonBg: "bg-rose-500",
    buttonRing: "ring-rose-400",
  },
  emerald: {
    border: "border-emerald-200 dark:border-emerald-800/40",
    bg: "bg-gradient-to-br from-emerald-50/80 to-emerald-50/30 dark:from-emerald-900/10 dark:to-emerald-900/5",
    text: "text-emerald-600 dark:text-emerald-400",
    button: "bg-emerald-500 hover:bg-emerald-600",
    ring: "focus:ring-emerald-500",
    buttonBg: "bg-emerald-500",
    buttonRing: "ring-emerald-400",
  },
} as const;

export type ColorKey = keyof typeof colorMappings; 