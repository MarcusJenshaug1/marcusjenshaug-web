'use client'

import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { gsap } from '@/lib/motion/gsap'
import { prefersReducedMotion } from '@/lib/motion/useReducedMotion'
import { GSAP_EASE_INOUT } from '@/lib/motion/easings'

const PANELS = 3

const TransitionContext = createContext<{ navigate: (href: string) => void }>({
  navigate: () => {},
})

export function useTransition() {
  return useContext(TransitionContext)
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)
  const covering = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reveal = useCallback(() => {
    const overlay = overlayRef.current
    if (!overlay || !covering.current) return
    covering.current = false
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    const panels = overlay.querySelectorAll('.transition-panel')
    const mark = overlay.querySelector('.transition-mark')
    gsap
      .timeline({
        onComplete: () => gsap.set(overlay, { pointerEvents: 'none' }),
      })
      .to(mark, { autoAlpha: 0, duration: 0.2 }, 0)
      .to(
        panels,
        { yPercent: 101, duration: 0.5, ease: GSAP_EASE_INOUT, stagger: 0.06 },
        0.05
      )
      .set(panels, { yPercent: -101 })
  }, [])

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname) return
      const overlay = overlayRef.current
      if (prefersReducedMotion() || !overlay) {
        router.push(href)
        return
      }

      covering.current = true
      const panels = overlay.querySelectorAll('.transition-panel')
      const mark = overlay.querySelector('.transition-mark')
      gsap.set(overlay, { pointerEvents: 'auto' })
      gsap.set(panels, { yPercent: -101 })
      gsap
        .timeline({
          onComplete: () => {
            router.push(href)
            timeoutRef.current = setTimeout(reveal, 2000)
          },
        })
        .to(panels, { yPercent: 0, duration: 0.45, ease: GSAP_EASE_INOUT, stagger: 0.06 })
        .fromTo(mark, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, '-=0.2')
    },
    [pathname, router, reveal]
  )

  useEffect(() => {
    if (covering.current) {
      window.scrollTo(0, 0)
      reveal()
    }
  }, [pathname, reveal])

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div ref={overlayRef} className="transition-overlay" aria-hidden>
        {Array.from({ length: PANELS }, (_, i) => (
          <div key={i} className="transition-panel" />
        ))}
        <span className="transition-mark mono">MJ /</span>
      </div>
    </TransitionContext.Provider>
  )
}
