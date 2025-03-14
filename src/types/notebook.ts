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
  snapshots: string[];
  currentSnapshotId: string | null;
} 