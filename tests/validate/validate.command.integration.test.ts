import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

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

const validFixturePath = resolve('tests/fixtures/validate/valid.tsv');
const invalidFixturePath = resolve('tests/fixtures/validate/invalid.tsv');

describe('validate command integration', () => {
  it('should validate a valid fixture with exit 0', async () => {
    const output = new MemoryOutput();
    const dependencies = createCliDependencies(output);
    const program = buildProgram({ dependencies, version: '0.0.0-test' });

    await program.parseAsync(['node', 'occur2dwc', 'validate', '--in', validFixturePath]);

    expect(output.errors).toHaveLength(0);
    expect(output.infos.some((entry) => entry.includes('Validacao concluida'))).toBe(true);
  });

  it('should generate report for invalid fixture', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-validate-it-'));

    try {
      const reportPath = join(tempDir, 'report.json');
      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await program.parseAsync([
        'node',
        'occur2dwc',
        'validate',
        '--in',
        invalidFixturePath,
        '--report',
        reportPath,
        '--max-errors',
        '10',
      ]);

      const report = JSON.parse(await readFile(reportPath, 'utf8')) as {
        summary: {
          totalRows: number;
          errorRows: number;
          totalIssues: number;
          truncated: boolean;
        };
        issues: Array<{ severity: string }>;
      };

      expect(report.summary.totalRows).toBe(3);
      expect(report.summary.errorRows).toBeGreaterThan(0);
      expect(report.summary.totalIssues).toBeGreaterThan(0);
      expect(report.summary.truncated).toBe(false);
      expect(report.issues.some((issue) => issue.severity === 'error')).toBe(true);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should fail with exit code 1 in strict mode when errors exist', async () => {
    const output = new MemoryOutput();
    const dependencies = createCliDependencies(output);
    const program = buildProgram({ dependencies, version: '0.0.0-test' });

    await expect(
      program.parseAsync(['node', 'occur2dwc', 'validate', '--in', invalidFixturePath, '--strict']),
    ).rejects.toMatchObject({
      name: 'CliError',
      exitCode: 1,
    });
  });

  it('should stop at max-errors and mark report as truncated', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-validate-it-'));

    try {
      const reportPath = join(tempDir, 'report-truncated.json');
      const output = new MemoryOutput();
      const dependencies = createCliDependencies(output);
      const program = buildProgram({ dependencies, version: '0.0.0-test' });

      await program.parseAsync([
        'node',
        'occur2dwc',
        'validate',
        '--in',
        invalidFixturePath,
        '--report',
        reportPath,
        '--max-errors',
        '1',
      ]);

      const report = JSON.parse(await readFile(reportPath, 'utf8')) as {
        summary: {
          totalIssues: number;
          truncated: boolean;
        };
        issues: unknown[];
      };

      expect(report.summary.truncated).toBe(true);
      expect(report.summary.totalIssues).toBeGreaterThan(1);
      expect(report.issues).toHaveLength(1);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should emit JSON logs when log-format is json', async () => {
    const output = new MemoryOutput();
    const dependencies = createCliDependencies(output);
    const program = buildProgram({ dependencies, version: '0.0.0-test' });

    await program.parseAsync([
      'node',
      'occur2dwc',
      'validate',
      '--in',
      validFixturePath,
      '--log-format',
      'json',
    ]);

    const firstInfo = output.infos[0];
    if (!firstInfo) {
      throw new Error('Nenhum log JSON foi emitido.');
    }
    const parsed = JSON.parse(firstInfo) as {
      timestamp: string;
      level: string;
      message: string;
    };

    expect(parsed.level).toBe('info');
    expect(typeof parsed.timestamp).toBe('string');
  });
});
