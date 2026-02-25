import type { CommandOutputPort } from '../ports/command-output.port';
import { PackUseCase, type PackUseCaseInput } from '../../core/usecases/PackUseCase';

export type PackDatasetInput = PackUseCaseInput;

export class PackDatasetUseCase {
  private readonly packUseCase: PackUseCase;

  constructor(output: CommandOutputPort) {
    this.packUseCase = new PackUseCase(output);
  }

  async execute(input: PackDatasetInput): Promise<void> {
    await this.packUseCase.execute(input);
  }
}
