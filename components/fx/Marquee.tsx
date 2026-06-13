'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'

type MarqueeProps = {
  children: React.ReactNode
  duration?: number
  reverse?: boolean
  className?: string
}

export function Marquee({ children, duration = 30, reverse = false, className }: MarqueeProps) {
  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [copies, setCopies] = useState(2)

  useEffect(() => {
    if (reduced) return
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure) return

    const recalc = () => {
      const single = measure.offsetWidth
      if (!single) return
      // Hver halvdel av sporet må dekke hele containeren, ellers blir det et
      // tomt gap når translaten når -50% og loopen ser ut til å stoppe.
      const perSide = Math.max(1, Math.ceil(container.offsetWidth / single))
      setCopies(perSide * 2)
    }

    recalc()
    const ro = new ResizeObserver(recalc)
    ro.observe(container)
    ro.observe(measure)
    return () => ro.disconnect()
  }, [reduced, children])

  if (reduced) {
    return <div className={`marquee-static${className ? ` ${className}` : ''}`}>{children}</div>
  }

  return (
    <div ref={containerRef} className={`marquee${className ? ` ${className}` : ''}`}>
      <div
        className="marquee-track"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {Array.from({ length: copies }).map((_, i) => (
          <div
            key={i}
            ref={i === 0 ? measureRef : undefined}
            className="marquee-content"
            aria-hidden={i > 0}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}
