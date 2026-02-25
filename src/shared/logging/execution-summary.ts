export interface ExecutionSummary {
  processedRows: number;
  validRows: number;
  warnings: number;
  errors: number;
  durationMs: number;
}

function formatDuration(durationMs: number): string {
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  return `${(durationMs / 1000).toFixed(2)} s`;
}

export function formatExecutionSummary(summary: ExecutionSummary): string {
  return [
    'Resumo final:',
    `✔ Linhas processadas: ${summary.processedRows}`,
    `✔ Linhas válidas: ${summary.validRows}`,
    `✔ Warnings: ${summary.warnings}`,
    `✔ Erros: ${summary.errors}`,
    `✔ Tempo de execução: ${formatDuration(summary.durationMs)}`,
  ].join('\n');
}
