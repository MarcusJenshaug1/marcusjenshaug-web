// Lager en myk alfa-matte av personen i portrettet (hår inkludert) med en
// bakgrunnsfjerningsmodell i transformers.js.
//
//   node matte.mjs [inn] [ut] [modell]
//
// Standard: ../../public/portrett.jpg → out/matte.png (gråtone, 255 = person).

import { pipeline, RawImage } from '@huggingface/transformers'
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const input = process.argv[2] ?? path.join(HERE, '../../public/portrett.jpg')
const output = process.argv[3] ?? path.join(HERE, 'out/matte.png')
const model = process.argv[4] ?? 'briaai/RMBG-1.4'

const remover = await pipeline('background-removal', model)
const image = await RawImage.read(input)
const [cut] = await remover(image)
mkdirSync(path.dirname(output), { recursive: true })
const rgba = Buffer.from(cut.data)
const alpha = Buffer.alloc(cut.width * cut.height)
for (let i = 0; i < cut.width * cut.height; i++) alpha[i] = rgba[i * 4 + 3]
await sharp(alpha, { raw: { width: cut.width, height: cut.height, channels: 1 } })
  .resize(image.width, image.height, { kernel: 'lanczos3' })
  .png()
  .toFile(output)
console.log(`${output}: ${image.width}x${image.height} (modell ${model}, ${cut.width}x${cut.height} rå)`)
