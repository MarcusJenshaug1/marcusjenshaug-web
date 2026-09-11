// Lager dybdekart av portrettet med Depth Anything v2 (transformers.js, CPU).
//
//   cd scripts/portrait && npm install && node depth.mjs [inn] [ut] [modell]
//
// Standard: ../../public/portrett.jpg → ./out/depth-raw.png (gråtone, nær = lys),
// modell onnx-community/depth-anything-v2-base (small er glattere, large gir mer relieff).

import { pipeline, RawImage } from '@huggingface/transformers'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const input = process.argv[2] ?? path.join(HERE, '../../public/portrett.jpg')
const output = process.argv[3] ?? path.join(HERE, 'out/depth-raw.png')
const model = process.argv[4] ?? 'onnx-community/depth-anything-v2-base'

const estimator = await pipeline('depth-estimation', model, { dtype: 'fp32' })
const image = await RawImage.read(input)
const { depth } = await estimator(image)
mkdirSync(path.dirname(output), { recursive: true })
await depth.save(output)
console.log(`${output}: ${depth.width}x${depth.height}`)
