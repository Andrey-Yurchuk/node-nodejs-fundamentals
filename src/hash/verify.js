import fs from 'fs/promises';
import crypto from 'crypto';
import path from 'path';
import { createReadStream } from 'fs';

const verify = async () => {
  const checksumsPath = path.join(process.cwd(), 'checksums.json');
  let data;
  try {
    data = await fs.readFile(checksumsPath, 'utf-8');
  } catch {
    throw new Error('FS operation failed');
  }
  const checksums = JSON.parse(data);
  const baseDir = path.dirname(checksumsPath);

  const getFileHash = (filePath) =>
    new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = createReadStream(filePath);
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });

  for (const [filename, expectedHex] of Object.entries(checksums)) {
    const filePath = path.join(baseDir, filename);
    try {
      const actualHex = await getFileHash(filePath);
      console.log(`${filename} — ${expectedHex === actualHex ? 'OK' : 'FAIL'}`);
    } catch {
      console.log(`${filename} — FAIL`);
    }
  }
};

await verify();
