import type { Command } from 'commander';

import type { CliDependencies } from '../cli-dependencies';
import { parseLogFormat } from './command-parsers';
import type { LogFormat } from '../../../shared/logging/logger';

interface InitCommandOptions {
  dir?: string;
  force?: boolean;
  logFormat: LogFormat;
  quiet?: boolean;
  verbose?: boolean;
  color?: boolean;
}

export function registerInitCommand(program: Command, dependencies: CliDependencies): void {
  program
    .command('init')
    .description('Inicializa estrutura base de projeto para o fluxo Occur2DWC.')
    .option('--dir <path>', 'Diretório de destino (padrão: diretório atual)')
    .option('-f, --force', 'Sobrescreve arquivos locais existentes')
    .option('--log-format <text|json>', 'Formato de logs da inicialização', parseLogFormat, 'text')
    .option('--quiet', 'Silencia logs informativos e warnings')
    .option('--verbose', 'Exibe logs de debug')
    .option('--no-color', 'Desativa colorização da saída')
    .action(async (options: InitCommandOptions) => {
      await dependencies.initHandler.execute({
        directory: options.dir,
        force: Boolean(options.force),
        logFormat: options.logFormat,
        quiet: Boolean(options.quiet),
        verbose: Boolean(options.verbose),
      });
    });
}
