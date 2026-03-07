import { Transform } from 'stream';

const lineNumberer = () => {
  let lineNum = 1;
  let buffer = '';

  const transform = new Transform({
    transform(chunk, _encoding, callback) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        this.push(`${lineNum} | ${line}\n`);
        lineNum++;
      }
      callback();
    },
    flush(callback) {
      if (buffer !== '') {
        this.push(`${lineNum} | ${buffer}\n`);
      }
      callback();
    },
  });

  process.stdin.pipe(transform).pipe(process.stdout);
};

lineNumberer();
