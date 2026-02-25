const { mkdirSync, rmSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');

const { buildProgram } = require('../dist/index.js');

async function runCommand(args) {
  const program = buildProgram({ version: '0.0.0-coverage' });
  await program.parseAsync(args, { from: 'user' });
}

async function main() {
  const tempDir = join(tmpdir(), `occur2dwc-coverage-${Date.now()}`);
  mkdirSync(tempDir, { recursive: true });

  const inputPath = join(tempDir, 'input.csv');
  const outputPath = join(tempDir, 'output.tsv');
  const reportPath = join(tempDir, 'report.json');
  const dwcaPath = join(tempDir, 'archive.zip');

  writeFileSync(
    inputPath,
    'occurrenceid,scientificName,decimallatitude,decimallongitude\n1,Mimosa pudica,-10.5,-52.3\n',
    'utf8',
  );

  buildProgram({ version: '0.0.0-coverage' }).helpInformation();

  await runCommand(['convert', '--in', inputPath, '--out', outputPath, '--report', reportPath]);
  await runCommand(['validate', '--in', inputPath, '--max-errors', '10']);
  await runCommand(['pack', '--in', outputPath, '--out', dwcaPath]);
  await runCommand(['init', '--force']);

  rmSync(tempDir, { recursive: true, force: true });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
