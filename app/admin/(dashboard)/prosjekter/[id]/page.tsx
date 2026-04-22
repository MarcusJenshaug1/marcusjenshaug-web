import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProjectByIdAdmin } from '@/lib/projects'
import { ProjectForm } from '../ProjectForm'

export const metadata: Metadata = {
  title: 'Rediger prosjekt',
  robots: { index: false, follow: false },
}

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getProjectByIdAdmin(id)
  if (!project) notFound()

  return (
    <div>
      <nav className="mono dim" style={{ fontSize: '.75rem', marginBottom: '1rem' }}>
        <Link href="/admin/prosjekter" style={{ color: 'inherit' }}>prosjekter</Link> / <span style={{ color: 'var(--ink-2)' }}>{project.slug}</span>
      </nav>
      <header style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem' }}>{project.title}</h1>
          <p className="dim mono" style={{ fontSize: '.75rem', marginTop: '.25rem' }}>
            {project.draft ? 'Utkast' : 'Publisert'} · sist endret {new Date(project.updated_at).toLocaleString('nb-NO')}
          </p>
        </div>
      </header>
      <ProjectForm project={project} />
    </div>
  )
}
