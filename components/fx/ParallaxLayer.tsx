'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/motion/gsap'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'

type ParallaxLayerProps = {
  children: React.ReactNode
  speed?: number
  start?: string
  end?: string
  className?: string
  ariaHidden?: boolean
}

export function ParallaxLayer({
  children,
  speed = 10,
  start = 'top bottom',
  end = 'bottom top',
  className,
  ariaHidden,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduced) return
      const trigger = el.closest<HTMLElement>('[data-parallax-root]') ?? el
      const mobile = window.matchMedia('(max-width: 768px)').matches
      const factor = mobile ? 0.45 : 1
      const tween = gsap.to(el, {
        yPercent: speed * factor,
        ease: 'none',
        scrollTrigger: { trigger, start, end, scrub: true },
      })
      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    },
    { scope: ref, dependencies: [reduced, speed, start, end] }
  )

  return (
    <div ref={ref} className={className} aria-hidden={ariaHidden}>
      {children}
    </div>
  )
}
