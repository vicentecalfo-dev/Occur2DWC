import { once } from 'node:events';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createInterface } from 'node:readline';
import type { Readable, Writable } from 'node:stream';

import { deriveEventDate } from '../services/convert/date-derive';
import { parseDelimitedLine, formatDelimitedLine } from '../services/convert/delimited-text';
import {
  resolveInputDelimiterFromOption,
  resolveOutputDelimiterFromOption,
} from '../services/convert/delimiters';
import { applyIdStrategy } from '../services/convert/identifiers';
import { buildMappingPlan, loadMappingFile } from '../services/convert/mapping';
import { getConvertProfile, getKnownDwcTerms } from '../services/convert/profiles';
import { normalizeCellValue } from '../services/convert/text';
import type {
  ConvertEncoding,
  ConvertProfileName,
  ConvertReport,
  ConvertValidationError,
  ExtrasMode,
  IdStrategy,
  InputDelimiterOption,
  OutputDelimiterOption,
} from '../services/convert/types';
import { validateOccurrenceRow } from '../services/convert/validation';
import type { CommandOutputPort } from '../ports/command-output.port';
import { CliError } from '../../shared/errors/cli-error';

export interface ConvertOccurrencesInput {
  inputPath: string | undefined;
  outputPath: string | undefined;
  mapPath: string | undefined;
  profile: ConvertProfileName;
  inputDelimiter: InputDelimiterOption;
  outputDelimiter: OutputDelimiterOption;
  encoding: ConvertEncoding;
  strict: boolean;
  reportPath: string | undefined;
  maxErrors: number;
  idStrategy: IdStrategy | undefined;
  deriveEventDate: boolean;
  extras: ExtrasMode;
  normalizeHtmlEntities: boolean;
}

function appendValidationErrors(
  target: ConvertValidationError[],
  errors: readonly ConvertValidationError[],
  maxErrors: number,
): void {
  if (target.length >= maxErrors) {
    return;
  }

  const availableSlots = maxErrors - target.length;
  target.push(...errors.slice(0, availableSlots));
}

function resolveOutputColumns(
  profileColumns: readonly string[],
  extraColumns: readonly string[],
  extrasMode: ExtrasMode,
): string[] {
  if (extrasMode === 'drop') {
    return [...profileColumns];
  }

  if (extrasMode === 'dynamicProperties') {
    if (profileColumns.includes('dynamicProperties')) {
      return [...profileColumns];
    }

    return [...profileColumns, 'dynamicProperties'];
  }

  return [...profileColumns, ...extraColumns];
}

async function writeLine(outputStream: Writable, line: string): Promise<void> {
  if (outputStream.write(`${line}\n`)) {
    return;
  }

  await once(outputStream, 'drain');
}

function createInputStream(inputPath: string | undefined, encoding: ConvertEncoding): Readable {
  if (inputPath) {
    return createReadStream(inputPath, { encoding });
  }

  if (process.stdin.isTTY) {
    throw new CliError(
      'Nenhuma entrada detectada em stdin. Informe --in <arquivo> ou use pipe.',
      2,
    );
  }

  process.stdin.setEncoding(encoding);
  return process.stdin;
}

function createDynamicPropertiesValue(extraValues: Record<string, string>): string {
  const normalizedEntries = Object.entries(extraValues).filter(([, value]) => value !== '');

  if (normalizedEntries.length === 0) {
    return '';
  }

  return JSON.stringify(Object.fromEntries(normalizedEntries));
}

export class ConvertOccurrencesUseCase {
  constructor(private readonly output: CommandOutputPort) {}

