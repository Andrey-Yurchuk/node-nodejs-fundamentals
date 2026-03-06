import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Worker } from 'worker_threads';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function splitIntoChunks(arr, n) {
  const chunks = Array.from({ length: n }, () => []);
  arr.forEach((val, i) => chunks[i % n].push(val));
  return chunks;
}

function mergeSorted(chunks) {
  const indices = chunks.map(() => 0);
  const result = [];
  let remaining = chunks.reduce((sum, c) => sum + c.length, 0);
  while (remaining > 0) {
    let minVal = Infinity;
    let minIdx = -1;
    for (let i = 0; i < chunks.length; i++) {
      const j = indices[i];
      if (j < chunks[i].length && chunks[i][j] < minVal) {
        minVal = chunks[i][j];
        minIdx = i;
      }
    }
    result.push(minVal);
    indices[minIdx]++;
    remaining--;
  }
  return result;
}

const main = async () => {
  const dataPath = path.join(process.cwd(), 'data.json');
  const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));
  const n = os.availableParallelism ? os.availableParallelism() : os.cpus().length;
  const chunks = splitIntoChunks(data, n);

  const workerPath = path.join(__dirname, 'worker.js');
  const workerUrl = pathToFileURL(workerPath);

  const sortedChunks = await Promise.all(
    chunks.map(
      (chunk) =>
        new Promise((resolve, reject) => {
          const worker = new Worker(workerUrl, { type: 'module' });
          worker.on('message', (msg) => {
            resolve(msg);
            worker.terminate();
          });
          worker.on('error', reject);
          worker.postMessage(chunk);
        })
    )
  );

  const merged = mergeSorted(sortedChunks);
  console.log(merged);
};

await main();
