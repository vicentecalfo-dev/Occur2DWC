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
      '--in',
      'occurrences.csv',
      '--out',
      'dwc.csv',
      '--profile',
      'occurrence',
      '--input-delimiter',
      'auto',
      '--output-delimiter',
      'tab',
      '--encoding',
      'utf8',
      '--max-errors',
      '10',
      '--extras',
      'keep',
    ]);

    expect(dependencies.convertHandler.execute).toHaveBeenCalledWith({
      inputPath: 'occurrences.csv',
      outputPath: 'dwc.csv',
      mapPath: undefined,
      profile: 'occurrence',
      preset: 'auto',
      inputDelimiter: 'auto',
      outputDelimiter: 'tab',
      encoding: 'utf8',
      strict: false,
      reportPath: undefined,
      maxErrors: 10,
      idStrategy: undefined,
      deriveEventDate: false,
      extras: 'keep',
      normalizeHtmlEntities: false,
      logFormat: 'text',
      quiet: false,
      verbose: false,
    });
  });

  it('should use dynamicProperties as default extras mode in convert', async () => {
    const dependencies = createMockDependencies();
    const program = buildProgram({ dependencies, version: '0.0.0-test' });

    await program.parseAsync([
      'node',
      'occur2dwc',
      'convert',
      '--in',
      'occurrences.csv',
      '--out',
      'dwc.csv',
    ]);

    expect(dependencies.convertHandler.execute).toHaveBeenCalledWith({
      inputPath: 'occurrences.csv',
      outputPath: 'dwc.csv',
      mapPath: undefined,
      profile: 'occurrence',
      preset: 'auto',
      inputDelimiter: 'auto',
      outputDelimiter: 'tab',
      encoding: 'utf8',
      strict: false,
      reportPath: undefined,
      maxErrors: 1000,
      idStrategy: undefined,
      deriveEventDate: false,
      extras: 'dynamicProperties',
      normalizeHtmlEntities: false,
      logFormat: 'text',
      quiet: false,
      verbose: false,
    });
  });

  it('should delegate validate action to validate handler', async () => {
    const dependencies = createMockDependencies();
    const program = buildProgram({ dependencies, version: '0.0.0-test' });

    await program.parseAsync([
      'node',
      'occur2dwc',
      'validate',
      '--in',
      'dwc.tsv',
      '--profile',
      'minimal-occurrence',
      '--delimiter',
      'tab',
      '--encoding',
      'utf8',
      '--report',
      'report.json',
      '--strict',
      '--max-errors',
      '20',
      '--log-format',
      'json',
      '--quiet',
      '--verbose',
    ]);

    expect(dependencies.validateHandler.execute).toHaveBeenCalledWith({
      inputPath: 'dwc.tsv',
      profile: 'minimal-occurrence',
      delimiter: 'tab',
      encoding: 'utf8',
      reportPath: 'report.json',
      strict: true,
      maxErrors: 20,
      logFormat: 'json',
      quiet: true,
      verbose: true,
    });
  });

  it('should delegate pack action to pack handler', async () => {
    const dependencies = createMockDependencies();
    const program = buildProgram({ dependencies, version: '0.0.0-test' });

    await program.parseAsync([
      'node',
      'occur2dwc',
      'pack',
      '--in',
      'occurrence.tsv',
      '--out',
      'dwca.zip',
      '--core',
      'occurrence',
      '--delimiter',
      'tab',
      '--encoding',
      'utf8',
      '--id-field',
      'occurrenceID',
      '--meta-only',
      '--dataset-title',
      'Dataset Teste',
      '--dataset-description',
      'Descrição',
      '--publisher',
      'JBRJ',
      '--log-format',
      'json',
      '--quiet',
      '--verbose',
    ]);

    expect(dependencies.packHandler.execute).toHaveBeenCalledWith({
      inputPath: 'occurrence.tsv',
      outputPath: 'dwca.zip',
      core: 'occurrence',
      delimiter: 'tab',
      encoding: 'utf8',
      idField: 'occurrenceID',
      metaOnly: true,
      emlPath: undefined,
      generateEml: true,
      datasetTitle: 'Dataset Teste',
      datasetDescription: 'Descrição',
      publisher: 'JBRJ',
      logFormat: 'json',
      quiet: true,
      verbose: true,
    });
  });

  it('should delegate init action to init handler', async () => {
    const dependencies = createMockDependencies();
    const program = buildProgram({ dependencies, version: '0.0.0-test' });

    await program.parseAsync([
      'node',
      'occur2dwc',
      'init',
      '--dir',
      'meu-projeto',
      '--force',
      '--log-format',
      'json',
      '--quiet',
      '--verbose',
    ]);

    expect(dependencies.initHandler.execute).toHaveBeenCalledWith({
      directory: 'meu-projeto',
      force: true,
      logFormat: 'json',
      quiet: true,
      verbose: true,
    });
  });
});
