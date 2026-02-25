import { describe, expect, it } from 'vitest';

import { formatCliFailure, resolveExitCode } from '../../src/infrastructure/cli/error-handling';
import { CliError } from '../../src/shared/errors/cli-error';

describe('CLI global error handling', () => {
  it('should classify usage errors with hint', () => {
    const message = formatCliFailure(new CliError('A opcao --in e obrigatoria.', 2), {
      verbose: false,
      colorEnabled: false,
    });

    expect(message).toContain('Erro de uso');
    expect(message).toContain('occur2dwc <comando> --help');
    expect(resolveExitCode(new CliError('x', 2))).toBe(2);
  });

  it('should classify validation errors with report hint', () => {
    const message = formatCliFailure(new CliError('Modo --strict ativo: erros de validacao.', 1), {
      verbose: false,
      colorEnabled: false,
    });

    expect(message).toContain('Erro de valida');
    expect(message).toContain('--report');
    expect(resolveExitCode(new CliError('x', 1))).toBe(1);
  });

  it('should include stack trace for unexpected errors in verbose mode', () => {
    const message = formatCliFailure(new Error('falha interna'), {
      verbose: true,
      colorEnabled: false,
    });

    expect(message).toContain('Erro inesperado');
    expect(message).toContain('falha interna');
    expect(message).toContain('Error: falha interna');
    expect(resolveExitCode(new Error('x'))).toBe(1);
  });
});
