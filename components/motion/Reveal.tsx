'use client'

import { useRef } from 'react'
import { gsap, SplitText, useGSAP } from '@/lib/motion/gsap'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'
import { GSAP_EASE_OUT, DUR_BASE } from '@/lib/motion/easings'

type Variant = 'chars' | 'words' | 'lines' | 'fade'

type RevealProps = {
  children: React.ReactNode
  variant?: Variant
  delay?: number
  className?: string
}

export function Reveal({ children, variant = 'lines', delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduced) return

      if (variant === 'fade') {
        gsap.from(el, {
          y: 32,
          autoAlpha: 0,
          duration: DUR_BASE,
          delay,
          ease: GSAP_EASE_OUT,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
        return
      }

      const split = SplitText.create(el, {
        type: variant,
        mask: variant === 'lines' ? 'lines' : undefined,
        aria: 'auto',
      })
      const targets =
        variant === 'chars' ? split.chars : variant === 'words' ? split.words : split.lines

      gsap.from(targets, {
        yPercent: variant === 'lines' ? 110 : 100,
        autoAlpha: variant === 'lines' ? 1 : 0,
        duration: DUR_BASE,
        delay,
        ease: GSAP_EASE_OUT,
        stagger: variant === 'chars' ? 0.02 : variant === 'words' ? 0.04 : 0.09,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onComplete: () => split.revert(),
      })
    },
    { scope: ref, dependencies: [reduced, variant, delay] }
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
