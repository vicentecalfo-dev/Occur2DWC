import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { parseDelimitedLine } from '../../src/application/services/convert/delimited-text';
import { buildProgram } from '../../src/infrastructure/cli/build-program';
import { createCliDependencies } from '../../src/infrastructure/cli/cli-dependencies';

class MemoryOutput {
  readonly infos: string[] = [];
  readonly warns: string[] = [];
  readonly errors: string[] = [];

  info(message: string): void {
    this.infos.push(message);
  }

  warn(message: string): void {
    this.warns.push(message);
  }

  error(message: string): void {
    this.errors.push(message);
  }
}

const profloraFixturePath = resolve('tests/fixtures/proflora.input.csv');

describe('convert with cncflora-proflora preset', () => {
  it('should auto-apply internal preset when header matches heuristic', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-proflora-it-'));

    try {
      const outputPath = join(tempDir, 'output.tsv');
      const reportPath = join(tempDir, 'report.json');
      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await program.parseAsync([
        'node',
        'occur2dwc',
        'convert',
        '--in',
        profloraFixturePath,
        '--out',
        outputPath,
        '--input-delimiter',
        'semicolon',
        '--report',
        reportPath,
      ]);

      const outputContent = await readFile(outputPath, 'utf8');
      const outputLines = outputContent.trim().split('\n');
      const header = parseDelimitedLine(outputLines[0] ?? '', '\t');
      const firstDataRow = parseDelimitedLine(outputLines[1] ?? '', '\t');
      const occurrenceIdIndex = header.indexOf('occurrenceID');
      const scientificNameIndex = header.indexOf('scientificName');
      const latitudeIndex = header.indexOf('decimalLatitude');

      expect(occurrenceIdIndex).toBeGreaterThanOrEqual(0);
      expect(scientificNameIndex).toBeGreaterThanOrEqual(0);
      expect(latitudeIndex).toBeGreaterThanOrEqual(0);

      expect(firstDataRow[occurrenceIdIndex]).toBe('PF-001');
      expect(firstDataRow[scientificNameIndex]).toBe('Mimosa pudica');
      expect(firstDataRow[latitudeIndex]).toBe('-10.5');

      const report = JSON.parse(await readFile(reportPath, 'utf8')) as {
        summary: {
          inputRows: number;
          outputRows: number;
          invalidRows: number;
          errorCount: number;
        };
      };

      expect(report.summary.inputRows).toBe(2);
      expect(report.summary.outputRows).toBe(2);
      expect(report.summary.invalidRows).toBe(0);
      expect(report.summary.errorCount).toBe(0);
      expect(
        output.infos.some((message) => message.includes('aplicado automaticamente com base no cabecalho')),
      ).toBe(true);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should keep default automap behavior when preset none is used', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-proflora-it-'));

    try {
      const outputPath = join(tempDir, 'output-none.tsv');
      const reportPath = join(tempDir, 'report-none.json');
      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await program.parseAsync([
        'node',
        'occur2dwc',
        'convert',
        '--in',
        profloraFixturePath,
        '--out',
        outputPath,
        '--input-delimiter',
        'semicolon',
        '--preset',
        'none',
        '--report',
        reportPath,
      ]);

      const report = JSON.parse(await readFile(reportPath, 'utf8')) as {
        summary: {
          outputRows: number;
          invalidRows: number;
          errorCount: number;
        };
        errors: Array<{
          code: string;
          field?: string;
        }>;
      };

      expect(report.summary.outputRows).toBe(0);
      expect(report.summary.invalidRows).toBeGreaterThan(0);
      expect(report.summary.errorCount).toBeGreaterThan(0);
      expect(
        report.errors.some(
          (issue) => issue.code === 'required_field_missing' && issue.field === 'occurrenceID',
        ),
      ).toBe(true);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
