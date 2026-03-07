import { spawn } from 'child_process';

const execCommand = () => {
    const command = process.argv[2];
    if(!command) return;

    const childProc = spawn(command, [], {
        shell: true,
        stdio: 'inherit',
        env: process.env,
    });

    childProc.on('close', (code) => {
        process.exit(code ?? 1)
    });
};

execCommand();