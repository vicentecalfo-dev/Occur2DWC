import type { CommandOutputPort } from '../ports/command-output.port';
import { ValidateUseCase, type ValidateUseCaseInput } from '../../core/usecases/ValidateUseCase';

export type ValidateDatasetInput = ValidateUseCaseInput;

export class ValidateDatasetUseCase {
  private readonly validateUseCase: ValidateUseCase;

  constructor(output: CommandOutputPort) {
    this.validateUseCase = new ValidateUseCase(output);
  }

  async execute(input: ValidateDatasetInput): Promise<void> {
    await this.validateUseCase.execute(input);
  }
}
