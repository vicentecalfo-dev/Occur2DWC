import type { CommandOutputPort } from '../../application/ports/command-output.port';
import { createLogger, type LogFormat, type Logger } from './logger';

export interface OutputLoggerOptions {
  format: LogFormat;
  quiet: boolean;
  verbose: boolean;
}

export function createOutputLogger(
  output: CommandOutputPort,
  options: OutputLoggerOptions,
): Logger {
  return createLogger(
    {
      format: options.format,
      quiet: options.quiet,
      verbose: options.verbose,
    },
    {
      info(message: string): void {
        output.info(message);
      },
      warn(message: string): void {
        if (output.warn) {
          output.warn(message);
          return;
        }

        output.info(message);
      },
      error(message: string): void {
        output.error(message);
      },
      debug(message: string): void {
        if (output.debug) {
          output.debug(message);
          return;
        }

        output.info(message);
      },
    },
  );
}
