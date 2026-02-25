export function normalizeColumnName(value: string): string {
  return value
    .trim()
    .replace(/^\uFEFF/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toLowerCase();
}

export function normalizeCellValue(value: string, decodeHtmlEntities: boolean): string {
  const trimmed = value.trim();

  if (!decodeHtmlEntities) {
    return trimmed;
  }

  return decodeHtmlEntitiesInText(trimmed);
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeEntityValue(entity: string): string {
  if (entity.startsWith('#x') || entity.startsWith('#X')) {
    const parsed = Number.parseInt(entity.slice(2), 16);
    return Number.isNaN(parsed) ? `&${entity};` : String.fromCodePoint(parsed);
  }

  if (entity.startsWith('#')) {
    const parsed = Number.parseInt(entity.slice(1), 10);
    return Number.isNaN(parsed) ? `&${entity};` : String.fromCodePoint(parsed);
  }

  return NAMED_ENTITIES[entity] ?? `&${entity};`;
}

function decodeHtmlEntitiesInText(value: string): string {
  return value.replace(/&([#a-zA-Z0-9]+);/g, (_, entity: string) => decodeEntityValue(entity));
}
