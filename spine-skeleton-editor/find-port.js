import { createServer } from 'net'
import { spawn } from 'child_process'

function findFreePort(startPort = 5173) {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        findFreePort(startPort + 1).then(resolve).catch(reject)
      } else {
        reject(err)
      }
    })
    server.once('listening', () => {
      server.close()
      resolve(startPort)
    })
    server.listen(startPort)
  })
}

findFreePort().then(port => {
  console.log(`\n🚀 找到空闲端口: ${port}`)
  console.log(`📦 正在启动开发服务器...\n`)
  
  const env = { ...process.env, PORT: port }
  const child = spawn('npx', ['vite', '--port', port], {
    stdio: 'inherit',
    env,
    shell: true
  })
  
  child.on('exit', (code) => {
    process.exit(code)
  })
}).catch(err => {
  console.error('❌ 查找端口失败:', err)
  process.exit(1)
})
