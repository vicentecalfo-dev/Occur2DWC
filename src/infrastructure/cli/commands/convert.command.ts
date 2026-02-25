import type { Command } from 'commander';

import type { CliDependencies } from '../cli-dependencies';
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
import {
  parseEncoding,
  parseConvertPreset,
  parseExtras,
  parseIdStrategy,
  parseInputDelimiter,
  parseLogFormat,
  parseMaxErrors,
  parseOutputDelimiter,
  parseProfile,
} from './command-parsers';

interface ConvertCommandOptions {
  in?: string;
  out?: string;
  map?: string;
  profile: ConvertProfileName;
  preset: ConvertMappingPreset;
  inputDelimiter: InputDelimiterOption;
  outputDelimiter: OutputDelimiterOption;
  encoding: ConvertEncoding;
  strict?: boolean;
  report?: string;
  maxErrors: number;
  idStrategy?: IdStrategy;
  deriveEventdate?: boolean;
  extras: ExtrasMode;
  normalizeHtmlEntities?: boolean;
  logFormat: LogFormat;
  quiet?: boolean;
  verbose?: boolean;
  color?: boolean;
}

export function registerConvertCommand(program: Command, dependencies: CliDependencies): void {
  program
    .command('convert')
    .description('Converte dados de ocorrência para Darwin Core (Simple DwC).')
    .option('--in <path>', 'Arquivo de entrada (opcional; se ausente, lê de stdin)')
    .option('--out <path>', 'Arquivo de saída (obrigatório)')
    .option('--map <path>', 'Arquivo de mapeamento YAML/JSON')
    .option(
      '--preset <auto|cncflora-proflora|none>',
      'Preset interno de mapeamento (padrao: auto)',
      parseConvertPreset,
      'auto',
    )
    .option(
      '--profile <minimal-occurrence|occurrence|cncflora-occurrence>',
      'Perfil de saída DwC',
      parseProfile,
      'occurrence',
    )
    .option(
      '--input-delimiter <auto|comma|tab|semicolon>',
      'Delimitador da entrada',
      parseInputDelimiter,
      'auto',
    )
    .option('--output-delimiter <tab|comma>', 'Delimitador da saída', parseOutputDelimiter, 'tab')
    .option('--encoding <utf8|latin1>', 'Codificação de entrada e saída', parseEncoding, 'utf8')
    .option('--strict', 'Falha se houver qualquer erro de validação')
    .option('--report <path>', 'Caminho para gravar relatório JSON da conversão')
    .option('--max-errors <n>', 'Máximo de erros no relatório', parseMaxErrors, 1000)
    .option(
      '--id-strategy <preserve|uuid|hash>',
      'Estratégia de geração de occurrenceID',
      parseIdStrategy,
    )
    .option('--derive-eventdate', 'Deriva eventDate (ISO-8601) a partir de day/month/year')
    .option(
      '--extras <keep|drop|dynamicProperties>',
      [
        'Define o tratamento de colunas nao mapeadas:',
        'keep              mantem como colunas adicionais',
        'drop              descarta completamente',
        'dynamicProperties empacota em JSON no campo dynamicProperties (padrao)',
      ].join('\n'),
      parseExtras,
      'dynamicProperties',
    )
    .option(
      '--normalize-html-entities',
      'Decodifica entidades HTML em campos de texto (ex.: &amp;)',
    )
    .option('--log-format <text|json>', 'Formato de logs da conversão', parseLogFormat, 'text')
    .option('--quiet', 'Silencia logs informativos e warnings')
    .option('--verbose', 'Exibe logs de debug')
    .option('--no-color', 'Desativa colorização da saída')
    .addHelpText(
      'after',
      [
        '',
        'Exemplos:',
        '  occur2dwc convert --in entrada.csv --out occurrence.tsv',
        '  occur2dwc convert --in dados.csv --out occurrence.tsv --input-delimiter semicolon --preset cncflora-proflora',
      ].join('\n'),
    )
    .action(async (options: ConvertCommandOptions) => {
      await dependencies.convertHandler.execute({
        inputPath: options.in,
        outputPath: options.out,
        mapPath: options.map,
        profile: options.profile,
        preset: options.preset,
        inputDelimiter: options.inputDelimiter,
        outputDelimiter: options.outputDelimiter,
        encoding: options.encoding,
        strict: Boolean(options.strict),
        reportPath: options.report,
        maxErrors: options.maxErrors,
        idStrategy: options.idStrategy,
        deriveEventDate: Boolean(options.deriveEventdate),
        extras: options.extras,
        normalizeHtmlEntities: Boolean(options.normalizeHtmlEntities),
        logFormat: options.logFormat,
        quiet: Boolean(options.quiet),
        verbose: Boolean(options.verbose),
      });
    });
}
