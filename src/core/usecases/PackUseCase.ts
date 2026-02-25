import { mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join } from 'node:path';

import type { CommandOutputPort } from '../../application/ports/command-output.port';
import type {
  ConvertEncoding,
  InputDelimiterOption,
} from '../../application/services/convert/types';
import { CliError } from '../../shared/errors/cli-error';
import { formatExecutionSummary } from '../../shared/logging/execution-summary';
import type { LogFormat } from '../../shared/logging/logger';
import { createOutputLogger } from '../../shared/logging/output-logger';
import { createInterruptionGuard } from '../../shared/runtime/interruption-guard';
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
      throw new CliError('A opcao --in <path> e obrigatoria para o comando pack.', 2);
    }

    if (!input.outputPath) {
      throw new CliError('A opcao --out <path> e obrigatoria para o comando pack.', 2);
    }

    if (input.core !== 'occurrence') {
      throw new CliError('O valor de --core suportado no momento e apenas occurrence.', 2);
    }

    const logger = createOutputLogger(this.output, {
      format: input.logFormat,
      quiet: input.quiet,
      verbose: input.verbose,
    });
    const interruptionGuard = createInterruptionGuard();
    const startedAt = Date.now();

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
          isInterrupted: () => interruptionGuard.isInterrupted(),
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
      } else {
        logger.info('Empacotamento DwC-A concluido com sucesso.', {
          output: input.outputPath,
          columns: result.headerColumns.length,
          idIndex: result.idIndex,
        });
      }

      const durationMs = Date.now() - startedAt;
      if (input.logFormat === 'json') {
        logger.info('Resumo final da execucao.', {
          processedRows: result.processedRows,
          validRows: result.processedRows,
          warnings: result.warnings.length,
          errors: 0,
          durationMs,
        });
      } else {
        logger.info(
          formatExecutionSummary({
            processedRows: result.processedRows,
            validRows: result.processedRows,
            warnings: result.warnings.length,
            errors: 0,
            durationMs,
          }),
        );
      }
    } catch (error) {
      if (error instanceof CliError) {
        throw error;
      }

      const causeMessage = error instanceof Error ? error.message : 'erro desconhecido';
      throw new CliError(`Falha ao empacotar arquivo DwC-A. Causa: ${causeMessage}`, 2);
    } finally {
      interruptionGuard.dispose();
    }
  }
}
