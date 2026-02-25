import type { CommandOutputPort } from '../ports/command-output.port';

export interface InitProjectInput {
  force: boolean;
}

export class InitProjectUseCase {
  constructor(private readonly output: CommandOutputPort) {}

  async execute(input: InitProjectInput): Promise<void> {
    this.output.info(
      `Comando init ainda não implementado no marco M0. force: ${String(input.force)}`,
    );
  }
}
