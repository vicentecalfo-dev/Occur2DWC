import type { Command } from 'commander';

import type { CliDependencies } from '../cli-dependencies';

interface InitCommandOptions {
  force?: boolean;
}

export function registerInitCommand(program: Command, dependencies: CliDependencies): void {
  program
    .command('init')
    .description('Inicializa estrutura local do projeto (stub do marco M0).')
    .option('-f, --force', 'Sobrescreve arquivos locais existentes')
    .action(async (options: InitCommandOptions) => {
      await dependencies.initHandler.execute({
        force: Boolean(options.force),
      });
    });
}
