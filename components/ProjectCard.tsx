import Link from 'next/link'
import type { Project } from '@/lib/types/app'
import { StatusChip } from './StatusChip'

type Props = {
  project: Project
}

function formatYear(project: Project) {
  const start = project.started_at ? new Date(project.started_at).getFullYear() : null
  const end = project.ended_at ? new Date(project.ended_at).getFullYear() : null
  if (start && end && start !== end) return `${start}–${end}`
  if (start && !end) return `${start}—`
  if (start) return String(start)
  return ''
}

export function ProjectCard({ project }: Props) {
  return (
    <Link
      href={`/prosjekter/${project.slug}`}
      className="card"
      style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3>{project.title}</h3>
        <span className="mono dim" style={{ fontSize: '.75rem' }}>{formatYear(project)}</span>
      </div>
      <p style={{ color: 'var(--ink-3)', fontSize: '.9375rem', lineHeight: 1.55, flex: 1 }}>
        {project.description}
      </p>
      {project.tech_stack.length > 0 && (
        <div style={{ display: 'flex', gap: '.375rem', flexWrap: 'wrap' }}>
          {project.tech_stack.map((s) => (
            <span key={s} className="chip">{s}</span>
          ))}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '.5rem',
          borderTop: '1px dashed var(--rule)',
        }}
      >
        <span className="mono dim" style={{ fontSize: '.75rem' }}>{project.role ?? ''}</span>
        <StatusChip status={project.status} accent />
      </div>
    </Link>
  )
}
