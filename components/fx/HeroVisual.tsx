'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/motion/gsap'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'
import { useIsCoarsePointer } from '@/lib/motion/useIsCoarsePointer'

const TILT_DEG = 7
const TILT_REACH = 0.45

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
  fallbackSrc: string
  alt: string
}

export function HeroVisual({ textureSrc, depthSrc, fallbackSrc, alt }: HeroVisualProps) {
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

  useEffect(() => {
    const el = ref.current
    if (!el || !useScene) return
    gsap.set(el, { transformPerspective: 1200 })
    const rotX = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' })
    const rotY = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' })
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const nx = gsap.utils.clamp(-1, 1, (e.clientX - (rect.left + rect.width / 2)) / (window.innerWidth * TILT_REACH))
      const ny = gsap.utils.clamp(-1, 1, (e.clientY - (rect.top + rect.height / 2)) / (window.innerHeight * TILT_REACH))
      rotY(nx * TILT_DEG)
      rotX(-ny * TILT_DEG)
    }
    const onLeave = () => {
      rotX(0)
      rotY(0)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      gsap.set(el, { clearProps: 'transform' })
    }
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
          <HeroScene src={textureSrc} depthSrc={depthSrc} paused={!visible} onContextLost={() => setLost(true)} />
        </div>
      )}
    </div>
  )
}
