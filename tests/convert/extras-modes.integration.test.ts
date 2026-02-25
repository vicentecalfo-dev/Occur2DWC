import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { parseDelimitedLine } from '../../src/application/services/convert/delimited-text';
import { buildProgram } from '../../src/infrastructure/cli/build-program';
import { createCliDependencies } from '../../src/infrastructure/cli/cli-dependencies';

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

describe('convert extras modes', () => {
  it('should keep extras as additional columns when --extras keep', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-extras-it-'));

    try {
      const inputPath = join(tempDir, 'input.csv');
      const outputPath = join(tempDir, 'output-keep.tsv');

      await writeFile(
        inputPath,
        [
          'occurrenceid,scientificName,decimallatitude,decimallongitude,taxon_id,specialist_is_duplicated',
          'id-1,Mimosa pudica,-10.5,-52.3,1985,2',
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
        '--extras',
        'keep',
      ]);

      const outputLines = (await readFile(outputPath, 'utf8')).trim().split('\n');
      const header = parseDelimitedLine(outputLines[0] ?? '', '\t');

      expect(header.includes('taxon_id')).toBe(true);
      expect(header.includes('specialist_is_duplicated')).toBe(true);
      expect(header.includes('dynamicProperties')).toBe(false);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should drop extras when --extras drop', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-extras-it-'));

    try {
      const inputPath = join(tempDir, 'input.csv');
      const outputPath = join(tempDir, 'output-drop.tsv');

      await writeFile(
        inputPath,
        [
          'occurrenceid,scientificName,decimallatitude,decimallongitude,taxon_id,specialist_is_duplicated',
          'id-1,Mimosa pudica,-10.5,-52.3,1985,2',
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
        '--extras',
        'drop',
      ]);

      const outputLines = (await readFile(outputPath, 'utf8')).trim().split('\n');
      const header = parseDelimitedLine(outputLines[0] ?? '', '\t');

      expect(header.includes('taxon_id')).toBe(false);
      expect(header.includes('specialist_is_duplicated')).toBe(false);
      expect(header.includes('dynamicProperties')).toBe(false);
      expect(header.includes('occurrenceID')).toBe(true);
      expect(header.includes('scientificName')).toBe(true);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should use dynamicProperties by default when --extras is omitted', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-extras-it-'));

    try {
      const inputPath = join(tempDir, 'input.csv');
      const outputPath = join(tempDir, 'output-default.tsv');

      await writeFile(
        inputPath,
        [
          'occurrenceid,scientificName,decimallatitude,decimallongitude,taxon_id,taxon_flora_id,specialist_is_duplicated,blank_extra',
          'id-1,Mimosa pudica,-10.5,-52.3,1985,581919,2,',
        ].join('\n'),
        'utf8',
      );

      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await program.parseAsync(['node', 'occur2dwc', 'convert', '--in', inputPath, '--out', outputPath]);

      const outputLines = (await readFile(outputPath, 'utf8')).trim().split('\n');
      const header = parseDelimitedLine(outputLines[0] ?? '', '\t');
      const dataRow = parseDelimitedLine(outputLines[1] ?? '', '\t');
      const dynamicPropertiesIndex = header.indexOf('dynamicProperties');

      expect(dynamicPropertiesIndex).toBeGreaterThanOrEqual(0);
      expect(header.includes('taxon_id')).toBe(false);
      expect(header.includes('taxon_flora_id')).toBe(false);
      expect(header.includes('specialist_is_duplicated')).toBe(false);
      expect(header.includes('blank_extra')).toBe(false);

      const dynamicPropertiesRaw = dataRow[dynamicPropertiesIndex];
      if (!dynamicPropertiesRaw) {
        throw new Error('Campo dynamicProperties nao foi preenchido.');
      }

      const dynamicProperties = JSON.parse(dynamicPropertiesRaw) as Record<string, string>;
      expect(dynamicProperties).toEqual({
        specialist_is_duplicated: '2',
        taxon_flora_id: '581919',
        taxon_id: '1985',
      });
      expect(Object.keys(dynamicProperties)).toEqual([
        'specialist_is_duplicated',
        'taxon_flora_id',
        'taxon_id',
      ]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should keep dynamicProperties empty when there are no extras', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-extras-it-'));

    try {
      const inputPath = join(tempDir, 'input-no-extras.csv');
      const outputPath = join(tempDir, 'output-no-extras.tsv');

      await writeFile(
        inputPath,
        [
          'occurrenceid,scientificName,decimallatitude,decimallongitude',
          'id-1,Mimosa pudica,-10.5,-52.3',
        ].join('\n'),
        'utf8',
      );

      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await program.parseAsync(['node', 'occur2dwc', 'convert', '--in', inputPath, '--out', outputPath]);

      const outputLines = (await readFile(outputPath, 'utf8')).trim().split('\n');
      const header = parseDelimitedLine(outputLines[0] ?? '', '\t');
      const dataRow = parseDelimitedLine(outputLines[1] ?? '', '\t');
      const dynamicPropertiesIndex = header.indexOf('dynamicProperties');

      expect(dynamicPropertiesIndex).toBeGreaterThanOrEqual(0);
      expect(dataRow[dynamicPropertiesIndex]).toBe('');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
