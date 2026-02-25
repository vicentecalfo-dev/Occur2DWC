#!/usr/bin/env node

import { runCli } from './infrastructure/cli/run-cli';

void runCli().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Erro desconhecido';
  console.error(`Erro inesperado ao executar o CLI: ${message}`);
  process.exitCode = 1;
});
