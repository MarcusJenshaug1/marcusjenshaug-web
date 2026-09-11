'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'
import { useIsCoarsePointer } from '@/lib/motion/useIsCoarsePointer'

const HeroScene = dynamic(() => import('@/components/fx/HeroScene'), { ssr: false })

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

type HeroVisualProps = {
  textureSrc: string
  depthSrc?: string
  faceMesh?: boolean
  fallbackSrc: string
  alt: string
}

export function HeroVisual({ textureSrc, depthSrc, faceMesh = false, fallbackSrc, alt }: HeroVisualProps) {
  const reduced = useReducedMotion()
  const coarse = useIsCoarsePointer()
  const [capable, setCapable] = useState(false)
  const [lost, setLost] = useState(false)
  const [visible, setVisible] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCapable(window.innerWidth >= 768 && supportsWebGL())
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const useScene = capable && !reduced && !coarse && !lost

  // R3F oppretter ikke scenen før react-use-measure har målt beholderen, og
  // den første målingen uteblir ofte her. Et resize-event får den til å måle.
  useEffect(() => {
    if (!useScene) return
    const timers = [200, 800, 2000].map((ms) =>
      window.setTimeout(() => window.dispatchEvent(new Event('resize')), ms)
    )
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [useScene])

  return (
    <div ref={ref} className="hero-visual-inner">
      <Image
        src={fallbackSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 44vw"
        priority
        className="hero-portrait-img"
        style={{ objectFit: 'cover' }}
      />
      {useScene && (
        <div className="hero-canvas" aria-hidden>
          <HeroScene src={textureSrc} depthSrc={depthSrc} face={faceMesh} paused={!visible} onContextLost={() => setLost(true)} />
        </div>
      )}
    </div>
  )
}
