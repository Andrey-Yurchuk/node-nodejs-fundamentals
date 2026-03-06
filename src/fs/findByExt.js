import fs from 'fs/promises';
import path from 'path';

const findByExt = async () => {
  const workspacePath = path.join(process.cwd(), 'workspace');
  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error('FS operation failed');
  }

  const extIndex = process.argv.indexOf('--ext');
  const extArg = extIndex !== -1 ? process.argv[extIndex + 1] ?? 'txt' : 'txt';
  const ext = extArg.startsWith('.') ? extArg : `.${extArg}`;

  const files = [];
  async function scan(dirPath, relativePrefix = '') {
    const names = await fs.readdir(dirPath, { withFileTypes: true });
    const sorted = names.sort((a, b) => a.name.localeCompare(b.name));
    for (const dirent of sorted) {
      const relativePath = relativePrefix ? `${relativePrefix}/${dirent.name}` : dirent.name;
      const fullPath = path.join(dirPath, dirent.name);
      if (dirent.isDirectory()) {
        await scan(fullPath, relativePath);
      } else if (relativePath.endsWith(ext)) {
        files.push(relativePath);
      }
    }
  }
  await scan(workspacePath);
  files.sort();
  for (const file of files) {
    console.log(file);
  }
};

await findByExt();