  async execute(input: ConvertOccurrencesInput): Promise<void> {
    if (!input.outputPath) {
      throw new CliError('A opção --out <path> é obrigatória para o comando convert.', 2);
    }

    const mappingFile = await loadMappingFile(input.mapPath);
    const profile = getConvertProfile(input.profile);
    const knownDwcTerms = getKnownDwcTerms();
    const effectiveIdStrategy = input.idStrategy ?? mappingFile?.idStrategy ?? 'preserve';

    const outputDelimiter = resolveOutputDelimiterFromOption(input.outputDelimiter);
    const inputStream = createInputStream(input.inputPath, input.encoding);

    await mkdir(dirname(input.outputPath), { recursive: true });

    const outputStream = createWriteStream(input.outputPath, {
      encoding: input.encoding,
    });

    const reportErrors: ConvertValidationError[] = [];
    let totalErrorCount = 0;
    let inputRows = 0;
    let outputRows = 0;
    let invalidRows = 0;

    let headerColumns: string[] | undefined;
    let inputDelimiter: '\t' | ',' | ';' = ',';
    let outputColumns: string[] = [];
    let mappingPlan: ReturnType<typeof buildMappingPlan> | undefined;

    const lineReader = createInterface({
      input: inputStream,
      crlfDelay: Infinity,
    });

    try {
      for await (const rawLine of lineReader) {
        if (!headerColumns) {
          if (rawLine.trim() === '') {
            continue;
          }

          inputDelimiter = resolveInputDelimiterFromOption(input.inputDelimiter, rawLine);
          headerColumns = parseDelimitedLine(rawLine, inputDelimiter).map((value) =>
            value.replace(/^\uFEFF/, '').trim(),
          );

          if (headerColumns.length === 0 || headerColumns.every((column) => column === '')) {
            throw new CliError('Cabeçalho inválido na entrada.', 2);
          }

          mappingPlan = buildMappingPlan(headerColumns, mappingFile, knownDwcTerms);
          outputColumns = resolveOutputColumns(
            profile.outputColumns,
            mappingPlan.extraColumns,
            input.extras,
          );

          await writeLine(outputStream, formatDelimitedLine(outputColumns, outputDelimiter));
          continue;
        }

        if (rawLine.trim() === '') {
          continue;
        }

        inputRows += 1;

        const rowValues = parseDelimitedLine(rawLine, inputDelimiter);
        const mappedValues: Record<string, string> = {};
        const extraValues: Record<string, string> = {};
        const rowErrors: ConvertValidationError[] = [];

        if (rowValues.length !== headerColumns.length) {
          rowErrors.push({
            row: inputRows,
            code: 'column_mismatch',
            message: `Número de colunas incompatível na linha ${inputRows}. Esperado ${headerColumns.length}, recebido ${rowValues.length}.`,
          });
        }

        for (const [index, columnName] of headerColumns.entries()) {
          const value = normalizeCellValue(rowValues[index] ?? '', input.normalizeHtmlEntities);
          const targetField = mappingPlan?.sourceToTarget.get(index);

          if (targetField) {
            mappedValues[targetField] = value;
            continue;
          }

          extraValues[columnName] = value;
        }

        if (input.deriveEventDate && !mappedValues.eventDate) {
          const derivedEventDate = deriveEventDate(
            mappedValues.day,
            mappedValues.month,
            mappedValues.year,
          );

          if (derivedEventDate) {
            mappedValues.eventDate = derivedEventDate;
          }
        }

        applyIdStrategy(effectiveIdStrategy, mappedValues, inputRows);
        rowErrors.push(...validateOccurrenceRow(inputRows, mappedValues, profile));

        if (rowErrors.length > 0) {
          invalidRows += 1;
          totalErrorCount += rowErrors.length;
          appendValidationErrors(reportErrors, rowErrors, input.maxErrors);
          continue;
        }

        const dynamicPropertiesValue =
          input.extras === 'dynamicProperties' ? createDynamicPropertiesValue(extraValues) : '';

        const outputValues = outputColumns.map((column) => {
          if (input.extras === 'keep' && Object.hasOwn(extraValues, column)) {
            return extraValues[column] ?? '';
          }

          if (column === 'dynamicProperties' && input.extras === 'dynamicProperties') {
            return dynamicPropertiesValue;
          }

          return mappedValues[column] ?? '';
        });

        await writeLine(outputStream, formatDelimitedLine(outputValues, outputDelimiter));
        outputRows += 1;
      }

      if (!headerColumns) {
        throw new CliError('Entrada sem cabeçalho. Informe um CSV/TSV válido.', 2);
      }
    } finally {
      lineReader.close();
      outputStream.end();
      await once(outputStream, 'finish');
    }

    const report: ConvertReport = {
      summary: {
        inputRows,
        outputRows,
        invalidRows,
        errorCount: totalErrorCount,
        profile: input.profile,
        strict: input.strict,
        idStrategy: effectiveIdStrategy,
        extrasMode: input.extras,
        inputDelimiter,
        outputDelimiter,
      },
      errors: reportErrors,
    };

    if (input.reportPath) {
      await mkdir(dirname(input.reportPath), { recursive: true });
      await writeFile(input.reportPath, JSON.stringify(report, null, 2), 'utf8');
    }

    this.output.info(
      `Conversão concluída. Linhas lidas: ${inputRows}. Linhas válidas: ${outputRows}. Linhas inválidas: ${invalidRows}.`,
    );

    if (totalErrorCount > 0) {
      this.output.error(
        `Foram encontrados ${totalErrorCount} erro(s) de validação durante a conversão.`,
      );
    }

    if (input.strict && totalErrorCount > 0) {
      throw new CliError('Modo --strict ativo: a conversão falhou devido a erros de validação.', 1);
    }
  }
}
