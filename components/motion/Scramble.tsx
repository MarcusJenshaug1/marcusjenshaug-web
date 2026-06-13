'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/motion/gsap'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'

const CHARS = '01<>/\\_-[]{}#$%&'

type ScrambleProps = {
  text: string
  className?: string
  delay?: number
  duration?: number
}

export function Scramble({ text, className, delay = 0, duration = 1 }: ScrambleProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduced) return
      gsap.to(el, {
        scrambleText: { text, chars: CHARS, speed: 0.6 },
        duration,
        delay,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      })
    },
    { scope: ref, dependencies: [reduced, text, delay, duration] }
  )

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  )
}
