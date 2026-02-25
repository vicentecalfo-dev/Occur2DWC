export interface CommandOutputPort {
  info(message: string): void;
  error(message: string): void;
}
