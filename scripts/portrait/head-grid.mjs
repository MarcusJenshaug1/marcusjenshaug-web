// Lager dataene hero-scenen trenger:
//   components/fx/face/head-grid.json  – rutenett over hode og hals med relieff og vekt per vertex,
//                                        pluss iris-senter og øyebredde for begge øyne
//   public/portrett-eyes.png           – maske for øyeåpningene (polygoner fra landemerkene, myk kant)
//
// Inn: out/depth-raw.png (fra depth.mjs) og out/landmarks.json (fra landmarks.html).
//
//   node head-grid.mjs

import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const DEPTH = path.join(HERE, 'out/depth-raw.png')
const LANDMARKS = path.join(HERE, 'out/landmarks.json')

const COLS = 40
const ROWS = 52
const REGION = { x0: 0.27, x1: 0.87, y0: 0.02, y1: 0.8 }
const ELLIPSE = { cx: 0.57, cy: 0.4, rx: 0.27, ryTop: 0.38, ryBottom: 0.26 }
const INNER = 0.6
// Bakgrunnen i dybdekartet ligger på 0,02–0,10, hodet på 0,28–0,49 (skuldrene er nærmest og
// tar toppen av skalaen). Masken skal være 1 over hele hodet, så terskelen må ligge under
// hodets laveste verdi.
const HEAD_THRESHOLD = 0.14
const HEAD_SOFTNESS = 0.1

// MediaPipe Face Mesh: øyelokk-konturer og iris (468/473 = senter, 469–472/474–477 = ring)
const EYES = [
  { lids: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246], iris: 468, corners: [33, 133] },
  { lids: [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466], iris: 473, corners: [263, 362] },
]

const smooth = (t) => {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

const lm = JSON.parse(readFileSync(LANDMARKS, 'utf8'))
const meta = await sharp(DEPTH).metadata()
const W = meta.width
const H = meta.height

// Dybde: normaliser innenfor hoderegionen, blur ca. én rutenettcelle, sample ned med fill.
const left = Math.round(REGION.x0 * W)
const top = Math.round(REGION.y0 * H)
const width = Math.round((REGION.x1 - REGION.x0) * W)
const height = Math.round((REGION.y1 - REGION.y0) * H)
const cell = width / COLS
const { data, info } = await sharp(DEPTH)
  .toColourspace('b-w')
  .extract({ left, top, width, height })
  .blur(cell / 2)
  .resize(COLS, ROWS, { fit: 'fill', kernel: 'lanczos3' })
  .raw()
  .toBuffer({ resolveWithObject: true })

const raw = []
for (let i = 0; i < COLS * ROWS; i++) raw.push(data[i * info.channels] / 255)

const weight = []
const relief = []
let headMin = 1
let headMax = 0
for (let j = 0; j < ROWS; j++) {
  for (let i = 0; i < COLS; i++) {
    const k = j * COLS + i
    const u = REGION.x0 + (i / (COLS - 1)) * (REGION.x1 - REGION.x0)
    const v = REGION.y0 + (j / (ROWS - 1)) * (REGION.y1 - REGION.y0)
    const ex = (u - ELLIPSE.cx) / ELLIPSE.rx
    const ey = (v - ELLIPSE.cy) / (v < ELLIPSE.cy ? ELLIPSE.ryTop : ELLIPSE.ryBottom)
    const ellipse = smooth((1 - Math.hypot(ex, ey)) / (1 - INNER))
    const head = smooth((raw[k] - HEAD_THRESHOLD) / HEAD_SOFTNESS)
    weight.push(+(ellipse * head).toFixed(3))
    if (ellipse * head > 0.5) {
      headMin = Math.min(headMin, raw[k])
      headMax = Math.max(headMax, raw[k])
    }
  }
}
for (let k = 0; k < COLS * ROWS; k++) {
  relief.push(+Math.min(1, Math.max(0, (raw[k] - headMin) / (headMax - headMin))).toFixed(3))
}

const eyes = EYES.map((eye) => {
  const [a, b] = eye.corners.map((i) => lm.points[i])
  const iris = lm.points[eye.iris]
  return { iris: [+iris[0].toFixed(4), +iris[1].toFixed(4)], width: +Math.hypot(a[0] - b[0], a[1] - b[1]).toFixed(4) }
})

writeFileSync(
  path.join(ROOT, 'components/fx/face/head-grid.json'),
  JSON.stringify({ region: REGION, cols: COLS, rows: ROWS, relief, weight, eyes })
)

// Øyemaske: polygonene rasterisert i 1/4 oppløsning, blurret noen piksler.
const MASK_W = Math.round(W / 4)
const MASK_H = Math.round(H / 4)
const polygons = EYES.map((eye) => eye.lids.map((i) => `${(lm.points[i][0] * MASK_W).toFixed(1)},${(lm.points[i][1] * MASK_H).toFixed(1)}`).join(' '))
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${MASK_W}" height="${MASK_H}"><rect width="100%" height="100%" fill="black"/>${polygons.map((p) => `<polygon points="${p}" fill="white"/>`).join('')}</svg>`
await sharp(Buffer.from(svg)).blur(1.2).toColourspace('b-w').png().toFile(path.join(ROOT, 'public/portrett-eyes.png'))

console.log(`head-grid.json: ${COLS}x${ROWS}, hode-dybde ${headMin.toFixed(2)}–${headMax.toFixed(2)}, øyne ${JSON.stringify(eyes)}`)
console.log(`portrett-eyes.png: ${MASK_W}x${MASK_H}`)
