import { describe, expect, it } from 'vitest';

import { getConvertProfile } from '../../src/application/services/convert/profiles';
import {
  validateConvertRow,
  validateOccurrenceRow,
} from '../../src/application/services/convert/validation';

describe('validateOccurrenceRow', () => {
  it('should return errors for required fields and coordinate range', () => {
    const profile = getConvertProfile('occurrence');

    const errors = validateOccurrenceRow(
      3,
      {
        occurrenceID: '',
        scientificName: '',
        decimalLatitude: '95.0',
        decimalLongitude: '-200',
      },
      profile,
    );

    expect(errors.map((entry) => entry.code)).toEqual([
      'required_field_missing',
      'required_field_missing',
      'invalid_decimal_latitude',
      'invalid_decimal_longitude',
    ]);
  });

  it('should keep strict behavior with errors and skip signal', () => {
    const profile = getConvertProfile('occurrence');

    const result = validateConvertRow(
      2,
      {
        occurrenceID: '',
        scientificName: '',
        decimalLatitude: '95.0',
        decimalLongitude: '-200',
      },
      profile,
      'strict',
    );

    expect(result.ok).toBe(false);
    expect(result.errors.map((entry) => entry.code)).toEqual([
      'required_field_missing',
      'required_field_missing',
      'invalid_decimal_latitude',
      'invalid_decimal_longitude',
    ]);
    expect(result.warnings).toEqual([]);
  });

  it('should convert strict errors to warnings in lenient mode and keep row valid', () => {
    const profile = getConvertProfile('occurrence');

    const result = validateConvertRow(
      2,
      {
        occurrenceID: '',
        scientificName: '',
        decimalLatitude: '95.0',
        decimalLongitude: '-200',
      },
      profile,
      'lenient',
    );

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings.map((entry) => entry.code)).toEqual([
      'missing_value',
      'missing_value',
      'invalid_value',
      'invalid_value',
    ]);
    expect(result.normalizedRow.occurrenceID).toBe('');
    expect(result.normalizedRow.scientificName).toBe('');
    expect(result.normalizedRow.decimalLatitude).toBe('');
    expect(result.normalizedRow.decimalLongitude).toBe('');
  });
});
