import { describe, expect, it, vi } from 'vitest';

import { buildProgram } from '../src/infrastructure/cli/build-program';
import type { CliDependencies } from '../src/infrastructure/cli/cli-dependencies';

function createMockDependencies(): CliDependencies {
  return {
    convertHandler: {
      execute: vi.fn().mockResolvedValue(undefined),
    },
    validateHandler: {
      execute: vi.fn().mockResolvedValue(undefined),
    },
    packHandler: {
      execute: vi.fn().mockResolvedValue(undefined),
    },
    initHandler: {
      execute: vi.fn().mockResolvedValue(undefined),
    },
  };
}

describe('buildProgram', () => {
  it('should register expected commands', () => {
    const program = buildProgram({ version: '0.0.0-test' });
    const commandNames = program.commands.map((command) => command.name());

    expect(commandNames).toEqual(['convert', 'validate', 'pack', 'init']);
  });

  it('should render help with all subcommands', () => {
    const program = buildProgram({ version: '0.0.0-test' });
    const helpText = program.helpInformation();

    expect(helpText).toContain('convert');
    expect(helpText).toContain('validate');
    expect(helpText).toContain('pack');
    expect(helpText).toContain('init');
  });

  it('should delegate convert action to convert handler', async () => {
    const dependencies = createMockDependencies();
    const program = buildProgram({ dependencies, version: '0.0.0-test' });

    await program.parseAsync([
      'node',
      'occur2dwc',
      'convert',
      '--input',
      'occurrences.csv',
      '--output',
      'dwc.csv',
      '--profile',
      'dwc-a',
    ]);

    expect(dependencies.convertHandler.execute).toHaveBeenCalledWith({
      inputPath: 'occurrences.csv',
      outputPath: 'dwc.csv',
      profile: 'dwc-a',
    });
  });
});
