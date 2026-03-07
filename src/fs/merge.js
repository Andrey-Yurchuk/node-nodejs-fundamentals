import fs from 'fs/promises';
import path from 'path';

const merge = async () => {
  const partsPath = path.join(process.cwd(), 'workspace', 'parts');
  const mergedPath = path.join(process.cwd(), 'workspace', 'merged.txt');

  let fileList;
  const filesIndex = process.argv.indexOf('--files');
  if (filesIndex !== -1 && process.argv[filesIndex + 1]) {
    const filesArg = process.argv[filesIndex + 1];
    fileList = filesArg.split(',').map((f) => f.trim()).filter(Boolean);
  } else {
    try {
      const names = await fs.readdir(partsPath);
      fileList = names.filter((n) => n.endsWith('.txt')).sort((a, b) => a.localeCompare(b));
    } catch {
      throw new Error('FS operation failed');
    }
    if (fileList.length === 0) throw new Error('FS operation failed');
  }

  const chunks = [];
  for (const name of fileList) {
    const filePath = path.join(partsPath, name);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      chunks.push(content);
    } catch {
      throw new Error('FS operation failed');
    }
  }
  await fs.writeFile(mergedPath, chunks.join(''), 'utf-8');
};

await merge();
