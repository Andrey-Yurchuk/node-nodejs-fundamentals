import fs from 'fs/promises';
import path from 'path';

const snapshot = async () => {
  const workspacePath = path.join(process.cwd(), 'workspace');
  const snapshotPath = path.join(process.cwd(), 'snapshot.json');

  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error('FS operation failed');
  }

  const rootPath = path.resolve(workspacePath);
  const entries = [];

  async function scan(dirPath, relativePrefix = '') {
    const names = await fs.readdir(dirPath, { withFileTypes: true });
    const sorted = names.sort((a, b) => a.name.localeCompare(b.name));

    for (const dirent of sorted) {
      const relativePath = relativePrefix ? `${relativePrefix}/${dirent.name}` : dirent.name;
      const fullPath = path.join(dirPath, dirent.name);

      if (dirent.isDirectory()) {
        entries.push({ path: relativePath, type: 'directory' });
        await scan(fullPath, relativePath);
      } else {
        const content = await fs.readFile(fullPath);
        const size = content.length;
        const contentBase64 = content.toString('base64');
        entries.push({
          path: relativePath,
          type: 'file',
          size,
          content: contentBase64,
        });
      }
    }
  }

  await scan(workspacePath);
  await fs.writeFile(
    snapshotPath,
    JSON.stringify({ rootPath, entries }, null, 2),
    'utf-8'
  );
};

await snapshot();
