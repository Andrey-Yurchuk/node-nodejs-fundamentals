import fs from 'fs/promises';
import path from 'path';

const restore = async () => {
  const snapshotPath = path.join(process.cwd(), 'snapshot.json');
  const restorePath = path.join(process.cwd(), 'workspace_restored');

  let snapshotExists = false;
  let restoreExists = false;
  try {
    await fs.access(snapshotPath);
    snapshotExists = true;
  } catch {}
  try {
    await fs.access(restorePath);
    restoreExists = true;
  } catch {}

  if (!snapshotExists || restoreExists) {
    throw new Error('FS operation failed');
  }

  const data = JSON.parse(await fs.readFile(snapshotPath, 'utf-8'));
  const { entries } = data;

  for (const entry of entries) {
    const targetPath = path.join(restorePath, entry.path);

    if (entry.type === 'directory') {
      await fs.mkdir(targetPath, { recursive: true });
    } else {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      const buffer = Buffer.from(entry.content, 'base64');
      await fs.writeFile(targetPath, buffer);
    }
  }
};

await restore();
