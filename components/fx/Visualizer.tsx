'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'

const BARS = 48
const BEAT_MS = 500

type VisualizerProps = {
  playing: boolean
  positionMs: number
}

export function Visualizer({ playing, positionMs }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const state = useRef({ playing, positionMs, syncedAt: 0, energy: 0.15 })

  state.current.playing = playing
  if (state.current.positionMs !== positionMs) {
    state.current.positionMs = positionMs
    state.current.syncedAt = performance.now()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0
    let raf = 0
    let accent = '#ff5c1f'
    let dim = '#5a5248'

    const readColors = () => {
      const styles = getComputedStyle(document.documentElement)
      accent = styles.getPropertyValue('--accent').trim() || accent
      dim = styles.getPropertyValue('--ink-4').trim() || dim
    }
    readColors()

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = (time: number) => {
      const s = state.current
      if (frame++ % 60 === 0) readColors()

      const target = s.playing ? 1 : 0.15
      s.energy += (target - s.energy) * 0.05

      const elapsed = s.playing ? time - s.syncedAt : 0
      const beatPhase = ((s.positionMs + elapsed) % BEAT_MS) / BEAT_MS
      const pulse = s.playing ? Math.exp(-beatPhase * 3.5) * 0.5 : 0

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      const barWidth = w / (BARS * 1.6)
      const gap = (w - barWidth * BARS) / (BARS - 1)

      for (let i = 0; i < BARS; i++) {
        const n =
          0.35 +
          0.3 * Math.sin(i * 0.7 + time * 0.0021) +
          0.25 * Math.sin(i * 1.9 - time * 0.0034) +
          0.1 * Math.sin(i * 4.1 + time * 0.0057)
        const centerBias = 1 - Math.abs(i / (BARS - 1) - 0.5) * 0.8
        const height = Math.max(2, (n * centerBias * (s.energy + pulse)) * h * 0.85)
        ctx.fillStyle = i % 6 === 0 ? accent : dim
        ctx.globalAlpha = 0.4 + 0.6 * Math.min(1, height / (h * 0.5))
        ctx.fillRect(i * (barWidth + gap), h - height, barWidth, height)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    if (reduced) {
      const w = canvas.width
      const h = canvas.height
      const barWidth = w / (BARS * 1.6)
      const gap = (w - barWidth * BARS) / (BARS - 1)
      ctx.fillStyle = dim
      for (let i = 0; i < BARS; i++) {
        const height = (0.2 + 0.25 * Math.abs(Math.sin(i * 0.8))) * h
        ctx.fillRect(i * (barWidth + gap), h - height, barWidth, height)
      }
    } else {
      raf = requestAnimationFrame(draw)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [reduced])

  return <canvas ref={canvasRef} className="visualizer-canvas" aria-hidden />
}
