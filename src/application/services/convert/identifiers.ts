import { createHash, randomUUID } from 'node:crypto';

import type { IdStrategy } from './types';

function toHashSeed(row: Record<string, string>, rowNumber: number): string {
  const stableSeed = [
    row.occurrenceID ?? '',
    row.scientificName ?? '',
    row.eventDate ?? '',
    row.decimalLatitude ?? '',
    row.decimalLongitude ?? '',
    String(rowNumber),
  ].join('|');

  return stableSeed;
}

export function applyIdStrategy(
  strategy: IdStrategy,
  row: Record<string, string>,
  rowNumber: number,
): void {
  if (strategy === 'preserve') {
    return;
  }

  if (strategy === 'uuid') {
    row.occurrenceID = randomUUID();
    return;
  }

  const hash = createHash('sha256').update(toHashSeed(row, rowNumber)).digest('hex');
  row.occurrenceID = hash;
}
