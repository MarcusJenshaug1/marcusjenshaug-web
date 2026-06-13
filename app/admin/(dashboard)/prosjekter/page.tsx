import type { Metadata } from 'next'
import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'
import { getAllProjectsAdmin } from '@/lib/projects'
import { SortableProjectList, type AdminProjectRow } from './SortableProjectList'

export const metadata: Metadata = {
  title: 'Prosjekter',
  robots: { index: false, follow: false },
}

export default async function AdminProsjekterPage() {
  const projects = await getAllProjectsAdmin()
  const rows: AdminProjectRow[] = projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    status: p.status,
    featured: p.featured,
    draft: p.draft,
    updatedLabel: new Date(p.updated_at).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }))

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem' }}>Prosjekter</h1>
          <p className="muted" style={{ fontSize: '.875rem', marginTop: '.25rem' }}>
            {projects.length} totalt · {projects.filter((p) => p.draft).length} utkast · dra for å sortere
          </p>
        </div>
        <Link href="/admin/prosjekter/ny" className="btn btn-primary btn-sm">
          <FiPlus /> Nytt prosjekt
        </Link>
      </header>

      {projects.length === 0 ? (
        <div className="card">
          <p className="muted">Ingen prosjekter enda. <Link href="/admin/prosjekter/ny" className="link">Opprett det første</Link>.</p>
        </div>
      ) : (
        <SortableProjectList projects={rows} />
      )}
    </div>
  )
}
