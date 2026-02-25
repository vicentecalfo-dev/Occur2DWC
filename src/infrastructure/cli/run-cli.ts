import { buildProgram } from './build-program';

export async function runCli(argv: string[] = process.argv): Promise<void> {
  const program = buildProgram();
  await program.parseAsync(argv);
}
