'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/motion/gsap'
import { prefersReducedMotion } from '@/lib/motion/useReducedMotion'

const STORAGE_KEY = 'mj-intro'

export function IntroOverlay({ name }: { name: string }) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const done = useRef(false)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      return
    }
    setShow(true)
  }, [])

  const finish = useCallback(() => {
    if (done.current) return
    done.current = true
    const el = ref.current
    if (!el) {
      setShow(false)
      return
    }
    gsap.killTweensOf(el.querySelectorAll('*'))
    gsap.to(el, {
      yPercent: -100,
      duration: 0.6,
      ease: 'power3.inOut',
      onComplete: () => setShow(false),
    })
  }, [])

  useEffect(() => {
    if (!show) return
    const el = ref.current
    if (!el) return

    const nameEl = el.querySelector('.intro-name')
    const metaEl = el.querySelector('.intro-meta')
    const timeline = gsap
      .timeline()
      .set(metaEl, { autoAlpha: 0 })
      .to(nameEl, {
        scrambleText: { text: name, chars: '01<>/\\_-[]{}#$%&', speed: 0.8 },
        duration: 0.9,
        ease: 'none',
      })
      .to(metaEl, { autoAlpha: 1, duration: 0.25 }, '-=0.2')
      .add(finish, '+=0.5')

    const skip = () => finish()
    window.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    window.addEventListener('wheel', skip, { passive: true })
    window.addEventListener('touchstart', skip, { passive: true })

    return () => {
      timeline.kill()
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchstart', skip)
    }
  }, [show, name, finish])

  if (!show) return null

  return (
    <div ref={ref} className="intro-overlay" aria-hidden>
      <div className="intro-name display display-2"> </div>
      <div className="intro-meta mono">PORTEFØLJE · OSLO · {new Date().getFullYear()}</div>
    </div>
  )
}
