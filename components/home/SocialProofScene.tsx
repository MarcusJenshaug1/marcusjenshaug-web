'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion/gsap'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'
import { useIsCoarsePointer } from '@/lib/motion/useIsCoarsePointer'
import { SocialProof, type ResolvedStat } from '@/components/home/SocialProof'
import type { Quote } from '@/lib/social-proof'

type Props = { stats: ResolvedStat[]; quotes: Quote[] }

function PinnedScene({ stats, quotes }: Props) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const scene = sceneRef.current
      const track = trackRef.current
      if (!scene || !track) return

      const getShift = () => Math.max(0, track.scrollWidth - window.innerWidth)

      const horizontal = gsap.to(track, {
        x: () => -getShift(),
        ease: 'none',
        scrollTrigger: {
          trigger: scene,
          start: 'top top',
          end: () => `+=${getShift()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      const numbers = gsap.utils.toArray<HTMLElement>('[data-proof-number]', track)
      const numberTriggers = numbers.map((el) => {
        const value = Number(el.dataset.value)
        const suffix = el.dataset.suffix ?? ''
        const counter = { n: 0 }
        return ScrollTrigger.create({
          trigger: el,
          containerAnimation: horizontal,
          start: 'left center',
          once: true,
          onEnter: () => {
            gsap.to(counter, {
              n: value,
              duration: 1.2,
              ease: 'power3.out',
              snap: { n: 1 },
              onUpdate: () => {
                el.textContent = `${Math.round(counter.n)}${suffix}`
              },
            })
          },
        })
      })

      return () => {
        numberTriggers.forEach((t) => t.kill())
        horizontal.scrollTrigger?.kill()
        horizontal.kill()
      }
    },
    { scope: sceneRef, dependencies: [stats, quotes] }
  )

  return (
    <div ref={sceneRef} className="proof-scene">
      <div ref={trackRef} className="proof-track">
        <div className="proof-panel proof-panel-intro">
          <span className="eyebrow">Rull →</span>
          <p className="proof-intro-text mono">Tallene bak arbeidet</p>
        </div>
        {stats.map((stat, i) => (
          <div key={stat.label} className="proof-panel">
            <span className="proof-panel-index mono">{String(i + 1).padStart(2, '0')}</span>
            <span
              className="proof-number display tabular"
              data-proof-number
              data-value={stat.value}
              data-suffix={stat.suffix ?? ''}
            >
              0{stat.suffix ?? ''}
            </span>
            <span className="proof-panel-label mono">{stat.label}</span>
          </div>
        ))}
        {quotes.map((q) => (
          <div key={q.name} className="proof-panel proof-panel-quote">
            <p className="proof-quote">«{q.quote}»</p>
            <span className="proof-quote-source mono">
              {q.name} · {q.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SocialProofScene({ stats, quotes }: Props) {
  const reduced = useReducedMotion()
  const coarse = useIsCoarsePointer()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(window.innerWidth > 768 && !coarse && !reduced)
  }, [coarse, reduced])

  if (!enabled)
    return (
      <div className="container px-5 md:px-8">
        <SocialProof stats={stats} quotes={quotes} />
      </div>
    )
  return <PinnedScene stats={stats} quotes={quotes} />
}
