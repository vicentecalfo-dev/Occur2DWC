#!/usr/bin/env node

import { runCli } from './infrastructure/cli/run-cli';
import { isCliError } from './shared/errors/cli-error';

void runCli().catch((error: unknown) => {
  if (isCliError(error)) {
    console.error(error.message);
    process.exitCode = error.exitCode;
    return;
  }

  const message = error instanceof Error ? error.message : 'Erro desconhecido';
  console.error(`Erro inesperado ao executar o CLI: ${message}`);
  process.exitCode = 1;
});
