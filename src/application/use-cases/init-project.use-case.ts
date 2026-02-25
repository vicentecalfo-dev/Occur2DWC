import { access, mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { constants as fsConstants } from 'node:fs';

import type { CommandOutputPort } from '../ports/command-output.port';
import type { LogFormat } from '../../shared/logging/logger';
import { CliError } from '../../shared/errors/cli-error';
import { formatExecutionSummary } from '../../shared/logging/execution-summary';
import { createOutputLogger } from '../../shared/logging/output-logger';
import { INIT_TEMPLATE_FILES } from './init/templates';

export interface InitProjectInput {
  directory: string | undefined;
  force: boolean;
  logFormat: LogFormat;
  quiet: boolean;
  verbose: boolean;
}

interface InitProjectResult {
  targetDirectory: string;
  createdFiles: string[];
  overwrittenFiles: string[];
  skippedFiles: string[];
}

function isFileSystemError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

function ensureValidInitPath(path: string): Promise<void> {
  return access(path, fsConstants.W_OK);
}

export class InitProjectUseCase {
  constructor(private readonly output: CommandOutputPort) {}

  async execute(input: InitProjectInput): Promise<void> {
    const logger = createOutputLogger(this.output, {
      format: input.logFormat,
      quiet: input.quiet,
      verbose: input.verbose,
    });
    const start = Date.now();

    const targetDirectory = resolve(process.cwd(), input.directory ?? '.');

    logger.info('Iniciando estrutura base do projeto.', {
      targetDirectory,
      force: input.force,
    });

    let result: InitProjectResult;

    try {
      result = await this.generateTemplateStructure(targetDirectory, input.force);
    } catch (error) {
      if (error instanceof CliError) {
        throw error;
      }

      if (isFileSystemError(error)) {
        if (error.code === 'EACCES' || error.code === 'EPERM' || error.code === 'ENOTDIR') {
          throw new CliError(
            `Nao foi possivel inicializar o diretorio "${targetDirectory}": ${error.message}`,
            2,
          );
        }
      }

      throw new CliError(`Falha ao inicializar projeto em "${targetDirectory}".`, 2);
    }

    if (result.skippedFiles.length > 0 && !input.force) {
      logger.warn(
        `${result.skippedFiles.length} arquivo(s) existente(s) foram mantidos. Use --force para sobrescrever.`,
      );
    }

    const durationMs = Date.now() - start;

    if (input.logFormat === 'json') {
      logger.info('Resumo final da inicializacao.', {
        createdFiles: result.createdFiles.length,
        overwrittenFiles: result.overwrittenFiles.length,
        skippedFiles: result.skippedFiles.length,
        durationMs,
      });
    } else {
      logger.info(
        [
          'Resumo final da inicializacao:',
          `Diretorio: ${result.targetDirectory}`,
          `Arquivos criados: ${result.createdFiles.length}`,
          `Arquivos sobrescritos: ${result.overwrittenFiles.length}`,
          `Arquivos preservados: ${result.skippedFiles.length}`,
          ...result.createdFiles.map((filePath) => `+ ${filePath}`),
          ...result.overwrittenFiles.map((filePath) => `~ ${filePath}`),
          ...result.skippedFiles.map((filePath) => `= ${filePath}`),
        ].join('\n'),
      );
      logger.info(
        formatExecutionSummary({
          processedRows: INIT_TEMPLATE_FILES.length,
          validRows: result.createdFiles.length + result.overwrittenFiles.length,
          warnings: result.skippedFiles.length,
          errors: 0,
          durationMs,
        }),
      );
    }
  }

  private async generateTemplateStructure(
    targetDirectory: string,
    force: boolean,
  ): Promise<InitProjectResult> {
    await mkdir(targetDirectory, { recursive: true });
    await ensureValidInitPath(targetDirectory);

    const directoryStat = await stat(targetDirectory);
    if (!directoryStat.isDirectory()) {
      throw new CliError(`O caminho informado nao e um diretorio valido: ${targetDirectory}`, 2);
    }

    const createdFiles: string[] = [];
    const overwrittenFiles: string[] = [];
    const skippedFiles: string[] = [];

    for (const file of INIT_TEMPLATE_FILES) {
      const absolutePath = resolve(targetDirectory, file.relativePath);
      await mkdir(dirname(absolutePath), { recursive: true });

      let alreadyExists = false;
      try {
        await access(absolutePath, fsConstants.F_OK);
        alreadyExists = true;
      } catch {
        alreadyExists = false;
      }

      if (alreadyExists && !force) {
        skippedFiles.push(file.relativePath);
        continue;
      }

      await writeFile(absolutePath, file.content, 'utf8');

      if (alreadyExists) {
        overwrittenFiles.push(file.relativePath);
      } else {
        createdFiles.push(file.relativePath);
      }
    }

    return {
      targetDirectory,
      createdFiles,
      overwrittenFiles,
      skippedFiles,
    };
  }
}
