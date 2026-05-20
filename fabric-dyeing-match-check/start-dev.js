import { spawn } from 'child_process';
import net from 'net';
import fs from 'fs';

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

async function findAvailablePort(startPort = 5173, maxAttempts = 100) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const available = await checkPort(port);
    if (available) {
      return port;
    }
  }
  return startPort;
}

async function startDev() {
  const port = await findAvailablePort();
  console.log(`Starting development server on port ${port}...`);
  fs.writeFileSync('.port', port.toString());
  
  const vite = spawn('npx', ['vite', '--port', port.toString()], {
    stdio: 'inherit',
    shell: true,
  });
  
  vite.on('error', (err) => {
    console.error('Failed to start Vite:', err);
    process.exit(1);
  });
  
  vite.on('exit', (code) => {
    process.exit(code);
  });
}

startDev();
