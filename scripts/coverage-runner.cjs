const { buildProgram } = require('../dist/index.js');

async function runCommand(args) {
  const program = buildProgram({ version: '0.0.0-coverage' });
  await program.parseAsync(args, { from: 'user' });
}

async function main() {
  buildProgram({ version: '0.0.0-coverage' }).helpInformation();

  await runCommand(['convert', '--input', 'occurrences.csv', '--output', 'dwc.csv']);
  await runCommand(['validate', '--input', 'occurrences.csv', '--fail-fast']);
  await runCommand(['pack', '--source', './out', '--target', './dist/archive.zip']);
  await runCommand(['init', '--force']);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
