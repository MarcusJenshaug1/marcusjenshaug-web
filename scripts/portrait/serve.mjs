// Liten statisk server for landmarks.html. POST /save/<fil> skriver JSON til out/.
//
//   node serve.mjs   →  http://localhost:8123/landmarks.html

import http from 'node:http'
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const MODEL = path.join(HERE, 'out/face_landmarker.task')
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

if (!existsSync(MODEL)) {
  mkdirSync(path.dirname(MODEL), { recursive: true })
  const res = await fetch(MODEL_URL)
  writeFileSync(MODEL, Buffer.from(await res.arrayBuffer()))
  console.log(`lastet ned ${path.basename(MODEL)}`)
}
const TYPES = {
  '.html': 'text/html',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.task': 'application/octet-stream',
}

http
  .createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0])
    if (req.method === 'POST' && url.startsWith('/save/')) {
      let body = ''
      req.on('data', (c) => (body += c))
      req.on('end', () => {
        mkdirSync(path.join(HERE, 'out'), { recursive: true })
        writeFileSync(path.join(HERE, 'out', path.basename(url)), body)
        res.writeHead(204).end()
      })
      return
    }
    const file = path.resolve(HERE, url.replace(/^\//, '') || 'landmarks.html')
    if (!file.startsWith(ROOT) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404).end()
      return
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' })
    createReadStream(file).pipe(res)
  })
  .listen(8123, () => console.log('http://localhost:8123/landmarks.html'))
