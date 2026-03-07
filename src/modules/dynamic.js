import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dynamic = async () => {
  const pluginName = process.argv[2];
  if (!pluginName || !/^[a-zA-Z0-9_]+$/.test(pluginName)) {
    console.log('Plugin not found');
    process.exit(1);
  }

  try {
    const pluginPath = path.join(__dirname, 'plugins', `${pluginName}.js`);
    const module = await import(pathToFileURL(pluginPath).href);
    const result = module.run();
    console.log(result);
  } catch {
    console.log('Plugin not found');
    process.exit(1);
  }
};

await dynamic();