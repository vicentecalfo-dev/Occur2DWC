import { describe, expect, it } from 'vitest';

import { buildProgram } from '../../src/infrastructure/cli/build-program';

describe('profile fuzzy suggestion', () => {
  it('should suggest closest profile in convert command', async () => {
    const program = buildProgram({ version: '0.0.0-test' });

    await expect(
      program.parseAsync([
        'node',
        'occur2dwc',
        'convert',
        '--in',
        'in.csv',
        '--out',
        'out.tsv',
        '--profile',
        'occurrenc',
      ]),
    ).rejects.toMatchObject({
      message: expect.stringContaining('quis dizer: occurrence?'),
    });
  });

  it('should suggest closest profile in validate command', async () => {
    const program = buildProgram({ version: '0.0.0-test' });

    await expect(
      program.parseAsync([
        'node',
        'occur2dwc',
        'validate',
        '--in',
        'in.tsv',
        '--profile',
        'minimal-occurrenc',
      ]),
    ).rejects.toMatchObject({
      message: expect.stringContaining('quis dizer: minimal-occurrence?'),
    });
  });
});
