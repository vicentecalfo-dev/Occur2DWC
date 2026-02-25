import { createWriteStream } from 'node:fs';
import type { Readable } from 'node:stream';

import archiver from 'archiver';

export interface ZipWriter {
  addStream(pathInZip: string, contentStream: Readable): void;
  addString(pathInZip: string, content: string): void;
  addFile(sourcePath: string, pathInZip: string): void;
  finalize(): Promise<void>;
}

export class ArchiverZipWriter implements ZipWriter {
  private readonly archive = archiver('zip', {
    zlib: { level: 9 },
  });

  private readonly outputStream;

  constructor(outputPath: string) {
    this.outputStream = createWriteStream(outputPath);
    this.archive.pipe(this.outputStream);
  }

  addStream(pathInZip: string, contentStream: Readable): void {
    this.archive.append(contentStream, { name: pathInZip, date: new Date(0) });
  }

  addString(pathInZip: string, content: string): void {
    this.archive.append(content, { name: pathInZip, date: new Date(0) });
  }

  addFile(sourcePath: string, pathInZip: string): void {
    this.archive.file(sourcePath, { name: pathInZip, date: new Date(0) });
  }

  async finalize(): Promise<void> {
    const completion = new Promise<void>((resolve, reject) => {
      this.outputStream.on('close', () => {
        resolve();
      });
      this.outputStream.on('error', (error: Error) => {
        reject(error);
      });
      this.archive.on('error', (error: Error) => {
        reject(error);
      });
    });

    await this.archive.finalize();
    await completion;
  }
}
