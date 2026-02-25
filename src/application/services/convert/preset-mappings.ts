import cncfloraProfloraMappingAsset from '../../../mapping/default-mappings/cncflora-proflora-mapping.json';
import { CliError } from '../../../shared/errors/cli-error';
import type { MappingDocument } from './mapping';
import type { SupportedInternalPreset } from './preset-detector';

interface InternalMappingAsset {
  version: number;
  name?: string;
  mappings: Record<string, string>;
}

function toMappingDocument(asset: InternalMappingAsset): MappingDocument {
  if (asset.version !== 1) {
    throw new CliError('Preset interno de mapeamento invalido: versao nao suportada.', 2);
  }

  if (Object.keys(asset.mappings).length === 0) {
    throw new CliError('Preset interno de mapeamento invalido: sem entradas de mappings.', 2);
  }

  const mappingDocument: MappingDocument = {
    version: asset.version,
    mappings: { ...asset.mappings },
    extras: [],
  };

  if (asset.name) {
    mappingDocument.name = asset.name;
  }

  return mappingDocument;
}

export function getInternalMappingDocument(presetName: SupportedInternalPreset): MappingDocument {
  if (presetName === 'cncflora-proflora') {
    return toMappingDocument(cncfloraProfloraMappingAsset as InternalMappingAsset);
  }

  throw new CliError(`Preset interno nao suportado: ${presetName}`, 2);
}
