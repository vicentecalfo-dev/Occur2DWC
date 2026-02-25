import type { Command } from 'commander';
import { InvalidArgumentError } from 'commander';

import type { CliDependencies } from '../cli-dependencies';
import type {
  ConvertEncoding,
  ConvertProfileName,
  InputDelimiterOption,
} from '../../../application/services/convert/types';
import type { LogFormat } from '../../../shared/logging/logger';

interface ValidateCommandOptions {
  in?: string;
  profile: ConvertProfileName;
  delimiter: InputDelimiterOption;
  encoding: ConvertEncoding;
  report?: string;
  strict?: boolean;
  maxErrors: number;
  logFormat: LogFormat;
  quiet?: boolean;
  verbose?: boolean;
}

function parseProfile(value: string): ConvertProfileName {
  if (value === 'minimal-occurrence' || value === 'occurrence' || value === 'cncflora-occurrence') {
    return value;
  }

  throw new InvalidArgumentError(
    'Perfil inválido. Use: minimal-occurrence, occurrence ou cncflora-occurrence.',
  );
}

function parseDelimiter(value: string): InputDelimiterOption {
  if (value === 'auto' || value === 'tab' || value === 'comma' || value === 'semicolon') {
    return value;
  }

  throw new InvalidArgumentError('Delimitador inválido. Use: auto, tab, comma ou semicolon.');
}

function parseEncoding(value: string): ConvertEncoding {
  if (value === 'utf8' || value === 'latin1') {
    return value;
  }

  throw new InvalidArgumentError('Encoding inválido. Use: utf8 ou latin1.');
}

function parseLogFormat(value: string): LogFormat {
  if (value === 'text' || value === 'json') {
    return value;
  }

  throw new InvalidArgumentError('Formato de log inválido. Use: text ou json.');
}

function parseMaxErrors(value: string): number {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new InvalidArgumentError('A opção --max-errors precisa ser um inteiro positivo.');
  }

  return parsed;
}

export function registerValidateCommand(program: Command, dependencies: CliDependencies): void {
  program
    .command('validate')
    .description('Valida arquivo CSV/TSV em perfil Simple DwC com relatório estruturado.')
    .option('--in <path>', 'Arquivo de entrada para validação (obrigatório)')
    .option(
      '--profile <minimal-occurrence|occurrence|cncflora-occurrence>',
      'Perfil de validação',
      parseProfile,
      'occurrence',
    )
    .option(
      '--delimiter <auto|tab|comma|semicolon>',
      'Delimitador de entrada',
      parseDelimiter,
      'auto',
    )
    .option('--encoding <utf8|latin1>', 'Codificação do arquivo', parseEncoding, 'utf8')
    .option('--report <path>', 'Caminho opcional para salvar relatório JSON')
    .option('--strict', 'Retorna erro (exit 1) se houver qualquer erro de validação')
    .option('--max-errors <n>', 'Máximo de issues coletadas no relatório', parseMaxErrors, 1000)
    .option('--log-format <text|json>', 'Formato de logs da validação', parseLogFormat, 'text')
    .option('--quiet', 'Silencia logs informativos e warnings')
    .option('--verbose', 'Exibe logs de debug')
    .action(async (options: ValidateCommandOptions) => {
      await dependencies.validateHandler.execute({
        inputPath: options.in,
        profile: options.profile,
        delimiter: options.delimiter,
        encoding: options.encoding,
        reportPath: options.report,
        strict: Boolean(options.strict),
        maxErrors: options.maxErrors,
        logFormat: options.logFormat,
        quiet: Boolean(options.quiet),
        verbose: Boolean(options.verbose),
      });
    });
}
