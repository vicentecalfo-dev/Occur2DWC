import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import AdmZip from 'adm-zip';
import { describe, expect, it } from 'vitest';

import { buildProgram } from '../../src/infrastructure/cli/build-program';
import { createCliDependencies } from '../../src/infrastructure/cli/cli-dependencies';

class MemoryOutput {
  readonly infos: string[] = [];
  readonly warns: string[] = [];
  readonly errors: string[] = [];
  readonly debugs: string[] = [];

  info(message: string): void {
    this.infos.push(message);
  }

  warn(message: string): void {
    this.warns.push(message);
  }

  error(message: string): void {
    this.errors.push(message);
  }

  debug(message: string): void {
    this.debugs.push(message);
  }
}

const simpleFixturePath = resolve('tests/fixtures/expected.simple.tsv');

describe('pack command integration', () => {
  it('should create zip with occurrence.txt, meta.xml and eml.xml', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-pack-it-'));

    try {
      const zipPath = join(tempDir, 'dwca.zip');
      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await program.parseAsync([
        'node',
        'occur2dwc',
        'pack',
        '--in',
        simpleFixturePath,
        '--out',
        zipPath,
        '--dataset-title',
        'Dataset Teste',
      ]);

      const zip = new AdmZip(zipPath);
      const entries = zip
        .getEntries()
        .map((entry) => entry.entryName)
        .sort();

      expect(entries).toEqual(['eml.xml', 'meta.xml', 'occurrence.txt']);

      const occurrenceContent = zip.readAsText('occurrence.txt');
      const metaXmlContent = zip.readAsText('meta.xml');
      const emlXmlContent = zip.readAsText('eml.xml');

      expect(occurrenceContent.startsWith('occurrenceID\tscientificName')).toBe(true);
      expect(metaXmlContent).toContain('<location>occurrence.txt</location>');
      expect(metaXmlContent).toContain('<id index="0"/>');
      expect(emlXmlContent).toContain('<title>Dataset Teste</title>');

      expect(output.errors).toHaveLength(0);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should create deterministic meta.xml across runs', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-pack-it-'));

    try {
      const zipPath1 = join(tempDir, 'dwca-1.zip');
      const zipPath2 = join(tempDir, 'dwca-2.zip');

      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await program.parseAsync([
        'node',
        'occur2dwc',
        'pack',
        '--in',
        simpleFixturePath,
        '--out',
        zipPath1,
      ]);
      await program.parseAsync([
        'node',
        'occur2dwc',
        'pack',
        '--in',
        simpleFixturePath,
        '--out',
        zipPath2,
      ]);

      const meta1 = new AdmZip(zipPath1).readAsText('meta.xml');
      const meta2 = new AdmZip(zipPath2).readAsText('meta.xml');

      expect(meta1).toBe(meta2);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should fail with exit code 2 when id-field does not exist', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-pack-it-'));

    try {
      const zipPath = join(tempDir, 'dwca.zip');

      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await expect(
        program.parseAsync([
          'node',
          'occur2dwc',
          'pack',
          '--in',
          simpleFixturePath,
          '--out',
          zipPath,
          '--id-field',
          'customID',
        ]),
      ).rejects.toMatchObject({
        name: 'CliError',
        exitCode: 2,
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should generate only meta.xml when --meta-only is enabled', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-pack-it-'));

    try {
      const zipPath = join(tempDir, 'dwca.zip');

      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await program.parseAsync([
        'node',
        'occur2dwc',
        'pack',
        '--in',
        simpleFixturePath,
        '--out',
        zipPath,
        '--meta-only',
      ]);

      const metaOnlyPath = join(tempDir, 'dwca.meta.xml');
      const metaOnlyContent = await readFile(metaOnlyPath, 'utf8');

      expect(metaOnlyContent).toContain('<archive xmlns="http://rs.tdwg.org/dwc/text/">');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should use custom eml file when --eml is provided', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-pack-it-'));

    try {
      const zipPath = join(tempDir, 'dwca.zip');
      const emlPath = join(tempDir, 'custom.xml');
      await writeFile(
        emlPath,
        '<?xml version="1.0" encoding="UTF-8"?><eml:eml xmlns:eml="eml://ecoinformatics.org/eml-2.1.1"><dataset><title>EML Customizado</title></dataset></eml:eml>',
        'utf8',
      );

      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await program.parseAsync([
        'node',
        'occur2dwc',
        'pack',
        '--in',
        simpleFixturePath,
        '--out',
        zipPath,
        '--eml',
        emlPath,
      ]);

      const emlXmlContent = new AdmZip(zipPath).readAsText('eml.xml');
      expect(emlXmlContent).toContain('EML Customizado');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should skip eml.xml when --generate-eml false is provided', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-pack-it-'));

    try {
      const zipPath = join(tempDir, 'dwca-no-eml.zip');

      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await program.parseAsync([
        'node',
        'occur2dwc',
        'pack',
        '--in',
        simpleFixturePath,
        '--out',
        zipPath,
        '--generate-eml',
        'false',
      ]);

      const entries = new AdmZip(zipPath)
        .getEntries()
        .map((entry) => entry.entryName)
        .sort();
      expect(entries).toEqual(['meta.xml', 'occurrence.txt']);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should map unknown columns to dynamicProperties and emit warning', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-pack-it-'));

    try {
      const zipPath = join(tempDir, 'dwca-unknown.zip');
      const inputPath = join(tempDir, 'input.tsv');
      await writeFile(
        inputPath,
        'occurrenceID\tscientificName\tcolunaNaoMapeada\nid-1\tMimosa\tvalor-extra\n',
        'utf8',
      );

      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await program.parseAsync(['node', 'occur2dwc', 'pack', '--in', inputPath, '--out', zipPath]);

      const metaXmlContent = new AdmZip(zipPath).readAsText('meta.xml');
      expect(metaXmlContent).toContain('http://rs.tdwg.org/dwc/terms/dynamicProperties');
      expect(output.warns.some((entry) => entry.includes('não reconhecida'))).toBe(true);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should normalize blank lines while writing occurrence.txt', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-pack-it-'));

    try {
      const zipPath = join(tempDir, 'dwca-blank-lines.zip');
      const inputPath = join(tempDir, 'input.tsv');
      await writeFile(
        inputPath,
        '\noccurrenceID\tscientificName\nid-1\tMimosa\n\nid-2\tInga\n',
        'utf8',
      );

      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await program.parseAsync(['node', 'occur2dwc', 'pack', '--in', inputPath, '--out', zipPath]);

      const occurrenceContent = new AdmZip(zipPath).readAsText('occurrence.txt');
      expect(occurrenceContent).toBe('occurrenceID\tscientificName\nid-1\tMimosa\nid-2\tInga\n');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
