import { createReadStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createInterface } from 'node:readline';

import { parseDelimitedLine } from '../../application/services/convert/delimited-text';
import { resolveInputDelimiterFromOption } from '../../application/services/convert/delimiters';
import { getConvertProfile, getKnownDwcTerms } from '../../application/services/convert/profiles';
import { normalizeColumnName } from '../../application/services/convert/text';
import type {
  ConvertEncoding,
  ConvertProfileName,
  InputDelimiterOption,
} from '../../application/services/convert/types';
import type { CommandOutputPort } from '../../application/ports/command-output.port';
import { CliError } from '../../shared/errors/cli-error';
import { createLogger, type LogFormat } from '../../shared/logging/logger';
import { IssueCollector } from '../../validation/IssueCollector';
import { ValidatorEngine } from '../../validation/ValidatorEngine';
import type { ValidationIssue, ValidationReport } from '../../validation/types';

export interface ValidateUseCaseInput {
  inputPath: string | undefined;
  profile: ConvertProfileName;
  delimiter: InputDelimiterOption;
  encoding: ConvertEncoding;
  reportPath: string | undefined;
  strict: boolean;
  maxErrors: number;
  logFormat: LogFormat;
  quiet: boolean;
  verbose: boolean;
}

function createOutputLogger(
  output: CommandOutputPort,
  format: LogFormat,
  quiet: boolean,
  verbose: boolean,
) {
  return createLogger(
    {
      format,
      quiet,
      verbose,
    },
    {
      info(message: string): void {
        output.info(message);
      },
      warn(message: string): void {
        if (output.warn) {
          output.warn(message);
          return;
        }

        output.info(message);
      },
      error(message: string): void {
        output.error(message);
      },
      debug(message: string): void {
        if (output.debug) {
          output.debug(message);
          return;
        }

        output.info(message);
      },
    },
  );
}

function toCanonicalHeaders(headerColumns: readonly string[]): string[] {
  const knownTermsByNormalizedName = new Map<string, string>();

  for (const term of getKnownDwcTerms()) {
    knownTermsByNormalizedName.set(normalizeColumnName(term), term);
  }

  return headerColumns.map((columnName) => {
    const normalizedName = normalizeColumnName(columnName);
    return knownTermsByNormalizedName.get(normalizedName) ?? columnName;
  });
}

function buildRowRecord(
  headers: readonly string[],
  values: readonly string[],
): Record<string, string> {
  const row: Record<string, string> = {};

  for (const [index, header] of headers.entries()) {
    row[header] = values[index]?.trim() ?? '';
  }

  return row;
}

function createColumnMismatchIssue(
  rowNumber: number,
  expectedColumns: number,
  receivedColumns: number,
): ValidationIssue {
  return {
    rowNumber,
    severity: 'error',
    code: 'column_mismatch',
    messagePtBr: `Número de colunas incompatível na linha ${rowNumber}. Esperado ${expectedColumns}, recebido ${receivedColumns}.`,
  };
}

export class ValidateUseCase {
  constructor(
    private readonly output: CommandOutputPort,
    private readonly validatorEngine: ValidatorEngine = new ValidatorEngine(),
  ) {}

  async execute(input: ValidateUseCaseInput): Promise<ValidationReport> {
    if (!input.inputPath) {
      throw new CliError('A opção --in <path> é obrigatória para o comando validate.', 2);
    }

    const logger = createOutputLogger(this.output, input.logFormat, input.quiet, input.verbose);
    const profile = getConvertProfile(input.profile);
    const issueCollector = new IssueCollector(input.maxErrors);
    const startDate = new Date();

    logger.info('Iniciando validação de arquivo.', {
      input: input.inputPath,
      profile: input.profile,
      maxErrors: input.maxErrors,
    });

    let delimiter: '\t' | ',' | ';' = ',';
    let headers: string[] | undefined;
    let canonicalHeaders: string[] = [];

    let totalRows = 0;
    let errorRows = 0;
    let warningRows = 0;

    const inputStream = createReadStream(input.inputPath, { encoding: input.encoding });
    const lineReader = createInterface({
      input: inputStream,
      crlfDelay: Infinity,
    });

    try {
      for await (const rawLine of lineReader) {
        if (!headers) {
          if (rawLine.trim() === '') {
            continue;
          }

          delimiter = resolveInputDelimiterFromOption(input.delimiter, rawLine);
          headers = parseDelimitedLine(rawLine, delimiter).map((value) =>
            value.replace(/^\uFEFF/, '').trim(),
          );
          canonicalHeaders = toCanonicalHeaders(headers);

          if (headers.length === 0 || headers.every((column) => column === '')) {
            throw new CliError('Cabeçalho inválido no arquivo de entrada.', 2);
          }

          logger.debug('Cabeçalho detectado.', {
            delimiter,
            columns: canonicalHeaders,
          });

          continue;
        }

        if (rawLine.trim() === '') {
          continue;
        }

        totalRows += 1;
        const rowValues = parseDelimitedLine(rawLine, delimiter);
        const row = buildRowRecord(canonicalHeaders, rowValues);
        const issues: ValidationIssue[] = [];

        if (rowValues.length !== canonicalHeaders.length) {
          issues.push(
            createColumnMismatchIssue(totalRows, canonicalHeaders.length, rowValues.length),
          );
        }

        issues.push(...this.validatorEngine.validateRow(totalRows, row, profile));

        const rowHasError = issues.some((issue) => issue.severity === 'error');
        const rowHasWarning = issues.some((issue) => issue.severity === 'warning');

        if (rowHasError) {
          errorRows += 1;
        }

        if (rowHasWarning) {
          warningRows += 1;
        }

        issueCollector.addMany(issues);

        if (issueCollector.isTruncated()) {
          logger.warn('Limite de issues atingido. A validação foi interrompida.', {
            maxErrors: input.maxErrors,
          });
          break;
        }
      }

      if (!headers) {
        throw new CliError('Arquivo sem cabeçalho válido para validação.', 2);
      }
    } catch (error) {
      if (error instanceof CliError) {
        throw error;
      }

      throw new CliError(`Falha ao validar arquivo: ${input.inputPath}`, 2);
    } finally {
      lineReader.close();
    }

    const endDate = new Date();
    const report: ValidationReport = {
      summary: {
        totalRows,
        errorRows,
        warningRows,
        totalIssues: issueCollector.getTotalIssues(),
        truncated: issueCollector.isTruncated(),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        durationMs: endDate.getTime() - startDate.getTime(),
        profile: input.profile,
        strict: input.strict,
        delimiter,
      },
      issues: issueCollector.getIssues(),
    };

    if (input.reportPath) {
      await mkdir(dirname(input.reportPath), { recursive: true });
      await writeFile(input.reportPath, JSON.stringify(report, null, 2), 'utf8');
      logger.info('Relatório de validação salvo.', {
        reportPath: input.reportPath,
      });
    }

    logger.info('Validação concluída.', report.summary);

    if (report.summary.errorRows > 0) {
      logger.warn('Foram encontrados erros de validação no arquivo.', {
        errorRows: report.summary.errorRows,
      });
    }

    if (input.strict && report.summary.errorRows > 0) {
      throw new CliError('Modo --strict ativo: erros de validação encontrados.', 1);
    }

    return report;
  }
}
