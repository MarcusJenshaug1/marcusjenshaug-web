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
  const [sized, setSized] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCapable(supportsWebGL())
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // R3F måler beholderen kun én gang ved montering. Vi monterer derfor scenen
  // først når boksen faktisk har en størrelse.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSized(width > 0 && height > 0)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const useScene = capable && sized && !reduced && !lost

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
          <HeroScene
            src={textureSrc}
            depthSrc={depthSrc}
            face={faceMesh}
            input={coarse ? 'scroll' : 'pointer'}
            paused={!visible}
            onContextLost={() => setLost(true)}
          />
        </div>
      )}
    </div>
  )
}
