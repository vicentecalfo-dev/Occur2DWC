import type { CommandOutputPort } from '../ports/command-output.port';

export interface PackDatasetInput {
  sourcePath: string | undefined;
  targetPath: string | undefined;
}

export class PackDatasetUseCase {
  constructor(private readonly output: CommandOutputPort) {}

  async execute(input: PackDatasetInput): Promise<void> {
    const details = [
      `origem: ${input.sourcePath ?? 'não informada'}`,
      `destino: ${input.targetPath ?? 'não informado'}`,
    ].join(' | ');

    this.output.info(`Comando pack ainda não implementado no marco M0. ${details}`);
  }
}
