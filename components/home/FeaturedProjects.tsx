'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { FiArrowUpRight } from 'react-icons/fi'
import { TransitionLink } from '@/components/motion/TransitionLink'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'
import { useIsCoarsePointer } from '@/lib/motion/useIsCoarsePointer'
import { PROJECT_STATUS_LABELS, type ProjectStatus } from '@/lib/types/app'
import type { PreviewItem } from '@/components/fx/HoverPreview'

const HoverPreview = dynamic(
  () => import('@/components/fx/HoverPreview').then((m) => m.HoverPreview),
  { ssr: false }
)

export type ProjectRowData = {
  id: string
  slug: string
  title: string
  description: string
  tech_stack: string[]
  status: ProjectStatus
  cover_image: string | null
  started_at: string | null
}

export function FeaturedProjects({ projects }: { projects: ProjectRowData[] }) {
  const [active, setActive] = useState<number | null>(null)
  const [engaged, setEngaged] = useState(false)
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null)
  const reduced = useReducedMotion()
  const coarse = useIsCoarsePointer()
  const usePreview = !reduced && !coarse

  const previewItems: PreviewItem[] = useMemo(
    () =>
      projects.map((p, i) => ({
        key: p.id,
        src: p.cover_image,
        title: p.title,
        index: i,
      })),
    [projects]
  )

  const engage = (i: number, el?: HTMLElement) => {
    setActive(i)
    setEngaged(true)
    if (el) {
      const rect = el.getBoundingClientRect()
      setFocusPoint({ x: rect.left + rect.width * 0.72, y: rect.top + rect.height / 2 })
    } else {
      setFocusPoint(null)
    }
  }

  return (
    <div
      className="project-list"
      onPointerLeave={() => setActive(null)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(null)
      }}
    >
      {projects.map((p, i) => (
        <TransitionLink
          key={p.id}
          href={`/prosjekter/${p.slug}`}
          className="project-row-xl"
          data-cursor="view"
          data-cursor-label="Åpne"
          onPointerEnter={() => engage(i)}
          onFocus={(e) => engage(i, e.currentTarget)}
        >
          <span className="project-row-index mono">00{i + 1}</span>
          <span className="project-row-main">
            <span className="project-row-title display display-3">{p.title}</span>
            <span className="project-row-desc">{p.description}</span>
          </span>
          {p.cover_image && (
            <span className="project-row-thumb">
              <Image
                src={p.cover_image}
                alt=""
                width={320}
                height={200}
                style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
              />
            </span>
          )}
          <span className="project-row-meta mono">
            <span className="project-row-status">{PROJECT_STATUS_LABELS[p.status]}</span>
            <span>{p.started_at ? new Date(p.started_at).getFullYear() : ''}</span>
            <FiArrowUpRight aria-hidden className="project-row-arrow" />
          </span>
          <span className="project-row-tech mono">{p.tech_stack.slice(0, 4).join(' · ')}</span>
        </TransitionLink>
      ))}
      {usePreview && engaged && (
        <HoverPreview items={previewItems} activeIndex={active} focusPoint={focusPoint} />
      )}
    </div>
  )
}
