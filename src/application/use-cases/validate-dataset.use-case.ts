import type { CommandOutputPort } from '../ports/command-output.port';

export interface ValidateDatasetInput {
  inputPath: string | undefined;
  schemaPath: string | undefined;
  failFast: boolean;
}

export class ValidateDatasetUseCase {
  constructor(private readonly output: CommandOutputPort) {}

  async execute(input: ValidateDatasetInput): Promise<void> {
    const details = [
      `entrada: ${input.inputPath ?? 'não informada'}`,
      `schema: ${input.schemaPath ?? 'padrão'}`,
      `fail-fast: ${String(input.failFast)}`,
    ].join(' | ');

    this.output.info(`Comando validate ainda não implementado no marco M0. ${details}`);
  }
}
