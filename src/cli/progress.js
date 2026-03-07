const progress = () => {
  const getArg = (name, defaultVal) => {
    const i = process.argv.indexOf(name);
    return i !== -1 && process.argv[i + 1] != null
      ? process.argv[i + 1]
      : defaultVal;
  };
  const duration = Math.max(0, parseInt(getArg('--duration', '5000'), 10) || 5000);
  const interval = Math.max(1, parseInt(getArg('--interval', '100'), 10) || 100);
  const length = Math.max(1, parseInt(getArg('--length', '30'), 10) || 30);
  const colorArg = getArg('--color', '');
  const validColor = /^#[0-9A-Fa-f]{6}$/.test(colorArg);
  let r = 0, g = 0, b = 0;
  if (validColor) {
    r = parseInt(colorArg.slice(1, 3), 16);
    g = parseInt(colorArg.slice(3, 5), 16);
    b = parseInt(colorArg.slice(5, 7), 16);
  }

  const start = Date.now();
  const tick = () => {
    const elapsed = Date.now() - start;
    const pct = Math.min(1, elapsed / duration);
    const filledLen = Math.round(length * pct);
    const filled = '█'.repeat(filledLen);
    const empty = ' '.repeat(length - filledLen);
    const pctNum = Math.min(100, Math.round(pct * 100));
    const colorPrefix = validColor ? `\x1b[38;2;${r};${g};${b}m` : '';
    const colorSuffix = validColor ? '\x1b[0m' : '';
    const bar = `[${colorPrefix}${filled}${colorSuffix}${empty}] ${pctNum}%`;
    process.stdout.write('\r' + bar);
    if (pct >= 1) {
      clearInterval(timer);
      process.stdout.write('\nDone!\n');
    }
  };
  const timer = setInterval(tick, interval);
  tick();
};

progress();
