import { describe, expect, it } from 'vitest';

import { getConvertProfile } from '../../src/application/services/convert/profiles';
import { ValidatorEngine } from '../../src/validation/ValidatorEngine';
import type { ConvertProfileDefinition } from '../../src/application/services/convert/profiles';

describe('ValidatorEngine', () => {
  const engine = new ValidatorEngine();
  const profile = getConvertProfile('occurrence');

  it('should validate required fields', () => {
    const issues = engine.validateRow(
      1,
      {
        occurrenceID: '',
        scientificName: '',
        decimalLatitude: '-10',
        decimalLongitude: '-50',
      },
      profile,
    );

    const issueFields = issues
      .filter((issue) => issue.code === 'required_field_missing')
      .map((issue) => issue.field);

    expect(issueFields).toContain('occurrenceID');
    expect(issueFields).toContain('scientificName');
  });

  it('should validate latitude and longitude ranges', () => {
    const issues = engine.validateRow(
      2,
      {
        occurrenceID: 'id-1',
        scientificName: 'Mimosa pudica',
        decimalLatitude: '100',
        decimalLongitude: '-200',
      },
      profile,
    );

    expect(issues.map((issue) => issue.code)).toContain('invalid_decimal_latitude');
    expect(issues.map((issue) => issue.code)).toContain('invalid_decimal_longitude');
  });

  it('should require latitude and longitude as a pair', () => {
    const issues = engine.validateRow(
      3,
      {
        occurrenceID: 'id-2',
        scientificName: 'Inga vera',
        decimalLatitude: '-11',
        decimalLongitude: '',
      },
      profile,
    );

    expect(issues.some((issue) => issue.code === 'require_lat_lon_pair')).toBe(true);
  });

  it('should validate day/month/year consistency', () => {
    const issues = engine.validateRow(
      4,
      {
        occurrenceID: 'id-3',
        scientificName: 'Inga vera',
        decimalLatitude: '-11',
        decimalLongitude: '-50',
        day: '31',
        month: '',
        year: '2024',
      },
      profile,
    );

    expect(issues.some((issue) => issue.code === 'incomplete_day_month_year')).toBe(true);
  });

  it('should validate month and year ranges', () => {
    const issues = engine.validateRow(
      5,
      {
        occurrenceID: 'id-4',
        scientificName: 'Miconia albicans',
        decimalLatitude: '-11',
        decimalLongitude: '-50',
        day: '10',
        month: '13',
        year: '10000',
      },
      profile,
    );

    const invalidDateIssues = issues.filter((issue) => issue.code === 'invalid_day_month_year');

    expect(invalidDateIssues.some((issue) => issue.field === 'month')).toBe(true);
    expect(invalidDateIssues.some((issue) => issue.field === 'year')).toBe(true);
  });

  it('should force required scientificName and occurrenceID when profile does not declare them', () => {
    const customProfile: ConvertProfileDefinition = {
      name: 'occurrence',
      outputColumns: ['occurrenceID', 'scientificName'],
      requiredColumns: [],
    };

    const issues = engine.validateRow(
      6,
      {
        occurrenceID: '',
        scientificName: '',
        decimalLatitude: '-11',
        decimalLongitude: '-50',
      },
      customProfile,
    );

    expect(
      issues.filter(
        (issue) => issue.code === 'required_field_missing' && issue.field === 'occurrenceID',
      ),
    ).toHaveLength(1);
    expect(
      issues.filter(
        (issue) => issue.code === 'required_field_missing' && issue.field === 'scientificName',
      ),
    ).toHaveLength(1);
  });

  it('should require latitude when longitude is present', () => {
    const issues = engine.validateRow(
      7,
      {
        occurrenceID: 'id-5',
        scientificName: 'Miconia albicans',
        decimalLatitude: '',
        decimalLongitude: '-45.1',
      },
      profile,
    );

    expect(
      issues.some(
        (issue) => issue.code === 'require_lat_lon_pair' && issue.field === 'decimalLatitude',
      ),
    ).toBe(true);
  });
});
