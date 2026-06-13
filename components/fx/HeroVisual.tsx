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
  fallbackSrc: string
  alt: string
}

export function HeroVisual({ textureSrc, fallbackSrc, alt }: HeroVisualProps) {
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
          <HeroScene src={textureSrc} paused={!visible} onContextLost={() => setLost(true)} />
        </div>
      )}
    </div>
  )
}
