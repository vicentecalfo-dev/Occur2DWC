import { isCliError } from '../../shared/errors/cli-error';

function detectValidationError(message: string): boolean {
  return message.toLowerCase().includes('valida');
}

function formatUsageError(message: string): string {
  return `Erro de uso: ${message}\nDica: execute "occur2dwc <comando> --help" para ver exemplos.`;
}

function formatStructuralError(message: string): string {
  return `Erro estrutural: ${message}\nSugestão: verifique caminhos de arquivo, permissões e formato da entrada.`;
}

function formatValidationError(message: string): string {
  return `Erro de validação: ${message}\nDica: use --report <arquivo.json> para analisar os detalhes.`;
}

function appendStackIfVerbose(baseMessage: string, error: unknown, verbose: boolean): string {
  if (!verbose || !(error instanceof Error)) {
    return baseMessage;
  }

  const stackTrace = error.stack ?? `${error.name}: ${error.message}`;
  return `${baseMessage}\n${stackTrace}`;
}

function red(enabled: boolean, message: string): string {
  if (!enabled) {
    return message;
  }

  return `\u001b[31m${message}\u001b[0m`;
}

function colorize(colorEnabled: boolean, message: string): string {
  if (message.startsWith('Erro de validação:')) {
    return red(colorEnabled, message);
  }

  if (message.startsWith('Erro de uso:')) {
    return red(colorEnabled, message);
  }

  if (message.startsWith('Erro estrutural:')) {
    return red(colorEnabled, message);
  }

  if (message.startsWith('Erro inesperado:')) {
    return red(colorEnabled, message);
  }

  return message;
}

export function resolveExitCode(error: unknown): number {
  if (isCliError(error)) {
    return error.exitCode;
  }

  return 1;
}

export function formatCliFailure(
  error: unknown,
  options: { verbose: boolean; colorEnabled: boolean },
): string {
  if (isCliError(error)) {
    if (error.exitCode === 2) {
      const normalizedMessage = error.message.toLowerCase();
      const looksLikeUsageError =
        normalizedMessage.includes('opção') ||
        normalizedMessage.includes('opcao') ||
        normalizedMessage.includes('option') ||
        normalizedMessage.includes('argument') ||
        normalizedMessage.includes('perfil inválido') ||
        normalizedMessage.includes('perfil invalido') ||
        normalizedMessage.includes('comando');

      return colorize(
        options.colorEnabled,
        appendStackIfVerbose(
          looksLikeUsageError ? formatUsageError(error.message) : formatStructuralError(error.message),
          error,
          options.verbose,
        ),
      );
    }

    if (error.exitCode === 1 || detectValidationError(error.message)) {
      return colorize(
        options.colorEnabled,
        appendStackIfVerbose(formatValidationError(error.message), error, options.verbose),
      );
    }

    return colorize(
      options.colorEnabled,
      appendStackIfVerbose(error.message, error, options.verbose),
    );
  }

  const message = error instanceof Error ? error.message : 'Falha desconhecida.';
  const baseMessage = `Erro inesperado: ${message}`;

  if (!options.verbose || !(error instanceof Error)) {
    return colorize(options.colorEnabled, `${baseMessage}\nUse --verbose para stack trace.`);
  }

  return colorize(options.colorEnabled, appendStackIfVerbose(baseMessage, error, true));
}
