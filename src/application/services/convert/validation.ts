import type { ConvertProfileDefinition } from './profiles';
import type {
  ConvertValidationError,
  ConvertValidationMode,
  ConvertValidationWarning,
} from './types';

function isMissing(value: string | undefined): boolean {
  return !value || value.trim() === '';
}

function validateNumberInRange(
  value: string | undefined,
  min: number,
  max: number,
): 'missing' | 'invalid' | 'out_of_range' | 'valid' {
  if (isMissing(value)) {
    return 'missing';
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return 'invalid';
  }

  if (parsed < min || parsed > max) {
    return 'out_of_range';
  }

  return 'valid';
}

function createWarningFromError(error: ConvertValidationError): ConvertValidationWarning {
  if (error.code === 'required_field_missing') {
    return {
      row: error.row,
      code: 'missing_value',
      message: 'missing value',
      field: error.field,
    };
  }

  if (error.code === 'invalid_decimal_latitude' || error.code === 'invalid_decimal_longitude') {
    return {
      row: error.row,
      code: 'invalid_value',
      message: 'invalid value',
      field: error.field,
    };
  }

  return {
    row: error.row,
    code: 'column_mismatch',
    message: 'column mismatch',
    field: error.field,
  };
}

export interface ConvertRowValidationResult {
  normalizedRow: Record<string, string>;
  errors: ConvertValidationError[];
  warnings: ConvertValidationWarning[];
  ok: boolean;
}

export function normalizeOutputValue(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value);
}

export function validateOccurrenceRow(
  rowNumber: number,
  row: Record<string, string | undefined>,
  profile: ConvertProfileDefinition,
): ConvertValidationError[] {
  const errors: ConvertValidationError[] = [];

  for (const requiredField of profile.requiredColumns) {
    if (isMissing(row[requiredField])) {
      errors.push({
        row: rowNumber,
        code: 'required_field_missing',
        message: `Campo obrigatório ausente: ${requiredField}`,
        field: requiredField,
      });
    }
  }

  const latitudeStatus = validateNumberInRange(row.decimalLatitude, -90, 90);

  if (latitudeStatus === 'invalid' || latitudeStatus === 'out_of_range') {
    errors.push({
      row: rowNumber,
      code: 'invalid_decimal_latitude',
      message: 'decimalLatitude inválido. Use um número entre -90 e 90.',
      field: 'decimalLatitude',
    });
  }

  const longitudeStatus = validateNumberInRange(row.decimalLongitude, -180, 180);

  if (longitudeStatus === 'invalid' || longitudeStatus === 'out_of_range') {
    errors.push({
      row: rowNumber,
      code: 'invalid_decimal_longitude',
      message: 'decimalLongitude inválido. Use um número entre -180 e 180.',
      field: 'decimalLongitude',
    });
  }

  return errors;
}

export function validateConvertRow(
  rowNumber: number,
  row: Record<string, string | undefined>,
  profile: ConvertProfileDefinition,
  mode: ConvertValidationMode,
  additionalErrors: readonly ConvertValidationError[] = [],
): ConvertRowValidationResult {
  const normalizedRow = Object.fromEntries(
    Object.entries(row).map(([field, value]) => [field, normalizeOutputValue(value)]),
  );
  const errors = [...additionalErrors, ...validateOccurrenceRow(rowNumber, normalizedRow, profile)];

  if (mode === 'strict') {
    return {
      normalizedRow,
      errors,
      warnings: [],
      ok: errors.length === 0,
    };
  }

  const warnings = errors.map((error) => createWarningFromError(error));

  for (const error of errors) {
    if (error.field) {
      normalizedRow[error.field] = '';
    }
  }

  return {
    normalizedRow,
    errors: [],
    warnings,
    ok: true,
  };
}
