import { CommanderError } from 'commander';

import { CliError } from '../../shared/errors/cli-error';
import { createCliDependencies, type CliDependencies } from './cli-dependencies';
import { resolveCliRuntimeOptions, type CliRuntimeOptions } from './cli-runtime-options';
import { buildProgram } from './build-program';
import { ConsoleOutputAdapter } from './presenters/console-output.adapter';

export interface RunCliOptions {
  dependencies?: CliDependencies;
  runtimeOptions?: CliRuntimeOptions;
}

function normalizeCommanderError(message: string): string {
  return message.replace(/^error:\s*/i, '').trim();
}

export async function runCli(
  argv: string[] = process.argv,
  options: RunCliOptions = {},
): Promise<void> {
  const runtimeOptions = options.runtimeOptions ?? resolveCliRuntimeOptions(argv);
  const dependencies =
    options.dependencies ??
    createCliDependencies(new ConsoleOutputAdapter({ useColor: runtimeOptions.colorEnabled }));
  const program = buildProgram({ dependencies });

  try {
    await program.parseAsync(argv);
  } catch (error) {
    if (error instanceof CommanderError) {
      if (error.code === 'commander.helpDisplayed' || error.code === 'commander.version') {
        return;
      }

      throw new CliError(normalizeCommanderError(error.message), 2);
    }

    throw error;
  }
}
