import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { ValidateUseCase } from '../../src/core/usecases/ValidateUseCase';

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

describe('ValidateUseCase strict mode', () => {
  it('should fail in strict mode when errors are present', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-vu-'));

    try {
      const inputPath = join(tempDir, 'input.tsv');
      await writeFile(
        inputPath,
        'occurrenceID\tscientificName\tdecimalLatitude\tdecimalLongitude\n\tNome\t10\t20\n',
        'utf8',
      );

      const output = new MemoryOutput();
      const useCase = new ValidateUseCase(output);

      await expect(
        useCase.execute({
          inputPath,
          profile: 'occurrence',
          delimiter: 'auto',
          encoding: 'utf8',
          reportPath: undefined,
          strict: true,
          maxErrors: 1000,
          logFormat: 'text',
          quiet: false,
          verbose: false,
        }),
      ).rejects.toMatchObject({
        name: 'CliError',
        exitCode: 1,
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should not fail when strict mode is disabled', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-vu-'));

    try {
      const inputPath = join(tempDir, 'input.tsv');
      await writeFile(
        inputPath,
        'occurrenceID\tscientificName\tdecimalLatitude\tdecimalLongitude\n\tNome\t10\t20\n',
        'utf8',
      );

      const output = new MemoryOutput();
      const useCase = new ValidateUseCase(output);

      await expect(
        useCase.execute({
          inputPath,
          profile: 'occurrence',
          delimiter: 'auto',
          encoding: 'utf8',
          reportPath: undefined,
          strict: false,
          maxErrors: 1000,
          logFormat: 'text',
          quiet: false,
          verbose: false,
        }),
      ).resolves.toBeDefined();
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
