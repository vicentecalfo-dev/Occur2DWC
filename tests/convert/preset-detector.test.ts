import { describe, expect, it } from 'vitest';

import {
  detectCncfloraProfloraPreset,
  resolveMappingPreset,
} from '../../src/application/services/convert/preset-detector';

describe('preset detector', () => {
  it('should detect preset when scientific_name exists', () => {
    expect(
      detectCncfloraProfloraPreset(['id', '  Scientific_Name ', 'decimal_longitude']),
    ).toBe(true);
  });

  it('should detect preset when taxon_flora_id exists', () => {
    expect(detectCncfloraProfloraPreset(['taxon_flora_id', 'family_description'])).toBe(true);
  });

  it('should not detect preset when no hint field exists', () => {
    expect(detectCncfloraProfloraPreset(['catalogNumber', 'family'])).toBe(false);
  });

  it('should prioritize user map over preset', () => {
    const result = resolveMappingPreset({
      mapPath: './meu-map.yml',
      preset: 'cncflora-proflora',
      headerColumns: ['scientific_name'],
    });

    expect(result).toEqual({
      presetName: undefined,
      reason: 'user-map',
    });
  });
});
