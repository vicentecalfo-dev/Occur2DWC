import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { scanDwcaInputHeader } from '../../src/dwca/DwcaPacker';

describe('scanDwcaInputHeader', () => {
  it('should detect semicolon delimiter in auto mode', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-pack-'));

    try {
      const inputPath = join(tempDir, 'input.csv');
      await writeFile(inputPath, 'occurrenceID;scientificName\n1;Mimosa', 'utf8');

      const result = await scanDwcaInputHeader(inputPath, 'auto', 'utf8', 'occurrenceID');

      expect(result.delimiter).toBe(';');
      expect(result.idIndex).toBe(0);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should fail when header is missing', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-pack-'));

    try {
      const inputPath = join(tempDir, 'input.csv');
      await writeFile(inputPath, '\n\n', 'utf8');

      await expect(
        scanDwcaInputHeader(inputPath, 'auto', 'utf8', 'occurrenceID'),
      ).rejects.toMatchObject({
        name: 'CliError',
        exitCode: 2,
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should fail when id-field is missing in header', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'occur2dwc-pack-'));

    try {
      const inputPath = join(tempDir, 'input.csv');
      await writeFile(inputPath, 'scientificName,decimalLatitude\nMimosa,-10\n', 'utf8');

      await expect(
        scanDwcaInputHeader(inputPath, 'auto', 'utf8', 'occurrenceID'),
      ).rejects.toMatchObject({
        name: 'CliError',
        exitCode: 2,
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
