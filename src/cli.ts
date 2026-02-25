#!/usr/bin/env node

import { formatCliFailure, resolveExitCode } from './infrastructure/cli/error-handling';
import { resolveCliRuntimeOptions } from './infrastructure/cli/cli-runtime-options';
import { runCli } from './infrastructure/cli/run-cli';

const runtimeOptions = resolveCliRuntimeOptions(process.argv);
let handledFailure = false;

const handleFailure = (error: unknown): void => {
  if (handledFailure) {
    return;
  }

  handledFailure = true;

  const message = formatCliFailure(error, {
    verbose: runtimeOptions.verbose,
    colorEnabled: runtimeOptions.colorEnabled,
  });

  console.error(message);
  const exitCode = resolveExitCode(error);
  process.exitCode = exitCode;
};

process.on('unhandledRejection', (error: unknown) => {
  handleFailure(error);
});

process.on('uncaughtException', (error: Error) => {
  handleFailure(error);
});

void runCli(process.argv, { runtimeOptions }).catch((error: unknown) => {
  handleFailure(error);
});
