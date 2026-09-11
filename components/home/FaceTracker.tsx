'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'
import { useIsCoarsePointer } from '@/lib/motion/useIsCoarsePointer'

type Fraction = { x: number; y: number; w: number; h: number }

type Props = {
  baseSrc: string
  spriteSrc: string
  closedSrc: string
  cols: number
  rows: number
  eyes: Fraction
  alt: string
}

const REACH_X = 0.4
const REACH_Y = 0.4
const BLINK_MS = 140

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function FaceTracker({ baseSrc, spriteSrc, closedSrc, cols, rows, eyes, alt }: Props) {
  const reduced = useReducedMotion()
  const coarse = useIsCoarsePointer()
  const ref = useRef<HTMLDivElement>(null)
  const spriteRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [closed, setClosed] = useState(false)
  const active = !reduced && !coarse

  useEffect(() => {
    if (!active) return
    let cancelled = false
    Promise.all(
      [spriteSrc, closedSrc].map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new window.Image()
            img.onload = () => resolve()
            img.onerror = () => resolve()
            img.src = src
          })
      )
    ).then(() => {
      if (!cancelled) setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [active, spriteSrc, closedSrc])

  useEffect(() => {
    if (!active || !loaded) return
    const el = ref.current
    const sprite = spriteRef.current
    if (!el || !sprite) return

    const center = { ix: (cols - 1) / 2, iy: (rows - 1) / 2 }
    let hovering = false

    const setFrame = (ix: number, iy: number) => {
      sprite.style.backgroundPosition = `${(ix / (cols - 1)) * 100}% ${(iy / (rows - 1)) * 100}%`
    }

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const nx = clamp((e.clientX - cx) / (window.innerWidth * REACH_X), -1, 1)
      const ny = clamp((e.clientY - cy) / (window.innerHeight * REACH_Y), -1, 1)
      setFrame(Math.round(((nx + 1) / 2) * (cols - 1)), Math.round(((ny + 1) / 2) * (rows - 1)))

      const fx = (e.clientX - rect.left) / rect.width
      const fy = (e.clientY - rect.top) / rect.height
      const over = fx >= eyes.x && fx <= eyes.x + eyes.w && fy >= eyes.y && fy <= eyes.y + eyes.h
      if (over !== hovering) {
        hovering = over
        setClosed(over)
      }
    }

    const onLeave = () => {
      hovering = false
      setClosed(false)
      setFrame(center.ix, center.iy)
    }

    let blinkTimer: number | undefined
    let blinkReset: number | undefined
    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(() => {
        if (!hovering) {
          setClosed(true)
          blinkReset = window.setTimeout(() => setClosed(false), BLINK_MS)
        }
        scheduleBlink()
      }, 3500 + Math.random() * 4000)
    }

    setFrame(center.ix, center.iy)
    scheduleBlink()
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.clearTimeout(blinkTimer)
      window.clearTimeout(blinkReset)
    }
  }, [active, loaded, cols, rows, eyes])

  return (
    <div ref={ref} className="face-tracker hero-visual-inner">
      <Image src={baseSrc} alt={alt} fill sizes="(max-width: 768px) 100vw, 44vw" priority style={{ objectFit: 'cover' }} />
      {active && (
        <>
          <div
            ref={spriteRef}
            className="face-sprite"
            aria-hidden
            style={{
              backgroundImage: loaded ? `url(${spriteSrc})` : undefined,
              backgroundSize: `${cols * 100}% ${rows * 100}%`,
              opacity: loaded && !closed ? 1 : 0,
            }}
          />
          <div
            className="face-closed"
            aria-hidden
            style={{ backgroundImage: loaded ? `url(${closedSrc})` : undefined, opacity: loaded && closed ? 1 : 0 }}
          />
        </>
      )}
    </div>
  )
}
