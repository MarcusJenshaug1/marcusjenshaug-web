'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/motion/gsap'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'

type ParallaxProps = {
  children: React.ReactNode
  speed?: number
  className?: string
}

export function Parallax({ children, speed = 12, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduced) return
      const inner = el.firstElementChild
      if (!inner) return
      gsap.fromTo(
        inner,
        { yPercent: -speed / 2 },
        {
          yPercent: speed / 2,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      )
    },
    { scope: ref, dependencies: [reduced, speed] }
  )

  return (
    <div ref={ref} className={`parallax${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  )
}
