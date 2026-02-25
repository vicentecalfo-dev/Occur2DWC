const INTERRUPTION_SIGNALS: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

export interface InterruptionGuard {
  isInterrupted(): boolean;
  dispose(): void;
}

export function createInterruptionGuard(): InterruptionGuard {
  let interrupted = false;

  const handler = (): void => {
    interrupted = true;
  };

  for (const signal of INTERRUPTION_SIGNALS) {
    process.once(signal, handler);
  }

  return {
    isInterrupted(): boolean {
      return interrupted;
    },
    dispose(): void {
      for (const signal of INTERRUPTION_SIGNALS) {
        process.removeListener(signal, handler);
      }
    },
  };
}
