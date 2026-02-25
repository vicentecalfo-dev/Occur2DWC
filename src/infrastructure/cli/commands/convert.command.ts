import type { Command } from 'commander';

import type { CliDependencies } from '../cli-dependencies';

interface ConvertCommandOptions {
  input?: string;
  output?: string;
  profile?: string;
}

export function registerConvertCommand(program: Command, dependencies: CliDependencies): void {
  program
    .command('convert')
    .description('Converte dados de ocorrência para Darwin Core (stub do marco M0).')
    .option('-i, --input <path>', 'Caminho do arquivo de entrada')
    .option('-o, --output <path>', 'Caminho do arquivo de saída')
    .option('-p, --profile <name>', 'Perfil de conversão', 'dwc')
    .action(async (options: ConvertCommandOptions) => {
      await dependencies.convertHandler.execute({
        inputPath: options.input,
        outputPath: options.output,
        profile: options.profile,
      });
    });
}
