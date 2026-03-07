import fs from 'fs';
import path from 'path';
import readline from 'readline';

const split = async () => {
  const linesArg = process.argv.indexOf('--lines');
  const n = Math.max(1, parseInt(process.argv[linesArg + 1] ?? '10', 10) || 10);
  const baseDir = process.cwd();
  const sourcePath = path.join(baseDir, 'source.txt');
  const readStream = fs.createReadStream(sourcePath);
  const rl = readline.createInterface({ input: readStream, crlfDelay: Infinity });

  let chunkIndex = 0;
  let lineBuffer = [];
  const flush = async () => {
    if (lineBuffer.length === 0) return;
    chunkIndex++;
    const outPath = path.join(baseDir, `chunk_${chunkIndex}.txt`);
    await fs.promises.writeFile(outPath, lineBuffer.join('\n') + '\n', 'utf-8');
    lineBuffer = [];
  };

  for await (const line of rl) {
    lineBuffer.push(line);
    if (lineBuffer.length >= n) await flush();
  }
  await flush();
};

await split();
