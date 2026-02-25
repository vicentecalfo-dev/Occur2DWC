import { once } from 'node:events';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { PassThrough } from 'node:stream';

import { ArchiverZipWriter } from '../adapters/zip/ZipWriter';
import type { ZipWriter } from '../adapters/zip/ZipWriter';
import { formatDelimitedLine, parseDelimitedLine } from '../application/services/convert/delimited-text';
import { resolveInputDelimiterFromOption } from '../application/services/convert/delimiters';
import type { ConvertEncoding, InputDelimiterOption } from '../application/services/convert/types';
import { CliError } from '../shared/errors/cli-error';
import type { Logger } from '../shared/logging/logger';
import { EmlBuilder } from './EmlBuilder';
import { MetaXmlBuilder } from './MetaXmlBuilder';

export interface DwcaPackOptions {
  inputPath: string;
  outputPath: string;
  delimiter: InputDelimiterOption;
  encoding: ConvertEncoding;
  idField: string;
  metaOnly: boolean;
  emlPath: string | undefined;
  generateEml: boolean;
  datasetTitle: string | undefined;
  datasetDescription: string | undefined;
  publisher: string | undefined;
  isInterrupted?: () => boolean;
}

export interface DwcaPackResult {
  headerColumns: string[];
  idIndex: number;
  metaXml: string;
  warnings: string[];
  processedRows: number;
}

export interface HeaderScanResult {
  headerColumns: string[];
  idIndex: number;
  delimiter: '\t' | ',' | ';';
}

function assertNotInterrupted(isInterrupted: (() => boolean) | undefined): void {
  if (isInterrupted?.()) {
    throw new CliError('Execucao interrompida pelo usuario.', 130);
  }
}

export async function scanDwcaInputHeader(
  inputPath: string,
  delimiterOption: InputDelimiterOption,
  encoding: ConvertEncoding,
  idField: string,
  isInterrupted?: () => boolean,
): Promise<HeaderScanResult> {
  const inputStream = createReadStream(inputPath, { encoding });
  const lineReader = createInterface({ input: inputStream, crlfDelay: Infinity });

  try {
    for await (const rawLine of lineReader) {
      assertNotInterrupted(isInterrupted);

      if (rawLine.trim() === '') {
        continue;
      }

      const delimiter = resolveInputDelimiterFromOption(delimiterOption, rawLine);
      const headerColumns = parseDelimitedLine(rawLine, delimiter).map((column) =>
        column.replace(/^\uFEFF/, '').trim(),
      );

      if (headerColumns.length === 0 || headerColumns.every((column) => column === '')) {
        throw new CliError('Cabecalho invalido no arquivo de entrada.', 2);
      }

      const idIndex = headerColumns.indexOf(idField);

      if (idIndex < 0) {
        throw new CliError(
          `Campo de ID "${idField}" nao encontrado no cabecalho do arquivo de entrada.`,
          2,
        );
      }

      return {
        headerColumns,
        idIndex,
        delimiter,
      };
    }

    throw new CliError('Arquivo de entrada sem cabecalho valido.', 2);
  } finally {
    lineReader.close();
    inputStream.destroy();
  }
}

async function streamOccurrenceAsTsv(
  zipWriter: ZipWriter,
  inputPath: string,
  delimiter: '\t' | ',' | ';',
  encoding: ConvertEncoding,
  isInterrupted?: () => boolean,
): Promise<number> {
  const inputStream = createReadStream(inputPath, { encoding });
  const lineReader = createInterface({ input: inputStream, crlfDelay: Infinity });
  const occurrenceStream = new PassThrough();

  zipWriter.addStream('occurrence.txt', occurrenceStream);

  let headerWritten = false;
  let rowsWritten = 0;

  try {
    for await (const rawLine of lineReader) {
      assertNotInterrupted(isInterrupted);

      if (!headerWritten && rawLine.trim() === '') {
        continue;
      }

      if (rawLine.trim() === '') {
        continue;
      }

      const values = parseDelimitedLine(rawLine, delimiter);

      if (!occurrenceStream.write(`${formatDelimitedLine(values, '\t')}\n`, 'utf8')) {
        await once(occurrenceStream, 'drain');
      }

      if (headerWritten) {
        rowsWritten += 1;
      }

      headerWritten = true;
    }

    return rowsWritten;
  } finally {
    lineReader.close();
    inputStream.destroy();
    occurrenceStream.end();
  }
}

export class DwcaPacker {
  private readonly metaXmlBuilder: MetaXmlBuilder;

  private readonly emlBuilder: EmlBuilder;

  constructor(
    metaXmlBuilder: MetaXmlBuilder = new MetaXmlBuilder(),
    emlBuilder: EmlBuilder = new EmlBuilder(),
  ) {
    this.metaXmlBuilder = metaXmlBuilder;
    this.emlBuilder = emlBuilder;
  }

  async pack(options: DwcaPackOptions, logger: Logger): Promise<DwcaPackResult> {
    const headerScan = await scanDwcaInputHeader(
      options.inputPath,
      options.delimiter,
      options.encoding,
      options.idField,
      options.isInterrupted,
    );

    const metaResult = this.metaXmlBuilder.build({
      headerColumns: headerScan.headerColumns,
      idField: options.idField,
    });

    for (const warning of metaResult.warnings) {
      logger.warn(warning);
    }

    if (options.metaOnly) {
      return {
        headerColumns: headerScan.headerColumns,
        idIndex: metaResult.idIndex,
        metaXml: metaResult.xml,
        warnings: metaResult.warnings,
        processedRows: 0,
      };
    }

    const zipWriter = new ArchiverZipWriter(options.outputPath);

    try {
      const processedRows = await streamOccurrenceAsTsv(
        zipWriter,
        options.inputPath,
        headerScan.delimiter,
        options.encoding,
        options.isInterrupted,
      );

      assertNotInterrupted(options.isInterrupted);
      zipWriter.addString('meta.xml', metaResult.xml);

      if (options.emlPath) {
        zipWriter.addFile(options.emlPath, 'eml.xml');
      } else if (options.generateEml) {
        const emlXml = this.emlBuilder.build({
          datasetTitle: options.datasetTitle,
          datasetDescription: options.datasetDescription,
          publisher: options.publisher,
        });
        zipWriter.addString('eml.xml', emlXml);
      }

      assertNotInterrupted(options.isInterrupted);
      await zipWriter.finalize();

      return {
        headerColumns: headerScan.headerColumns,
        idIndex: metaResult.idIndex,
        metaXml: metaResult.xml,
        warnings: metaResult.warnings,
        processedRows,
      };
    } catch (error) {
      await zipWriter.abort();
      throw error;
    }
  }
}
