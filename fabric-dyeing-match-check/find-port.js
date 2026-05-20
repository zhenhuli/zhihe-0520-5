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

const startPort = parseInt(process.argv[2]) || 5173;
findAvailablePort(startPort).then((port) => {
  fs.writeFileSync('.port', port.toString());
  console.log(`Found available port: ${port}`);
});
