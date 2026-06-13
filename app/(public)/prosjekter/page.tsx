import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedProjects, countByStatus } from '@/lib/projects'
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
} from '@/lib/types/app'
import { FeaturedProjects } from '@/components/home/FeaturedProjects'
import { Reveal } from '@/components/motion/Reveal'

export const metadata: Metadata = {
  title: 'Prosjekter',
  description: 'Portefølje og prosjekter av Marcus Jenshaug.',
  alternates: { canonical: '/prosjekter' },
}

function isValidStatus(v: string | undefined): v is ProjectStatus {
  return v !== undefined && (PROJECT_STATUSES as readonly string[]).includes(v)
}

export default async function ProsjekterPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const activeStatus: ProjectStatus | 'alle' = isValidStatus(status) ? status : 'alle'

  const all = await getPublishedProjects()
  const counts = countByStatus(all)
  const list = activeStatus === 'alle' ? all : all.filter((p) => p.status === activeStatus)

  const filters: Array<{ key: ProjectStatus | 'alle'; label: string; href: string }> = [
    { key: 'alle', label: 'Alle', href: '/prosjekter' },
    ...PROJECT_STATUSES.map((s) => ({
      key: s,
      label: PROJECT_STATUS_LABELS[s],
      href: `/prosjekter?status=${s}`,
    })),
  ]

  return (
    <section className="px-5 py-12 md:px-8 md:py-16">
      <div className="container">
        <div className="page-head">
          <div className="eyebrow">CREATIVEWORK · ARKIV · {String(all.length).padStart(2, '0')}</div>
          <Reveal variant="lines">
            <h1 className="display display-2 page-title">
              Prosjekter, fra klientarbeid til sidesysler
            </h1>
          </Reveal>
          <p className="page-lede">
            Et utvalg ting jeg har designet, bygget eller hjulpet med å flytte framover.
          </p>
        </div>

        {all.length > 0 && (
          <div className="filter-row mono">
            {filters.map((f) => {
              const isActive = activeStatus === f.key
              return (
                <Link
                  key={f.key}
                  href={f.href}
                  className={`filter-chip${isActive ? ' active' : ''}`}
                >
                  {f.label}
                  <span className="filter-chip-count">{counts[f.key]}</span>
                </Link>
              )
            })}
          </div>
        )}

        {list.length === 0 ? (
          <p className="muted" style={{ marginTop: '2rem' }}>
            Ingen prosjekter{' '}
            {activeStatus === 'alle' ? 'enda' : `i kategorien «${PROJECT_STATUS_LABELS[activeStatus]}»`}.
          </p>
        ) : (
          <FeaturedProjects
            projects={list.map((p) => ({
              id: p.id,
              slug: p.slug,
              title: p.title,
              description: p.description,
              tech_stack: p.tech_stack,
              status: p.status,
              cover_image: p.cover_image,
              started_at: p.started_at,
            }))}
          />
        )}
      </div>
    </section>
  )
}
