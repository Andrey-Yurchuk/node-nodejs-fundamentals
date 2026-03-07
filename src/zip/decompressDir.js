import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';
import { createBrotliDecompress } from 'zlib';
import { pipeline } from 'stream/promises';
import { Writable } from 'stream';

const decompressDir = async () => {
  const compressedDir = path.join(process.cwd(), 'workspace', 'compressed');
  const archivePath = path.join(compressedDir, 'archive.br');
  const decompressedDir = path.join(process.cwd(), 'workspace', 'decompressed');

  try {
    await fs.access(archivePath);
  } catch {
    throw new Error('FS operation failed');
  }

  const chunks = [];
  const collect = new Writable({
    write(chunk, _enc, cb) {
      chunks.push(chunk);
      cb();
    },
  });
  await pipeline(
    createReadStream(archivePath),
    createBrotliDecompress(),
    collect
  );
  const buffer = Buffer.concat(chunks);

  let offset = 0;
  while (offset < buffer.length) {
    const pathLen = buffer.readUInt32BE(offset);
    offset += 4;
    const relPath = buffer.slice(offset, offset + pathLen).toString('utf-8');
    offset += pathLen;
    const contentLen = buffer.readUInt32BE(offset);
    offset += 4;
    const content = buffer.slice(offset, offset + contentLen);
    offset += contentLen;
    const outPath = path.join(decompressedDir, relPath);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, content);
  }
};

await decompressDir();
