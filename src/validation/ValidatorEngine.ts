import type { ConvertProfileDefinition } from '../application/services/convert/profiles';
import { validateOccurrenceRow } from '../application/services/convert/validation';
import type { ValidationIssue } from './types';

function hasValue(value: string | undefined): boolean {
  return value !== undefined && value.trim() !== '';
}

function hasIssue(issues: readonly ValidationIssue[], code: string, field?: string): boolean {
  return issues.some((issue) => issue.code === code && issue.field === field);
}

function createIssue(params: {
  rowNumber: number;
  severity: 'error' | 'warning';
  code: string;
  messagePtBr: string;
  field?: string | undefined;
  value?: string | undefined;
}): ValidationIssue {
  const issue: ValidationIssue = {
    rowNumber: params.rowNumber,
    severity: params.severity,
    code: params.code,
    messagePtBr: params.messagePtBr,
  };

  if (params.field !== undefined) {
    issue.field = params.field;
  }

  if (params.value !== undefined) {
    issue.value = params.value;
  }

  return issue;
}

function parseInteger(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  if (!/^[-]?\d+$/.test(value.trim())) {
    return undefined;
  }

  return Number.parseInt(value, 10);
}

function buildDateValidationIssues(
  rowNumber: number,
  row: Record<string, string | undefined>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const hasDay = hasValue(row.day);
  const hasMonth = hasValue(row.month);
  const hasYear = hasValue(row.year);

  if (!hasDay && !hasMonth && !hasYear) {
    return issues;
  }

  if (!(hasDay && hasMonth && hasYear)) {
    issues.push(
      createIssue({
        rowNumber,
        severity: 'warning',
        code: 'incomplete_day_month_year',
        messagePtBr:
          'Preenchimento parcial de day/month/year. Informe os três campos para uma data completa.',
      }),
    );
    return issues;
  }

  const parsedDay = parseInteger(row.day);
  const parsedMonth = parseInteger(row.month);
  const parsedYear = parseInteger(row.year);

  if (parsedDay === undefined || parsedDay < 1 || parsedDay > 31) {
    issues.push(
      createIssue({
        rowNumber,
        severity: 'error',
        code: 'invalid_day_month_year',
        messagePtBr: 'Campo day inválido. Use valor inteiro entre 1 e 31.',
        field: 'day',
        value: row.day,
      }),
    );
  }

  if (parsedMonth === undefined || parsedMonth < 1 || parsedMonth > 12) {
    issues.push(
      createIssue({
        rowNumber,
        severity: 'error',
        code: 'invalid_day_month_year',
        messagePtBr: 'Campo month inválido. Use valor inteiro entre 1 e 12.',
        field: 'month',
        value: row.month,
      }),
    );
  }

  if (parsedYear === undefined || parsedYear < 1 || parsedYear > 9999) {
    issues.push(
      createIssue({
        rowNumber,
        severity: 'error',
        code: 'invalid_day_month_year',
        messagePtBr: 'Campo year inválido. Use valor inteiro entre 1 e 9999.',
        field: 'year',
        value: row.year,
      }),
    );
  }

  return issues;
}

export class ValidatorEngine {
  validateRow(
    rowNumber: number,
    row: Record<string, string | undefined>,
    profile: ConvertProfileDefinition,
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = validateOccurrenceRow(rowNumber, row, profile).map((error) =>
      createIssue({
        rowNumber: error.row,
        severity: 'error',
        code: error.code,
        messagePtBr: error.message,
        field: error.field,
        value: error.field ? row[error.field] : undefined,
      }),
    );

    if (
      !hasValue(row.occurrenceID) &&
      !hasIssue(issues, 'required_field_missing', 'occurrenceID')
    ) {
      issues.push({
        rowNumber,
        severity: 'error',
        code: 'required_field_missing',
        messagePtBr: 'Campo obrigatório ausente: occurrenceID',
        field: 'occurrenceID',
      });
    }

    if (
      !hasValue(row.scientificName) &&
      !hasIssue(issues, 'required_field_missing', 'scientificName')
    ) {
      issues.push({
        rowNumber,
        severity: 'error',
        code: 'required_field_missing',
        messagePtBr: 'Campo obrigatório ausente: scientificName',
        field: 'scientificName',
      });
    }

    const hasLatitude = hasValue(row.decimalLatitude);
    const hasLongitude = hasValue(row.decimalLongitude);

    if (hasLatitude !== hasLongitude) {
      if (!hasLatitude) {
        issues.push(
          createIssue({
            rowNumber,
            severity: 'error',
            code: 'require_lat_lon_pair',
            messagePtBr: 'decimalLatitude e decimalLongitude devem ser informados em par.',
            field: 'decimalLatitude',
            value: row.decimalLatitude,
          }),
        );
      }

      if (!hasLongitude) {
        issues.push(
          createIssue({
            rowNumber,
            severity: 'error',
            code: 'require_lat_lon_pair',
            messagePtBr: 'decimalLatitude e decimalLongitude devem ser informados em par.',
            field: 'decimalLongitude',
            value: row.decimalLongitude,
          }),
        );
      }
    }

    issues.push(...buildDateValidationIssues(rowNumber, row));

    return issues;
  }
}
