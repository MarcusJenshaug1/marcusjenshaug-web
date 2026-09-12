// Lager de to lagene for hero-en:
//   public/portrett-head-alpha.png – alfa for hodelaget: personmatten × fade mot kragen (½ oppløsning)
//   public/portrett-plate.webp     – bakgrunnsplate der hode og hals er fylt inn fra bakgrunnen rundt
//
// Inn: ../../public/portrett.jpg og out/matte.png (fra matte.mjs).
//
//   node plate.mjs

import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const PORTRAIT = path.join(ROOT, 'public/portrett.jpg')
const MATTE = path.join(HERE, 'out/matte.png')

// Hodelaget dekker alt over haken og fader ut over halsen mot kragen.
const FADE_START = 0.58
const FADE_END = 0.66
const NECK_CENTER_U = 0.6
const NECK_HALF_WIDTH = 0.14
const ERODE_PX = 10
const FILL_SIGMA = 260
const SCALE = 8

const smooth = (t) => {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

// sharp gir 3 kanaler tilbake fra 1-kanals råbilder om man ikke ber om b-w eksplisitt.
const gray = (pipeline) => pipeline.toColourspace('b-w')

const { data: rgb, info } = await sharp(PORTRAIT).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const { data: matte } = await gray(sharp(MATTE)).raw().toBuffer({ resolveWithObject: true })

// Under haken snevres laget inn til halsen, så skuldre og jakke aldri er med i hodelaget.
const headAlpha = Buffer.alloc(W * H)
for (let y = 0; y < H; y++) {
  const v = y / H
  const fade = 1 - smooth((v - FADE_START) / (FADE_END - FADE_START))
  const belowChin = smooth((v - 0.5) / 0.08)
  for (let x = 0; x < W; x++) {
    const u = x / W
    const neck = 1 - smooth((Math.abs(u - NECK_CENTER_U) - NECK_HALF_WIDTH) / 0.06)
    const window = 1 - belowChin * (1 - neck)
    headAlpha[y * W + x] = Math.round(matte[y * W + x] * fade * window)
  }
}
await sharp(headAlpha, { raw: { width: W, height: H, channels: 1 } })
  .resize(Math.round(W / 2), Math.round(H / 2), { kernel: 'lanczos3' })
  .png()
  .toFile(path.join(ROOT, 'public/portrett-head-alpha.png'))

// Fyllområde: kun der hodealfaen er tilnærmet 1. Der alfaen er delvis (hårstrå, halsfaden)
// beholder platen originalpikslene, så komposittet i ro er identisk med fotoet.
const { data: eroded } = await gray(
  sharp(headAlpha, { raw: { width: W, height: H, channels: 1 } }).blur(ERODE_PX / 2)
)
  .raw()
  .toBuffer({ resolveWithObject: true })
const fillMask = Buffer.alloc(W * H)
// Fyllingen går litt utenfor silhuetten (bakgrunnen der er grå uansett), så hårstrå
// og kantpiksler ikke blir stående igjen som en tynn kontur når hodet flytter seg.
// Under haken beholder platen originalen: der fader hodelaget ut, og komposittet skal
// være identisk med fotoet i ro.
for (let y = 0; y < H; y++) {
  const aboveNeck = 1 - smooth((y / H - FADE_START + 0.02) / 0.04)
  for (let x = 0; x < W; x++) {
    const i = y * W + x
    fillMask[i] = Math.round(smooth((eroded[i] / 255 - 0.12) / 0.1) * aboveNeck * 255)
  }
}

// Normalisert konvolusjon i lav oppløsning, så én blur når helt inn til midten av hodet:
// blur(bilde × kildevekt) / blur(kildevekt). Kilden er kun ren bakgrunn (utenfor personen),
// så verken hår, skjorte eller jakke farger fyllingen. RGB og vekt blurres hver for seg
// (sharp premultipliserer alfa i RGBA-bilder).
const w8 = Math.round(W / SCALE)
const h8 = Math.round(H / SCALE)
const outsideRgb = Buffer.alloc(W * H * 3)
const outsideW = Buffer.alloc(W * H)
for (let i = 0; i < W * H; i++) {
  const w = 255 - matte[i]
  outsideW[i] = w
  for (let c = 0; c < 3; c++) outsideRgb[i * 3 + c] = Math.round((rgb[i * 3 + c] * w) / 255)
}
const lowBlur = (buf, channels) => {
  const pipeline = sharp(buf, { raw: { width: W, height: H, channels } })
    .resize(w8, h8, { fit: 'fill' })
    .blur(FILL_SIGMA / SCALE)
  return (channels === 1 ? gray(pipeline) : pipeline).raw().toBuffer()
}
const [lowRgb, lowW] = await Promise.all([lowBlur(outsideRgb, 3), lowBlur(outsideW, 1)])
const lowFilled = Buffer.alloc(w8 * h8 * 3)
for (let i = 0; i < w8 * h8; i++) {
  const wSum = Math.max(2, lowW[i])
  for (let c = 0; c < 3; c++) lowFilled[i * 3 + c] = Math.min(255, Math.round((lowRgb[i * 3 + c] * 255) / wSum))
}
const filledFull = await sharp(lowFilled, { raw: { width: w8, height: h8, channels: 3 } })
  .resize(W, H, { fit: 'fill', kernel: 'lanczos3' })
  .raw()
  .toBuffer()

const plate = Buffer.alloc(W * H * 3)
for (let i = 0; i < W * H; i++) {
  const m = fillMask[i] / 255
  for (let c = 0; c < 3; c++) {
    plate[i * 3 + c] = Math.round(rgb[i * 3 + c] * (1 - m) + filledFull[i * 3 + c] * m)
  }
}
await sharp(plate, { raw: { width: W, height: H, channels: 3 } })
  .webp({ quality: 86 })
  .toFile(path.join(ROOT, 'public/portrett-plate.webp'))

console.log(`portrett-head-alpha.png: ${Math.round(W / 2)}x${Math.round(H / 2)}, portrett-plate.webp: ${W}x${H}`)
