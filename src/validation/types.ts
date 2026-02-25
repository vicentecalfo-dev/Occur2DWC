import type { ConvertProfileName } from '../application/services/convert/types';

export type IssueSeverity = 'error' | 'warning';

export interface ValidationIssue {
  rowNumber: number;
  severity: IssueSeverity;
  code: string;
  messagePtBr: string;
  field?: string;
  value?: string;
}

export interface ValidationSummary {
  totalRows: number;
  errorRows: number;
  warningRows: number;
  totalIssues: number;
  truncated: boolean;
  startTime: string;
  endTime: string;
  durationMs: number;
  profile: ConvertProfileName;
  strict: boolean;
  delimiter: '\t' | ',' | ';';
}

export interface ValidationReport {
  summary: ValidationSummary;
  issues: ValidationIssue[];
}
