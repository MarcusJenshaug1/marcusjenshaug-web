'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/motion/gsap'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'
import { useIsCoarsePointer } from '@/lib/motion/useIsCoarsePointer'

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion()
  const coarse = useIsCoarsePointer()
  const [mounted, setMounted] = useState(false)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  const active = mounted && !reduced && !coarse

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!active) return
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    if (!dot || !ring || !label) return

    document.body.classList.add('has-cursor')

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' })

    let visible = false
    const onMove = (e: PointerEvent) => {
      if (!visible) {
        visible = true
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.2 })
      }
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
    }

    const onOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        '[data-cursor], a, button, [role="button"], input, textarea, select, label'
      )
      const variant = target?.dataset.cursor ?? (target ? 'hover' : null)
      if (variant) {
        const text = target?.dataset.cursorLabel ?? ''
        label.textContent = text
        gsap.to(ring, {
          scale: text ? 2.4 : 1.6,
          backgroundColor: text ? 'var(--accent)' : 'transparent',
          duration: 0.25,
          ease: 'power2.out',
        })
        gsap.to(dot, { scale: text ? 0 : 0.6, duration: 0.25 })
      } else {
        label.textContent = ''
        gsap.to(ring, { scale: 1, backgroundColor: 'transparent', duration: 0.25 })
        gsap.to(dot, { scale: 1, duration: 0.25 })
      }
    }

    const onLeave = () => {
      visible = false
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    return () => {
      document.body.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [active])

  return (
    <>
      {children}
      {active && (
        <>
          <div ref={dotRef} className="cursor-dot" aria-hidden />
          <div ref={ringRef} className="cursor-ring" aria-hidden>
            <span ref={labelRef} className="cursor-label mono" />
          </div>
        </>
      )}
    </>
  )
}
