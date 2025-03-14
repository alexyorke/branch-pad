export interface Cell {
  id: string;
  code: string;
  output: string;
  error: string | null;
  parentId: string | null;
  executionContext: any;
} 