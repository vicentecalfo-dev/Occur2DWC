import type { CommandOutputPort } from '../../application/ports/command-output.port';
import {
  ConvertOccurrencesUseCase,
  type ConvertOccurrencesInput,
} from '../../application/use-cases/convert-occurrences.use-case';
import {
  InitProjectUseCase,
  type InitProjectInput,
} from '../../application/use-cases/init-project.use-case';
import {
  PackDatasetUseCase,
  type PackDatasetInput,
} from '../../application/use-cases/pack-dataset.use-case';
import {
  ValidateDatasetUseCase,
  type ValidateDatasetInput,
} from '../../application/use-cases/validate-dataset.use-case';
import { ConsoleOutputAdapter } from './presenters/console-output.adapter';

export interface ConvertCommandHandler {
  execute(input: ConvertOccurrencesInput): Promise<void>;
}

export interface ValidateCommandHandler {
  execute(input: ValidateDatasetInput): Promise<void>;
}

export interface PackCommandHandler {
  execute(input: PackDatasetInput): Promise<void>;
}

export interface InitCommandHandler {
  execute(input: InitProjectInput): Promise<void>;
}

export interface CliDependencies {
  convertHandler: ConvertCommandHandler;
  validateHandler: ValidateCommandHandler;
  packHandler: PackCommandHandler;
  initHandler: InitCommandHandler;
}

export function createCliDependencies(
  output: CommandOutputPort = new ConsoleOutputAdapter(),
): CliDependencies {
  return {
    convertHandler: new ConvertOccurrencesUseCase(output),
    validateHandler: new ValidateDatasetUseCase(output),
    packHandler: new PackDatasetUseCase(output),
    initHandler: new InitProjectUseCase(output),
  };
}
