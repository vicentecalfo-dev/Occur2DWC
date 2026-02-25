import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

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

describe('init command integration', () => {
  it('should create project scaffold files', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-init-it-'));

    try {
      const targetDir = join(tempDir, 'project');
      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await program.parseAsync(['node', 'occur2dwc', 'init', '--dir', targetDir]);

      const expectedFiles = [
        'mapping.example.yml',
        'profiles/custom-profile.json',
        'examples/input.sample.csv',
        'examples/expected.simple.tsv',
        'examples/README.md',
        'eml.template.xml',
        'README.occur2dwc.md',
      ];

      for (const relativePath of expectedFiles) {
        await access(join(targetDir, relativePath));
      }

      const mappingContent = await readFile(join(targetDir, 'mapping.example.yml'), 'utf8');
      expect(mappingContent).toContain('idStrategy');
      expect(mappingContent).toContain('mappings:');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should not overwrite existing files without --force', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-init-it-'));

    try {
      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await program.parseAsync(['node', 'occur2dwc', 'init', '--dir', tempDir]);

      const mappingPath = join(tempDir, 'mapping.example.yml');
      await writeFile(mappingPath, '# conteudo customizado\\n', 'utf8');

      await program.parseAsync(['node', 'occur2dwc', 'init', '--dir', tempDir]);

      const mappingContent = await readFile(mappingPath, 'utf8');
      expect(mappingContent).toBe('# conteudo customizado\\n');
      expect(output.warns.some((entry) => entry.includes('--force'))).toBe(true);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
