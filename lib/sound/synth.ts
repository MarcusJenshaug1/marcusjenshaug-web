'use client'

export type SoundType = 'hover' | 'click' | 'toggle' | 'success'

let ctx: AudioContext | null = null
let lastHover = 0

function getContext() {
  if (typeof window === 'undefined') return null
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function blip(frequency: number, duration: number, gainDb: number, type: OscillatorType = 'sine', detune = 0) {
  const audio = getContext()
  if (!audio) return

  const osc = audio.createOscillator()
  const gain = audio.createGain()
  const now = audio.currentTime
  const peak = Math.pow(10, gainDb / 20)

  osc.type = type
  osc.frequency.value = frequency
  osc.detune.value = detune
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(now)
  osc.stop(now + duration + 0.02)
}

export function playSound(type: SoundType) {
  switch (type) {
    case 'hover': {
      const now = performance.now()
      if (now - lastHover < 80) return
      lastHover = now
      blip(1800, 0.03, -32, 'sine')
      break
    }
    case 'click':
      blip(950, 0.05, -24, 'triangle')
      blip(420, 0.08, -28, 'sine', -8)
      break
    case 'toggle':
      blip(620, 0.06, -24, 'triangle')
      break
    case 'success':
      blip(880, 0.09, -22, 'sine')
      setTimeout(() => blip(1320, 0.12, -24, 'sine'), 90)
      break
  }
}
