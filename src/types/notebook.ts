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