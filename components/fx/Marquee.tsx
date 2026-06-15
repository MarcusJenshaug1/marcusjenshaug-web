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
  const [repeat, setRepeat] = useState(1)

  useEffect(() => {
    if (reduced) return
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure) return

    let raf = 0
    let tries = 0
    const recalc = () => {
      // Måles fra en absolutt-posisjonert ghost, så antallet kopier aldri
      // mater tilbake i målingen — det er det som ellers gir en runaway-loop.
      const single = measure.offsetWidth
      const available = container.clientWidth
      if (!single || !available) {
        // Layouten er ikke klar enda (f.eks. midt i hydrering). Prøv igjen
        // noen frames før vi gir opp, så vi ikke låser oss på repeat = 1.
        if (tries++ < 30) raf = requestAnimationFrame(recalc)
        return
      }
      tries = 0
      // Hver gruppe gjentas til den minst dekker hele sporet. Da kan ikke
      // translateX(-50%) avsløre et tomt gap i enden av loopen.
      setRepeat(Math.max(1, Math.ceil(available / single)))
    }

    recalc()
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf)
      tries = 0
      recalc()
    })
    ro.observe(container)
    ro.observe(measure)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [reduced])

  if (reduced) {
    return <div className={`marquee-static${className ? ` ${className}` : ''}`}>{children}</div>
  }

  return (
    <div ref={containerRef} className={`marquee${className ? ` ${className}` : ''}`}>
      <div ref={measureRef} className="marquee-measure" aria-hidden>
        {children}
      </div>
      <div
        className="marquee-track"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {[0, 1].map((group) => (
          <div className="marquee-group" key={group} aria-hidden={group === 1 || undefined}>
            {Array.from({ length: repeat }).map((_, i) => (
              <div
                key={i}
                className="marquee-content"
                aria-hidden={(group === 0 && i > 0) || undefined}
              >
                {children}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
