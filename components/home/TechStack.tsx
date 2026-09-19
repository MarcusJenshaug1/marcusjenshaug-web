'use client'

import { useState } from 'react'
import { Marquee } from '@/components/fx/Marquee'
import type { Locale } from '@/lib/i18n/config'
import { useTranslator, type Translator } from '@/lib/i18n/client'

export type TechStackEntry = {
  name: string
  category: string
  note?: string
  projectCount: number
}

function ItemDetail({ item, t }: { item: TechStackEntry | null; t: Translator }) {
  if (!item) {
    return <span className="tech-detail-hint">{t('stack.hint')}</span>
  }
  return (
    <>
      <span className="tech-detail-name">{item.name}</span>
      {' — '}
      {item.note}
      {item.projectCount > 0 && (
        <span className="tech-detail-count">
          {' · '}
          {item.projectCount === 1
            ? t('stack.usedIn.one')
            : t('stack.usedIn.other', { count: item.projectCount })}
        </span>
      )}
    </>
  )
}

type Props = {
  locale: Locale
  items: TechStackEntry[]
}

export function TechStack({ locale, items }: Props) {
  const t = useTranslator(locale)
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
        <ItemDetail item={hovered} t={t} />
      </div>
    </div>
  )
}
