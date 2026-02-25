import { describe, expect, it } from 'vitest';

import { getConvertProfile } from '../../src/application/services/convert/profiles';
import { validateOccurrenceRow } from '../../src/application/services/convert/validation';

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
});
