import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

import { parse as parseYaml } from 'yaml';

import { CliError } from '../../../shared/errors/cli-error';
import type { IdStrategy } from './types';
import { normalizeColumnName } from './text';

export interface MappingDocument {
  version: number;
  name?: string;
  idStrategy?: IdStrategy;
  mappings: Record<string, string>;
  extras: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseIdStrategy(value: unknown): IdStrategy | undefined {
  if (value === 'preserve' || value === 'uuid' || value === 'hash') {
    return value;
  }

  return undefined;
}

function toStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {};
  }

  const result: Record<string, string> = {};

  for (const [key, mapValue] of Object.entries(value)) {
    if (typeof mapValue === 'string' && mapValue.trim() !== '') {
      result[key] = mapValue.trim();
    }
  }

  return result;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim());
}

export async function loadMappingFile(
  path: string | undefined,
): Promise<MappingDocument | undefined> {
  if (!path) {
    return undefined;
  }

  let rawContent = '';

  try {
    rawContent = await readFile(path, 'utf8');
  } catch {
    throw new CliError(`Não foi possível ler o arquivo de mapeamento: ${path}`, 2);
  }

  const extension = extname(path).toLowerCase();
  let parsed: unknown;

  try {
    if (extension === '.json') {
      parsed = JSON.parse(rawContent) as unknown;
    } else {
      parsed = parseYaml(rawContent);
    }
  } catch {
    throw new CliError(`Arquivo de mapeamento inválido: ${path}`, 2);
  }

  if (!isRecord(parsed)) {
    throw new CliError('Formato de mapeamento inválido. O conteúdo precisa ser um objeto.', 2);
  }

  const version = typeof parsed.version === 'number' ? parsed.version : Number.NaN;

  if (version !== 1) {
    throw new CliError('Versão de mapeamento não suportada. Utilize version: 1.', 2);
  }

  const mappings = toStringRecord(parsed.mappings);

  if (Object.keys(mappings).length === 0) {
    throw new CliError('Arquivo de mapeamento sem entradas em "mappings".', 2);
  }

  const idStrategy = parseIdStrategy(parsed.idStrategy);
  const name = typeof parsed.name === 'string' && parsed.name.trim() !== '' ? parsed.name.trim() : undefined;
  const result: MappingDocument = {
    version,
    mappings,
    extras: toStringArray(parsed.extras),
  };

  if (name) {
    result.name = name;
  }

  if (idStrategy) {
    result.idStrategy = idStrategy;
  }

  return result;
}

export interface MappingPlan {
  sourceToTarget: Map<number, string>;
  extraColumns: string[];
}

export function buildMappingPlan(
  headerColumns: readonly string[],
  mappingFile: MappingDocument | undefined,
  knownDwcTerms: readonly string[],
): MappingPlan {
  const sourceToTarget = new Map<number, string>();
  const knownTermsByNormalizedName = new Map<string, string>();

  for (const term of knownDwcTerms) {
    knownTermsByNormalizedName.set(normalizeColumnName(term), term);
  }

  const mappingsByNormalizedSource = new Map<string, string>();

  if (mappingFile) {
    for (const [source, target] of Object.entries(mappingFile.mappings)) {
      mappingsByNormalizedSource.set(normalizeColumnName(source), target);
    }
  }

  for (const [columnIndex, columnName] of headerColumns.entries()) {
    const normalizedColumnName = normalizeColumnName(columnName);
    const explicitTarget = mappingsByNormalizedSource.get(normalizedColumnName);

    if (explicitTarget) {
      sourceToTarget.set(columnIndex, explicitTarget);
      continue;
    }

    const inferredTarget = knownTermsByNormalizedName.get(normalizedColumnName);

    if (inferredTarget) {
      sourceToTarget.set(columnIndex, inferredTarget);
    }
  }

  const unmappedColumns = headerColumns.filter((_, index) => !sourceToTarget.has(index));

  if (!mappingFile || mappingFile.extras.length === 0) {
    return {
      sourceToTarget,
      extraColumns: [...unmappedColumns],
    };
  }

  const prioritizedExtras = mappingFile.extras.filter((entry) => headerColumns.includes(entry));
  const orderedExtras = [...new Set([...prioritizedExtras, ...unmappedColumns])];

  return {
    sourceToTarget,
    extraColumns: orderedExtras,
  };
}
