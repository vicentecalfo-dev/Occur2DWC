import type { CommandOutputPort } from '../../../application/ports/command-output.port';

export class ConsoleOutputAdapter implements CommandOutputPort {
  info(message: string): void {
    console.info(message);
  }

  error(message: string): void {
    console.error(message);
  }
}
