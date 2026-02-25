import type { Command } from 'commander';

import type { CliDependencies } from '../cli-dependencies';

interface ValidateCommandOptions {
  input?: string;
  schema?: string;
  failFast?: boolean;
}

export function registerValidateCommand(program: Command, dependencies: CliDependencies): void {
  program
    .command('validate')
    .description('Valida dados de ocorrência e estrutura DwC (stub do marco M0).')
    .option('-i, --input <path>', 'Caminho do arquivo de entrada')
    .option('-s, --schema <path>', 'Caminho opcional para schema customizado')
    .option('--fail-fast', 'Interrompe na primeira inconsistência encontrada')
    .action(async (options: ValidateCommandOptions) => {
      await dependencies.validateHandler.execute({
        inputPath: options.input,
        schemaPath: options.schema,
        failFast: Boolean(options.failFast),
      });
    });
}
