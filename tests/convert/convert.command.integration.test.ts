import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildProgram } from '../../src/infrastructure/cli/build-program';
import { createCliDependencies } from '../../src/infrastructure/cli/cli-dependencies';
import { parseDelimitedLine } from '../../src/application/services/convert/delimited-text';

class MemoryOutput {
  readonly infos: string[] = [];
  readonly errors: string[] = [];

  info(message: string): void {
    this.infos.push(message);
  }

  error(message: string): void {
    this.errors.push(message);
  }
}

describe('convert command integration', () => {
  it('should convert rows with mapping and write report', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-it-'));

    try {
      const inputPath = join(tempDir, 'input.csv');
      const mappingPath = join(tempDir, 'mapping.yml');
      const outputPath = join(tempDir, 'output.tsv');
      const reportPath = join(tempDir, 'report.json');

      await writeFile(
        inputPath,
        [
          'occurrenceid,scientificName,day,month,year,decimallatitude,decimallongitude,category,fonte,locality',
          '1,Mimosa pudica,1,2,2024,-10.5,-52.3,nativa,planilha,"&amp; Mata"',
          ',Nome inválido,1,2,2024,91,-52.3,x,y,z',
        ].join('\n'),
        'utf8',
      );

      await writeFile(
        mappingPath,
        [
          'version: 1',
          'idStrategy: preserve',
          'mappings:',
          '  occurrenceid: occurrenceID',
          '  scientificName: scientificName',
          '  day: day',
          '  month: month',
          '  year: year',
          '  decimallatitude: decimalLatitude',
          '  decimallongitude: decimalLongitude',
          '  locality: locality',
          'extras:',
          '  - category',
          '  - fonte',
        ].join('\n'),
        'utf8',
      );

      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await program.parseAsync([
        'node',
        'occur2dwc',
        'convert',
        '--in',
        inputPath,
        '--out',
        outputPath,
        '--map',
        mappingPath,
        '--report',
        reportPath,
        '--derive-eventdate',
        '--normalize-html-entities',
        '--extras',
        'dynamicProperties',
      ]);

      const outputContent = await readFile(outputPath, 'utf8');
      const outputLines = outputContent.trim().split('\n');
      const parsedHeader = parseDelimitedLine(outputLines[0] ?? '', '\t');
      const parsedData = parseDelimitedLine(outputLines[1] ?? '', '\t');
      const dynamicPropertiesIndex = parsedHeader.indexOf('dynamicProperties');
      const reportContent = JSON.parse(await readFile(reportPath, 'utf8')) as {
        summary: {
          inputRows: number;
          outputRows: number;
          invalidRows: number;
          errorCount: number;
        };
      };

      expect(outputContent).toContain('occurrenceID\tscientificName');
      expect(outputContent).toContain('2024-02-01');
      expect(outputContent).toContain('& Mata');
      expect(dynamicPropertiesIndex).toBeGreaterThanOrEqual(0);

      const dynamicPropertiesRaw = parsedData[dynamicPropertiesIndex];
      if (!dynamicPropertiesRaw) {
        throw new Error('dynamicProperties não encontrado na saída.');
      }
      const dynamicProperties = JSON.parse(dynamicPropertiesRaw) as Record<string, string>;

      expect(dynamicProperties).toEqual({
        category: 'nativa',
        fonte: 'planilha',
      });

      expect(reportContent.summary.inputRows).toBe(2);
      expect(reportContent.summary.outputRows).toBe(1);
      expect(reportContent.summary.invalidRows).toBe(1);
      expect(reportContent.summary.errorCount).toBeGreaterThanOrEqual(1);

      expect(output.infos.some((entry) => entry.includes('Conversao concluida'))).toBe(true);
      expect(output.errors.length).toBe(1);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should fail with exit code 2 when --out is missing', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-it-'));

    try {
      const inputPath = join(tempDir, 'input.csv');
      await writeFile(
        inputPath,
        'occurrenceid,scientificName,decimallatitude,decimallongitude\n1,Mimosa pudica,-10.5,-52.3\n',
        'utf8',
      );

      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await expect(
        program.parseAsync(['node', 'occur2dwc', 'convert', '--in', inputPath]),
      ).rejects.toMatchObject({
        name: 'CliError',
        exitCode: 2,
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should fail with exit code 1 in strict mode when validation errors exist', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-it-'));

    try {
      const inputPath = join(tempDir, 'input.csv');
      const outputPath = join(tempDir, 'output.tsv');
      await writeFile(
        inputPath,
        'occurrenceid,scientificName,decimallatitude,decimallongitude\n,Nome inválido,100,-200\n',
        'utf8',
      );

      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await expect(
        program.parseAsync([
          'node',
          'occur2dwc',
          'convert',
          '--in',
          inputPath,
          '--out',
          outputPath,
          '--strict',
        ]),
      ).rejects.toMatchObject({
        name: 'CliError',
        exitCode: 1,
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
