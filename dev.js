const { spawn } = require('child_process');

console.log('Starting Server and Client...');

const server = spawn('npm', ['run', 'server'], { stdio: 'inherit', shell: true });
const client = spawn('npm', ['run', 'client'], { stdio: 'inherit', shell: true });

server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
});

client.on('close', (code) => {
    console.log(`Client process exited with code ${code}`);
});
