import type { Command } from 'commander';

import type { CliDependencies } from '../cli-dependencies';
import type {
  ConvertEncoding,
  ConvertProfileName,
  InputDelimiterOption,
} from '../../../application/services/convert/types';
import type { LogFormat } from '../../../shared/logging/logger';
import {
  parseEncoding,
  parseInputDelimiter,
  parseLogFormat,
  parseMaxErrors,
  parseProfile,
} from './command-parsers';

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
  color?: boolean;
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
      parseInputDelimiter,
      'auto',
    )
    .option('--encoding <utf8|latin1>', 'Codificação do arquivo', parseEncoding, 'utf8')
    .option('--report <path>', 'Caminho opcional para salvar relatório JSON')
    .option('--strict', 'Retorna erro (exit 1) se houver qualquer erro de validação')
    .option('--max-errors <n>', 'Máximo de issues coletadas no relatório', parseMaxErrors, 1000)
    .option('--log-format <text|json>', 'Formato de logs da validação', parseLogFormat, 'text')
    .option('--quiet', 'Silencia logs informativos e warnings')
    .option('--verbose', 'Exibe logs de debug')
    .option('--no-color', 'Desativa colorização da saída')
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
