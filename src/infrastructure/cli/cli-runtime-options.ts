function hasFlag(argv: readonly string[], flag: string): boolean {
  return argv.includes(flag);
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

export interface CliRuntimeOptions {
  verbose: boolean;
  colorEnabled: boolean;
}

export function resolveCliRuntimeOptions(argv: readonly string[]): CliRuntimeOptions {
  const verbose = hasFlag(argv, '--verbose');
  const noColor = hasFlag(argv, '--no-color');

  return {
    verbose,
    colorEnabled: !noColor && detectTerminalColorSupport(),
  };
}
