import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { createBrotliCompress } from 'zlib';
import { pipeline } from 'stream/promises';

const compressDir = async () => {
  const toCompressPath = path.join(process.cwd(), 'workspace', 'toCompress');
  const compressedDir = path.join(process.cwd(), 'workspace', 'compressed');
  const archivePath = path.join(compressedDir, 'archive.br');

  try {
    await fs.access(toCompressPath);
  } catch {
    throw new Error('FS operation failed');
  }

  const fileList = [];
  async function collect(dirPath, relativePrefix = '') {
    const names = await fs.readdir(dirPath, { withFileTypes: true });
    for (const dirent of names) {
      const relPath = relativePrefix ? `${relativePrefix}/${dirent.name}` : dirent.name;
      const fullPath = path.join(dirPath, dirent.name);
      if (dirent.isDirectory()) {
        await collect(fullPath, relPath);
      } else {
        fileList.push(relPath);
      }
    }
  }
  await collect(toCompressPath);
  fileList.sort();

  let index = 0;
  const readable = new Readable({
    read() {
      if (index >= fileList.length) {
        this.push(null);
        return;
      }
      const relPath = fileList[index++];
      const fullPath = path.join(toCompressPath, relPath);
      fs.readFile(fullPath)
        .then((content) => {
          const pathBuf = Buffer.from(relPath, 'utf-8');
          const pathLen = Buffer.allocUnsafe(4);
          pathLen.writeUInt32BE(pathBuf.length, 0);
          const contentLen = Buffer.allocUnsafe(4);
          contentLen.writeUInt32BE(content.length, 0);
          this.push(Buffer.concat([pathLen, pathBuf, contentLen, content]));
        })
        .catch((err) => this.destroy(err));
    },
  });

  await fs.mkdir(compressedDir, { recursive: true });
  await pipeline(
    readable,
    createBrotliCompress(),
    createWriteStream(archivePath)
  );
};

await compressDir();
