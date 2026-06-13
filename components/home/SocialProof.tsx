'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/motion/gsap'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'
import { Reveal } from '@/components/motion/Reveal'
import type { Quote } from '@/lib/social-proof'

export type ResolvedStat = { label: string; value: number; suffix?: string }

function StatNumber({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduced) return
      const counter = { n: 0 }
      gsap.to(counter, {
        n: value,
        duration: 1.4,
        ease: 'power3.out',
        snap: { n: 1 },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => {
          el.textContent = `${Math.round(counter.n)}${suffix ?? ''}`
        },
      })
    },
    { scope: ref, dependencies: [value, suffix, reduced] }
  )

  return (
    <span ref={ref} className="stat-number display tabular">
      {value}
      {suffix ?? ''}
    </span>
  )
}

export function SocialProof({ stats, quotes }: { stats: ResolvedStat[]; quotes: Quote[] }) {
  return (
    <div className="social-proof">
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-cell">
            <StatNumber value={stat.value} suffix={stat.suffix} />
            <span className="stat-label mono">{stat.label}</span>
          </div>
        ))}
      </div>
      {quotes.length > 0 && (
        <div className="quotes-list">
          {quotes.map((q) => (
            <Reveal key={q.name} variant="lines">
              <blockquote className="quote-block">
                <p className="quote-text">«{q.quote}»</p>
                <footer className="quote-source mono">
                  {q.name} · {q.role}
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}
