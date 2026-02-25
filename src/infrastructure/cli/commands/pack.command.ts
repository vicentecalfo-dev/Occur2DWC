import type { Command } from 'commander';

import type { CliDependencies } from '../cli-dependencies';

interface PackCommandOptions {
  source?: string;
  target?: string;
}

export function registerPackCommand(program: Command, dependencies: CliDependencies): void {
  program
    .command('pack')
    .description('Empacota os artefatos de saída (stub do marco M0).')
    .option('-s, --source <path>', 'Caminho da pasta de origem')
    .option('-t, --target <path>', 'Caminho do arquivo de destino')
    .action(async (options: PackCommandOptions) => {
      await dependencies.packHandler.execute({
        sourcePath: options.source,
        targetPath: options.target,
      });
    });
}
