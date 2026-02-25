import { describe, expect, it } from 'vitest';

import { ConsoleOutputAdapter } from '../../src/infrastructure/cli/presenters/console-output.adapter';

class MemoryWriter {
  readonly infos: string[] = [];
  readonly warns: string[] = [];
  readonly errors: string[] = [];
  readonly debugs: string[] = [];

  info(message: string): void {
    this.infos.push(message);
  }

  warn(message: string): void {
    this.warns.push(message);
  }

  error(message: string): void {
    this.errors.push(message);
  }

  debug(message: string): void {
    this.debugs.push(message);
  }
}

describe('ConsoleOutputAdapter colors', () => {
  it('should colorize output when enabled', () => {
    const writer = new MemoryWriter();
    const adapter = new ConsoleOutputAdapter({ useColor: true, writer });

    adapter.error('Erro de exemplo');

    expect(writer.errors).toHaveLength(1);
    const firstError = writer.errors[0];
    if (!firstError) {
      throw new Error('Nenhuma mensagem de erro colorida foi emitida.');
    }
    expect(firstError.includes('\u001b[')).toBe(true);
  });

  it('should not colorize output when disabled', () => {
    const writer = new MemoryWriter();
    const adapter = new ConsoleOutputAdapter({ useColor: false, writer });

    adapter.error('Erro de exemplo');

    expect(writer.errors).toHaveLength(1);
    const firstError = writer.errors[0];
    if (!firstError) {
      throw new Error('Nenhuma mensagem de erro foi emitida.');
    }
    expect(firstError.includes('\u001b[')).toBe(false);
    expect(firstError).toBe('Erro de exemplo');
  });
});
