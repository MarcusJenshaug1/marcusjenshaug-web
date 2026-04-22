import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedProjects, countByStatus } from '@/lib/projects'
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
} from '@/lib/types/app'

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
    <section className="px-5 py-10 md:px-8 md:py-12">
      <div className="container">
        <div className="eyebrow" style={{ marginBottom: '.75rem' }}>CREATIVEWORK · ARKIV</div>
        <h1 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500, maxWidth: '32rem' }}>
          Prosjekter, fra klientarbeid til sidesysler.
        </h1>
        <p className="muted" style={{ marginTop: '.75rem', maxWidth: '32rem' }}>
          Et utvalg ting jeg har designet, bygget eller hjulpet med å flytte framover.
        </p>

        {all.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mt-8 mb-5">
            <div className="flex flex-wrap gap-1 border border-rule rounded-md p-0.5 overflow-hidden">
              {filters.map((f) => {
                const isActive = activeStatus === f.key
                return (
                  <Link
                    key={f.key}
                    href={f.href}
                    style={{
                      background: isActive ? 'var(--ink)' : 'transparent',
                      color: isActive ? 'var(--bg)' : 'var(--ink-3)',
                      padding: '.375rem .75rem',
                      fontSize: '.8125rem',
                      borderRadius: '4px',
                    }}
                  >
                    {f.label}
                    <span style={{ opacity: 0.55, marginLeft: 4 }}>{counts[f.key]}</span>
                  </Link>
                )
              })}
            </div>
            <span className="dim mono ml-auto hidden sm:inline" style={{ fontSize: '.75rem' }}>sortert: utvalgte først</span>
          </div>
        )}

        {list.length === 0 ? (
          <div className="card" style={{ marginTop: '2rem' }}>
            <p className="muted">Ingen prosjekter {activeStatus === 'alle' ? 'enda' : `i kategorien «${PROJECT_STATUS_LABELS[activeStatus]}»`}.</p>
          </div>
        ) : (
          <div>
            {list.map((p, i) => (
              <Link
                key={p.id}
                href={`/prosjekter/${p.slug}`}
                className="project-row"
                style={{
                  borderBottom: i === list.length - 1 ? '1px solid var(--rule)' : undefined,
                }}
              >
                <span className="mono dim" style={{ fontSize: '.75rem' }}>#{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '.75rem', flexWrap: 'wrap' }}>
                    <h3 className="project-title" style={{ fontSize: '1.125rem' }}>{p.title}</h3>
                    <span className="chip">{PROJECT_STATUS_LABELS[p.status]}</span>
                    {p.featured && <span className="chip chip-accent">★ Utvalgt</span>}
                  </div>
                  <p className="muted" style={{ fontSize: '.9375rem', marginTop: '.25rem' }}>{p.description}</p>
                  {p.tech_stack.length > 0 && (
                    <div style={{ display: 'flex', gap: '.375rem', marginTop: '.5rem', flexWrap: 'wrap' }}>
                      {p.tech_stack.map((s) => (
                        <span key={s} className="chip">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="project-meta mono dim" style={{ fontSize: '.75rem', whiteSpace: 'nowrap' }}>{p.role ?? ''}</span>
                <span className="project-meta mono dim" style={{ fontSize: '.75rem', whiteSpace: 'nowrap' }}>
                  {p.started_at ? new Date(p.started_at).getFullYear() : ''}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
