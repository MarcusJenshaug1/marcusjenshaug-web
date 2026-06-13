'use client'

import { useState } from 'react'
import { Marquee } from '@/components/fx/Marquee'

export type TechStackEntry = {
  name: string
  category: string
  note?: string
  projectCount: number
}

function ItemDetail({ item }: { item: TechStackEntry | null }) {
  if (!item) {
    return <span className="tech-detail-hint">Hold over et verktøy for detaljer</span>
  }
  return (
    <>
      <span className="tech-detail-name">{item.name}</span>
      {' — '}
      {item.note}
      {item.projectCount > 0 && (
        <span className="tech-detail-count">
          {' · '}brukt i {item.projectCount} {item.projectCount === 1 ? 'prosjekt' : 'prosjekter'}
        </span>
      )}
    </>
  )
}

export function TechStack({ items }: { items: TechStackEntry[] }) {
  const [hovered, setHovered] = useState<TechStackEntry | null>(null)

  const half = Math.ceil(items.length / 2)
  const rows = [items.slice(0, half), items.slice(half)]

  return (
    <div className="tech-stack" onPointerLeave={() => setHovered(null)}>
      {rows.map((row, i) => (
        <Marquee key={i} duration={38 + i * 8} reverse={i % 2 === 1} className="tech-band">
          {row.map((item) => (
            <span
              key={item.name}
              className="tech-item display"
              onPointerEnter={() => setHovered(item)}
            >
              {item.name}
              <span className="tech-item-sep" aria-hidden>
                ✕
              </span>
            </span>
          ))}
        </Marquee>
      ))}
      <div className="tech-detail mono" aria-live="polite">
        <ItemDetail item={hovered} />
      </div>
    </div>
  )
}
