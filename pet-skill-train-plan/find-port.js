import net from 'net';
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const portFile = path.join(__dirname, '.port');

function findFreePort(startPort = 5173, maxPort = 5200) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', () => {
      if (startPort < maxPort) {
        findFreePort(startPort + 1, maxPort).then(resolve).catch(reject);
      } else {
        reject(new Error('No free port found between 5173 and 5200'));
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(startPort);
    });
    server.listen(startPort, '127.0.0.1');
  });
}

async function main() {
  try {
    const port = await findFreePort();
    fs.writeFileSync(portFile, port.toString());
    console.log(`Found free port: ${port}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

main();
