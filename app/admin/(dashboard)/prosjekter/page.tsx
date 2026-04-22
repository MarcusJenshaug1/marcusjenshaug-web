import type { Metadata } from 'next'
import Link from 'next/link'
import { FiPlus, FiEdit3, FiEye, FiEyeOff } from 'react-icons/fi'
import { getAllProjectsAdmin } from '@/lib/projects'
import { PROJECT_STATUS_LABELS } from '@/lib/types/app'
import { togglePublish } from './actions'

export const metadata: Metadata = {
  title: 'Prosjekter',
  robots: { index: false, follow: false },
}

export default async function AdminProsjekterPage() {
  const projects = await getAllProjectsAdmin()

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--rule)' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem' }}>Prosjekter</h1>
          <p className="muted" style={{ fontSize: '.875rem', marginTop: '.25rem' }}>
            {projects.length} totalt · {projects.filter((p) => p.draft).length} utkast
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
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-sunken)' }}>
                <Th>Tittel</Th>
                <Th>Status</Th>
                <Th>Synlighet</Th>
                <Th>Oppdatert</Th>
                <Th style={{ width: '1%', whiteSpace: 'nowrap' }}>&nbsp;</Th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} style={{ borderTop: '1px solid var(--rule)' }}>
                  <Td>
                    <Link href={`/admin/prosjekter/${p.id}`} style={{ fontWeight: 500 }}>{p.title}</Link>
                    <div className="dim mono" style={{ fontSize: '.75rem', marginTop: '.125rem' }}>/{p.slug}</div>
                  </Td>
                  <Td>
                    <span className="chip">{PROJECT_STATUS_LABELS[p.status]}</span>
                    {p.featured && <span className="chip chip-accent" style={{ marginLeft: '.375rem' }}>★</span>}
                  </Td>
                  <Td>
                    <form action={togglePublish.bind(null, p.id, p.draft)} style={{ display: 'inline' }}>
                      <button type="submit" className="btn btn-sm btn-ghost" title={p.draft ? 'Publiser' : 'Avpubliser'}>
                        {p.draft ? <><FiEyeOff /> Utkast</> : <><FiEye /> Publisert</>}
                      </button>
                    </form>
                  </Td>
                  <Td>
                    <span className="mono dim" style={{ fontSize: '.75rem' }}>
                      {new Date(p.updated_at).toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </Td>
                  <Td>
                    <Link href={`/admin/prosjekter/${p.id}`} className="btn btn-sm">
                      <FiEdit3 /> Rediger
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th
      style={{
        padding: '.625rem .875rem',
        textAlign: 'left',
        fontSize: '.6875rem',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '.1em',
        color: 'var(--ink-4)',
        ...style,
      }}
    >
      {children}
    </th>
  )
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: '.75rem .875rem', ...style }}>{children}</td>
}
