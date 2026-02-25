import type { Command } from 'commander';
import { InvalidArgumentError } from 'commander';

import type { CliDependencies } from '../cli-dependencies';
import type {
  ConvertEncoding,
  InputDelimiterOption,
} from '../../../application/services/convert/types';
import type { LogFormat } from '../../../shared/logging/logger';
import {
  parseEncoding,
  parseInputDelimiter,
  parseLogFormat,
} from './command-parsers';

interface PackCommandOptions {
  in?: string;
  out?: string;
  core: 'occurrence';
  delimiter: InputDelimiterOption;
  encoding: ConvertEncoding;
  idField: string;
  metaOnly?: boolean;
  eml?: string;
  generateEml?: boolean;
  datasetTitle?: string;
  datasetDescription?: string;
  publisher?: string;
  logFormat: LogFormat;
  quiet?: boolean;
  verbose?: boolean;
  color?: boolean;
}

function parseCore(value: string): 'occurrence' {
  if (value === 'occurrence') {
    return value;
  }

  throw new InvalidArgumentError('Core inválido. Use apenas occurrence.');
}

function parseGenerateEml(value: string): boolean {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new InvalidArgumentError('Valor inválido para --generate-eml. Use true ou false.');
}

export function registerPackCommand(program: Command, dependencies: CliDependencies): void {
  program
    .command('pack')
    .description('Empacota um arquivo Simple DwC em Darwin Core Archive (DwC-A).')
    .option('--in <path>', 'Arquivo de entrada Simple DwC (obrigatório)')
    .option('--out <path>', 'Caminho do arquivo .zip de saída (obrigatório)')
    .option('--core <occurrence>', 'Tipo do core (atual: occurrence)', parseCore, 'occurrence')
    .option(
      '--delimiter <auto|tab|comma|semicolon>',
      'Delimitador de entrada',
      parseInputDelimiter,
      'auto',
    )
    .option('--encoding <utf8|latin1>', 'Codificação do arquivo de entrada', parseEncoding, 'utf8')
    .option('--id-field <term>', 'Campo identificador no cabeçalho', 'occurrenceID')
    .option('--meta-only', 'Gera somente meta.xml ao lado do arquivo de saída para depuração')
    .option('--eml <path>', 'Arquivo EML customizado a ser incluído como eml.xml')
    .option(
      '--generate-eml <true|false>',
      'Gera eml.xml mínimo quando --eml não é informado',
      parseGenerateEml,
      true,
    )
    .option('--dataset-title <string>', 'Título do dataset para o EML gerado')
    .option('--dataset-description <string>', 'Descrição do dataset para o EML gerado')
    .option('--publisher <string>', 'Publicador para o EML gerado')
    .option('--log-format <text|json>', 'Formato dos logs', parseLogFormat, 'text')
    .option('--quiet', 'Silencia logs informativos e warnings')
    .option('--verbose', 'Exibe logs de debug')
    .option('--no-color', 'Desativa colorização da saída')
    .action(async (options: PackCommandOptions) => {
      await dependencies.packHandler.execute({
        inputPath: options.in,
        outputPath: options.out,
        core: options.core,
        delimiter: options.delimiter,
        encoding: options.encoding,
        idField: options.idField,
        metaOnly: Boolean(options.metaOnly),
        emlPath: options.eml,
        generateEml: options.generateEml !== false,
        datasetTitle: options.datasetTitle,
        datasetDescription: options.datasetDescription,
        publisher: options.publisher,
        logFormat: options.logFormat,
        quiet: Boolean(options.quiet),
        verbose: Boolean(options.verbose),
      });
    });
}
