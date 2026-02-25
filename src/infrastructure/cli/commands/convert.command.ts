import type { Command } from 'commander';
import { InvalidArgumentError } from 'commander';

import type { CliDependencies } from '../cli-dependencies';
import type {
  ConvertEncoding,
  ConvertProfileName,
  ExtrasMode,
  IdStrategy,
  InputDelimiterOption,
  OutputDelimiterOption,
} from '../../../application/services/convert/types';

interface ConvertCommandOptions {
  in?: string;
  out?: string;
  map?: string;
  profile: ConvertProfileName;
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
}

export function registerConvertCommand(program: Command, dependencies: CliDependencies): void {
  const parseMaxErrors = (value: string): number => {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new InvalidArgumentError('A opção --max-errors precisa ser um inteiro positivo.');
    }

    return parsed;
  };

  const parseProfile = (value: string): ConvertProfileName => {
    if (
      value === 'minimal-occurrence' ||
      value === 'occurrence' ||
      value === 'cncflora-occurrence'
    ) {
      return value;
    }

    throw new InvalidArgumentError(
      'Perfil inválido. Use: minimal-occurrence, occurrence ou cncflora-occurrence.',
    );
  };

  const parseInputDelimiter = (value: string): InputDelimiterOption => {
    if (value === 'auto' || value === 'comma' || value === 'tab' || value === 'semicolon') {
      return value;
    }

    throw new InvalidArgumentError(
      'Delimitador de entrada inválido. Use: auto, comma, tab ou semicolon.',
    );
  };

  const parseOutputDelimiter = (value: string): OutputDelimiterOption => {
    if (value === 'tab' || value === 'comma') {
      return value;
    }

    throw new InvalidArgumentError('Delimitador de saída inválido. Use: tab ou comma.');
  };

  const parseEncoding = (value: string): ConvertEncoding => {
    if (value === 'utf8' || value === 'latin1') {
      return value;
    }

    throw new InvalidArgumentError('Encoding inválido. Use: utf8 ou latin1.');
  };

  const parseIdStrategy = (value: string): IdStrategy => {
    if (value === 'preserve' || value === 'uuid' || value === 'hash') {
      return value;
    }

    throw new InvalidArgumentError('id-strategy inválido. Use: preserve, uuid ou hash.');
  };

  const parseExtras = (value: string): ExtrasMode => {
    if (value === 'keep' || value === 'drop' || value === 'dynamicProperties') {
      return value;
    }

    throw new InvalidArgumentError('extras inválido. Use: keep, drop ou dynamicProperties.');
  };

  program
    .command('convert')
    .description('Converte dados de ocorrência para Darwin Core (Simple DwC).')
    .option('--in <path>', 'Arquivo de entrada (opcional; se ausente, lê de stdin)')
    .option('--out <path>', 'Arquivo de saída (obrigatório)')
    .option('--map <path>', 'Arquivo de mapeamento YAML/JSON')
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
      'Tratamento de colunas extras não DwC',
      parseExtras,
      'keep',
    )
    .option(
      '--normalize-html-entities',
      'Decodifica entidades HTML em campos de texto (ex.: &amp;)',
    )
    .action(async (options: ConvertCommandOptions) => {
      await dependencies.convertHandler.execute({
        inputPath: options.in,
        outputPath: options.out,
        mapPath: options.map,
        profile: options.profile,
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
      });
    });
}
