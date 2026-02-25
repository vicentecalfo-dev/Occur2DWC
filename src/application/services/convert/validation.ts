import type { ConvertProfileDefinition } from './profiles';
import type { ConvertValidationError } from './types';

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

export function validateOccurrenceRow(
  rowNumber: number,
  row: Record<string, string>,
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
