'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/motion/gsap'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'

const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return

    const instance = new Lenis({ autoRaf: false, lerp: 0.1 })
    setLenis(instance)

    instance.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => {
      window.removeEventListener('load', onLoad)
      gsap.ticker.remove(raf)
      instance.destroy()
      setLenis(null)
    }
  }, [reduced])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
