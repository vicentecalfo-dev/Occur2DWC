import type { ConvertMappingPreset } from './types';
import { normalizeColumnName } from './text';

const CNCFLORA_PROFLORA_HEADER_HINTS = [
  'taxon_flora_id',
  'scientific_name',
  'decimal_latitude',
] as const;

export type SupportedInternalPreset = 'cncflora-proflora';

export interface ResolvePresetInput {
  mapPath: string | undefined;
  preset: ConvertMappingPreset;
  headerColumns: readonly string[];
}

export interface ResolvePresetResult {
  presetName: SupportedInternalPreset | undefined;
  reason: 'user-map' | 'forced' | 'heuristic' | 'disabled' | 'not-matched';
}

function toNormalizedHeaderSet(headerColumns: readonly string[]): Set<string> {
  const normalizedHeaders = new Set<string>();

  for (const headerColumn of headerColumns) {
    normalizedHeaders.add(normalizeColumnName(headerColumn));
  }

  return normalizedHeaders;
}

export function detectCncfloraProfloraPreset(headerColumns: readonly string[]): boolean {
  const normalizedHeaders = toNormalizedHeaderSet(headerColumns);

  return CNCFLORA_PROFLORA_HEADER_HINTS.some((fieldName) =>
    normalizedHeaders.has(normalizeColumnName(fieldName)),
  );
}

export function resolveMappingPreset(input: ResolvePresetInput): ResolvePresetResult {
  if (input.mapPath) {
    return {
      presetName: undefined,
      reason: 'user-map',
    };
  }

  if (input.preset === 'none') {
    return {
      presetName: undefined,
      reason: 'disabled',
    };
  }

  if (input.preset === 'cncflora-proflora') {
    return {
      presetName: 'cncflora-proflora',
      reason: 'forced',
    };
  }

  if (detectCncfloraProfloraPreset(input.headerColumns)) {
    return {
      presetName: 'cncflora-proflora',
      reason: 'heuristic',
    };
  }

  return {
    presetName: undefined,
    reason: 'not-matched',
  };
}
