export interface Logger {
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
  debug(message: string, meta?: unknown): void;
}

export type LogFormat = 'text' | 'json';

export interface LoggerOptions {
  format: LogFormat;
  quiet: boolean;
  verbose: boolean;
}

export interface LogWriter {
  info(message: string): void;
  warn?(message: string): void;
  error(message: string): void;
  debug?(message: string): void;
}

interface LogPayload {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  meta?: unknown;
}

function formatText(level: LogPayload['level'], message: string, meta: unknown): string {
  const levelLabel = level.toUpperCase();

  if (meta === undefined) {
    return `[${levelLabel}] ${message}`;
  }

  return `[${levelLabel}] ${message} ${JSON.stringify(meta)}`;
}

function formatJson(level: LogPayload['level'], message: string, meta: unknown): string {
  const payload: LogPayload = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return JSON.stringify(payload);
}

export function createLogger(options: LoggerOptions, writer: LogWriter): Logger {
  const emit = (level: LogPayload['level'], message: string, meta: unknown): void => {
    if (options.quiet && level !== 'error') {
      return;
    }

    if (!options.verbose && level === 'debug') {
      return;
    }

    const output =
      options.format === 'json'
        ? formatJson(level, message, meta)
        : formatText(level, message, meta);

    if (level === 'error') {
      writer.error(output);
      return;
    }

    if (level === 'warn') {
      if (writer.warn) {
        writer.warn(output);
        return;
      }

      writer.info(output);
      return;
    }

    if (level === 'debug') {
      if (writer.debug) {
        writer.debug(output);
        return;
      }

      writer.info(output);
      return;
    }

    writer.info(output);
  };

  return {
    info(message: string, meta?: unknown): void {
      emit('info', message, meta);
    },
    warn(message: string, meta?: unknown): void {
      emit('warn', message, meta);
    },
    error(message: string, meta?: unknown): void {
      emit('error', message, meta);
    },
    debug(message: string, meta?: unknown): void {
      emit('debug', message, meta);
    },
  };
}
