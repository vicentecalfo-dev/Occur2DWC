import { mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join } from 'node:path';

import type { CommandOutputPort } from '../../application/ports/command-output.port';
import type {
  ConvertEncoding,
  InputDelimiterOption,
} from '../../application/services/convert/types';
import type { LogFormat } from '../../shared/logging/logger';
import { createLogger } from '../../shared/logging/logger';
import { CliError } from '../../shared/errors/cli-error';
import { DwcaPacker } from '../../dwca/DwcaPacker';

export interface PackUseCaseInput {
  inputPath: string | undefined;
  outputPath: string | undefined;
  core: 'occurrence';
  delimiter: InputDelimiterOption;
  encoding: ConvertEncoding;
  idField: string;
  metaOnly: boolean;
  emlPath: string | undefined;
  generateEml: boolean;
  datasetTitle: string | undefined;
  datasetDescription: string | undefined;
  publisher: string | undefined;
  logFormat: LogFormat;
  quiet: boolean;
  verbose: boolean;
}

function resolveMetaOnlyOutputPath(outputPath: string): string {
  const extension = extname(outputPath);
  const baseName = basename(outputPath, extension);
  return join(dirname(outputPath), `${baseName}.meta.xml`);
}

export class PackUseCase {
  private readonly dwcaPacker: DwcaPacker;

  constructor(
    private readonly output: CommandOutputPort,
    dwcaPacker: DwcaPacker = new DwcaPacker(),
  ) {
    this.dwcaPacker = dwcaPacker;
  }

  async execute(input: PackUseCaseInput): Promise<void> {
    if (!input.inputPath) {
      throw new CliError('A opção --in <path> é obrigatória para o comando pack.', 2);
    }

    if (!input.outputPath) {
      throw new CliError('A opção --out <path> é obrigatória para o comando pack.', 2);
    }

    if (input.core !== 'occurrence') {
      throw new CliError('O valor de --core suportado no momento é apenas occurrence.', 2);
    }

    const logger = createLogger(
      {
        format: input.logFormat,
        quiet: input.quiet,
        verbose: input.verbose,
      },
      {
        info: (message: string): void => this.output.info(message),
        warn: (message: string): void => {
          if (this.output.warn) {
            this.output.warn(message);
            return;
          }

          this.output.info(message);
        },
        error: (message: string): void => this.output.error(message),
        debug: (message: string): void => {
          if (this.output.debug) {
            this.output.debug(message);
            return;
          }

          this.output.info(message);
        },
      },
    );

    logger.info('Iniciando empacotamento DwC-A.', {
      input: input.inputPath,
      output: input.outputPath,
      core: input.core,
    });

    try {
      await mkdir(dirname(input.outputPath), { recursive: true });

      const result = await this.dwcaPacker.pack(
        {
          inputPath: input.inputPath,
          outputPath: input.outputPath,
          delimiter: input.delimiter,
          encoding: input.encoding,
          idField: input.idField,
          metaOnly: input.metaOnly,
          emlPath: input.emlPath,
          generateEml: input.generateEml,
          datasetTitle: input.datasetTitle,
          datasetDescription: input.datasetDescription,
          publisher: input.publisher,
        },
        logger,
      );

      if (input.metaOnly) {
        const metaOnlyPath = resolveMetaOnlyOutputPath(input.outputPath);
        await writeFile(metaOnlyPath, result.metaXml, 'utf8');
        logger.info('Arquivo meta.xml gerado em modo meta-only.', {
          path: metaOnlyPath,
          idIndex: result.idIndex,
        });
        return;
      }

      logger.info('Empacotamento DwC-A concluído com sucesso.', {
        output: input.outputPath,
        columns: result.headerColumns.length,
        idIndex: result.idIndex,
      });
    } catch (error) {
      if (error instanceof CliError) {
        throw error;
      }

      throw new CliError('Falha ao empacotar arquivo DwC-A.', 2);
    }
  }
}
