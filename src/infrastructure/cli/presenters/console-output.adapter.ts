import type { CommandOutputPort } from '../../../application/ports/command-output.port';

interface ConsoleWriter {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
}

export interface ConsoleOutputAdapterOptions {
  useColor?: boolean;
  writer?: ConsoleWriter;
}

interface TerminalColors {
  red(value: string): string;
  yellow(value: string): string;
  green(value: string): string;
  cyan(value: string): string;
}

function detectTerminalColorSupport(): boolean {
  if (!process.stdout.isTTY) {
    return false;
  }

  if (process.env.NO_COLOR) {
    return false;
  }

  if (process.env.TERM === 'dumb') {
    return false;
  }

  return true;
}

function isStructuredJsonMessage(message: string): boolean {
  return message.trimStart().startsWith('{');
}

function isSuccessMessage(message: string): boolean {
  return message.includes('✔') || /conclu[ií]d|sucesso/i.test(message);
}

function createTerminalColors(enabled: boolean): TerminalColors {
  const colorize =
    (openCode: number) =>
    (value: string): string => {
      if (!enabled) {
        return value;
      }

      return `\u001b[${openCode}m${value}\u001b[0m`;
    };

  return {
    red: colorize(31),
    yellow: colorize(33),
    green: colorize(32),
    cyan: colorize(36),
  };
}

export class ConsoleOutputAdapter implements CommandOutputPort {
  private readonly writer: ConsoleWriter;

  private readonly colors: TerminalColors;

  constructor(options: ConsoleOutputAdapterOptions = {}) {
    const useColor = options.useColor ?? detectTerminalColorSupport();
    this.colors = createTerminalColors(useColor);
    this.writer = options.writer ?? console;
  }

  info(message: string): void {
    if (isStructuredJsonMessage(message)) {
      this.writer.info(message);
      return;
    }

    this.writer.info(isSuccessMessage(message) ? this.colors.green(message) : message);
  }

  warn(message: string): void {
    if (isStructuredJsonMessage(message)) {
      this.writer.warn(message);
      return;
    }

    this.writer.warn(this.colors.yellow(message));
  }

  error(message: string): void {
    if (isStructuredJsonMessage(message)) {
      this.writer.error(message);
      return;
    }

    this.writer.error(this.colors.red(message));
  }

  debug(message: string): void {
    if (isStructuredJsonMessage(message)) {
      this.writer.debug(message);
      return;
    }

    this.writer.debug(this.colors.cyan(message));
  }
}
