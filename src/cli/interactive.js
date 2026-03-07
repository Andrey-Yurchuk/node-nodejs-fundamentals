import readline from 'readline';

const interactive = () => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  rl.on('SIGINT', () => rl.close());
  rl.on('close', () => {
    console.log('Goodbye!');
    process.exit(0);
  });

  const ask = () => {
    rl.question('> ', (line) => {
      const cmd = (line ?? '').trim();
      switch (cmd) {
        case 'uptime':
          console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
          break;
        case 'cwd':
          console.log(process.cwd());
          break;
        case 'date':
          console.log(new Date().toISOString());
          break;
        case 'exit':
          rl.close();
          return;
        default:
          if (cmd !== '') console.log('Unknown command');
      }
      ask();
    });
  };

  ask();
};

interactive();
