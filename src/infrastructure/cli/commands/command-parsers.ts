import { InvalidArgumentError } from 'commander';

import type {
  ConvertEncoding,
  ConvertMappingPreset,
  ConvertProfileName,
  ExtrasMode,
  IdStrategy,
  InputDelimiterOption,
  OutputDelimiterOption,
} from '../../../application/services/convert/types';
import type { LogFormat } from '../../../shared/logging/logger';
import { suggestClosestValue } from '../../../shared/text/fuzzy-match';

const PROFILE_OPTIONS: ConvertProfileName[] = [
  'minimal-occurrence',
  'occurrence',
  'cncflora-occurrence',
];

export function parseProfile(value: string): ConvertProfileName {
  if (value === 'minimal-occurrence' || value === 'occurrence' || value === 'cncflora-occurrence') {
    return value;
  }

  const suggestion = suggestClosestValue(value, PROFILE_OPTIONS);
  const suggestionMessage = suggestion ? ` Você quis dizer: ${suggestion}?` : '';

  throw new InvalidArgumentError(
    `Perfil inválido: ${value}.${suggestionMessage} Opções válidas: ${PROFILE_OPTIONS.join(', ')}.`,
  );
}

export function parseInputDelimiter(value: string): InputDelimiterOption {
  if (value === 'auto' || value === 'comma' || value === 'tab' || value === 'semicolon') {
    return value;
  }

  throw new InvalidArgumentError('Delimitador inválido. Use: auto, comma, tab ou semicolon.');
}

export function parseOutputDelimiter(value: string): OutputDelimiterOption {
  if (value === 'tab' || value === 'comma') {
    return value;
  }

  throw new InvalidArgumentError('Delimitador de saída inválido. Use: tab ou comma.');
}

export function parseEncoding(value: string): ConvertEncoding {
  if (value === 'utf8' || value === 'latin1') {
    return value;
  }

  throw new InvalidArgumentError('Encoding inválido. Use: utf8 ou latin1.');
}

export function parseMaxErrors(value: string): number {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new InvalidArgumentError('A opção --max-errors precisa ser um inteiro positivo.');
  }

  return parsed;
}

export function parseLogFormat(value: string): LogFormat {
  if (value === 'text' || value === 'json') {
    return value;
  }

  throw new InvalidArgumentError('Formato de log inválido. Use: text ou json.');
}

export function parseIdStrategy(value: string): IdStrategy {
  if (value === 'preserve' || value === 'uuid' || value === 'hash') {
    return value;
  }

  throw new InvalidArgumentError('id-strategy inválido. Use: preserve, uuid ou hash.');
}

export function parseExtras(value: string): ExtrasMode {
  if (value === 'keep' || value === 'drop' || value === 'dynamicProperties') {
    return value;
  }

  throw new InvalidArgumentError('extras inválido. Use: keep, drop ou dynamicProperties.');
}

export function parseConvertPreset(value: string): ConvertMappingPreset {
  if (value === 'auto' || value === 'cncflora-proflora' || value === 'none') {
    return value;
  }

  throw new InvalidArgumentError(
    'Preset inválido. Use: auto, cncflora-proflora ou none.',
  );
}
