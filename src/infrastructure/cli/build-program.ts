import { Command } from 'commander';

import {
  DEFAULT_VERSION,
  PROJECT_BRAND,
  PROJECT_DESCRIPTION,
  PROJECT_NAME,
} from '../config/project-metadata';
import { createCliDependencies, type CliDependencies } from './cli-dependencies';
import { registerConvertCommand } from './commands/convert.command';
import { registerInitCommand } from './commands/init.command';
import { registerPackCommand } from './commands/pack.command';
import { registerValidateCommand } from './commands/validate.command';

export interface BuildProgramOptions {
  dependencies?: CliDependencies;
  version?: string;
}

export function buildProgram(options: BuildProgramOptions = {}): Command {
  const dependencies = options.dependencies ?? createCliDependencies();

  const program = new Command();

  program
    .name(PROJECT_NAME)
    .description(`${PROJECT_BRAND}: ${PROJECT_DESCRIPTION}`)
    .version(options.version ?? process.env.npm_package_version ?? DEFAULT_VERSION);

  registerConvertCommand(program, dependencies);
  registerValidateCommand(program, dependencies);
  registerPackCommand(program, dependencies);
  registerInitCommand(program, dependencies);

  return program;
}
