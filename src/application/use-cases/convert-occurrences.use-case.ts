import type { CommandOutputPort } from '../ports/command-output.port';

export interface ConvertOccurrencesInput {
  inputPath: string | undefined;
  outputPath: string | undefined;
  profile: string | undefined;
}

export class ConvertOccurrencesUseCase {
  constructor(private readonly output: CommandOutputPort) {}

  async execute(input: ConvertOccurrencesInput): Promise<void> {
    const details = [
      `entrada: ${input.inputPath ?? 'não informada'}`,
      `saída: ${input.outputPath ?? 'não informada'}`,
      `perfil: ${input.profile ?? 'dwc'}`,
    ].join(' | ');

    this.output.info(`Comando convert ainda não implementado no marco M0. ${details}`);
  }
}
